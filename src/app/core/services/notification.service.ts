import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/types';
import { AuthService } from './auth.service';

const BASE = environment.apiUrl + '/api/notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  /** Source de vérité de la liste (alimentée par REST + WebSocket). */
  private readonly _notifications = new BehaviorSubject<Notification[]>([]);
  readonly notifications$: Observable<Notification[]> = this._notifications.asObservable();

  /** Émis à chaque nouvelle notif reçue via WebSocket — déclenche le toast. */
  private readonly _incoming = new Subject<Notification>();
  readonly incoming$: Observable<Notification> = this._incoming.asObservable();

  private socket: WebSocket | null = null;
  private reconnectTimer: any = null;
  private currentUserId: number | null = null;
  private intentionalClose = false;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnDestroy(): void {
    this.disconnect();
  }

  /* ─────────────────────── REST ─────────────────────── */
  loadAll(userId?: number): Observable<Notification[]> {
    const id = userId ?? this.auth.userId;
    if (id == null) return of([]);
    const params = new HttpParams().set('user_id', String(id));
    return this.http.get<Notification[]>(BASE + '/', { params }).pipe(
      tap((list) => this._notifications.next(this.sort(list))),
    );
  }

  unreadCount(): number {
    return this._notifications.value.filter((n) => !n.is_read).length;
  }

  markRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${BASE}/${id}/read/`, {}).pipe(
      tap((updated) => this.patch(updated)),
    );
  }

  markAllRead(userId?: number): Observable<unknown> {
    const id = userId ?? this.auth.userId;
    if (id == null) return of(null);
    const params = new HttpParams().set('user_id', String(id));
    return this.http.put(`${BASE}/read-all/`, {}, { params }).pipe(
      tap(() => {
        const updated = this._notifications.value.map((n) => ({ ...n, is_read: true }));
        this._notifications.next(updated);
      }),
    );
  }

  remove(id: number): Observable<unknown> {
    return this.http.delete(`${BASE}/${id}/`).pipe(
      tap(() => {
        this._notifications.next(this._notifications.value.filter((n) => n.id !== id));
      }),
    );
  }

  /* ─────────────────────── WebSocket ─────────────────────── */
  /**
   * Ouvre la WS pour le user donné. À appeler une fois après le login.
   * Idempotent : si déjà connecté au même user, no-op.
   */
  connect(userId: number): void {
    if (this.socket && this.currentUserId === userId) return;
    this.disconnect();

    this.currentUserId = userId;
    this.intentionalClose = false;

    const url = `${environment.notificationWsUrl}/${userId}/`;
    try {
      this.socket = new WebSocket(url);
    } catch (e) {
      console.warn('[Notif WS] échec ouverture', e);
      this.scheduleReconnect();
      return;
    }

    this.socket.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        // Le 1er message est un ack {message:"Connecté..."} — on l'ignore
        if (payload?.id != null && payload?.message != null) {
          const notif: Notification = payload as Notification;
          const current = this._notifications.value;
          if (!current.some((n) => n.id === notif.id)) {
            this._notifications.next(this.sort([notif, ...current]));
            this._incoming.next(notif);
          }
        }
      } catch {
        /* message non-JSON, ignoré */
      }
    };

    this.socket.onclose = () => {
      if (!this.intentionalClose) this.scheduleReconnect();
    };
    this.socket.onerror = () => {
      try { this.socket?.close(); } catch { /* noop */ }
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try { this.socket.close(); } catch { /* noop */ }
      this.socket = null;
    }
    this.currentUserId = null;
  }

  /** Reset complet (pour usage au logout). */
  clear(): void {
    this.disconnect();
    this._notifications.next([]);
  }

  /* ─────────────────────── Helpers ─────────────────────── */
  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.intentionalClose || this.currentUserId == null) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentUserId != null) this.connect(this.currentUserId);
    }, 5000);
  }

  private patch(updated: Notification): void {
    const list = this._notifications.value.map((n) => (n.id === updated.id ? updated : n));
    this._notifications.next(list);
  }

  private sort(list: Notification[]): Notification[] {
    return [...list].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }
}
