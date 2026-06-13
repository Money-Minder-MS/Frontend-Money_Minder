import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../core/models/types';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Input() pageTitle = '';
  @Input() pageSubtitle = '';

  searchQuery = '';
  notifOpen = false;
  menuOpen = false;

  notifications: Notification[] = [];
  toastNotif: Notification | null = null;
  private toastTimer: any = null;

  private subs = new Subscription();

  constructor(
    public auth: AuthService,
    private notif: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const uid = this.auth.userId;
    if (uid == null) return;

    // 1) Charger l'historique REST
    this.notif.loadAll(uid).subscribe();

    // 2) Ouvrir le canal WebSocket
    this.notif.connect(uid);

    // 3) S'abonner à la liste réactive (REST + WS la mettent à jour)
    this.subs.add(
      this.notif.notifications$.subscribe((list) => (this.notifications = list)),
    );

    // 4) S'abonner aux nouvelles notifs entrantes pour afficher un toast
    this.subs.add(
      this.notif.incoming$.subscribe((n) => this.showToast(n)),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  /* ─────────────── Getters ─────────────── */
  get unreadCount(): number {
    return this.notifications.filter((n) => !n.is_read).length;
  }

  get displayName(): string {
    const u = this.auth.currentUser;
    if (!u) return '';
    return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email;
  }

  get latestNotifications(): Notification[] {
    return this.notifications.slice(0, 8);
  }

  /* ─────────────── UI handlers ─────────────── */
  toggleNotif(): void { this.notifOpen = !this.notifOpen; this.menuOpen = false; }
  toggleMenu(): void { this.menuOpen = !this.menuOpen; this.notifOpen = false; }

  onNotifClick(n: Notification, ev: Event): void {
    if ((ev.target as HTMLElement).closest('.notif-actions')) return;
    if (!n.is_read) this.notif.markRead(n.id).subscribe();
  }

  markAllRead(): void { this.notif.markAllRead().subscribe(); }

  deleteNotif(n: Notification, ev: Event): void {
    ev.stopPropagation();
    this.notif.remove(n.id).subscribe();
  }

  viewAll(): void {
    this.notifOpen = false;
    this.router.navigateByUrl('/client/notifications');
  }

  logout(): void {
    this.notif.clear();
    this.auth.logout();
  }

  /* ─────────────── Type → icône / label ─────────────── */
  iconKind(t: NotificationType): 'revenue' | 'depense' | 'objectif' | 'reclamation' | 'post' | 'bell' {
    if (t?.includes('revenue')) return 'revenue';
    if (t?.includes('depense')) return 'depense';
    if (t?.includes('objectif')) return 'objectif';
    if (t?.includes('reclamation')) return 'reclamation';
    if (t?.includes('post')) return 'post';
    return 'bell';
  }

  /* ─────────────── Format temps relatif ─────────────── */
  relativeTime(iso: string | undefined | null): string {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    const diff = Math.max(0, Math.floor((Date.now() - then) / 1000));
    if (diff < 60) return `il y a ${diff}s`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `il y a ${d} j`;
    return new Date(iso).toLocaleDateString('fr-FR');
  }

  /* ─────────────── Toast ─────────────── */
  private showToast(n: Notification): void {
    this.toastNotif = n;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastNotif = null), 5000);
  }

  closeToast(): void {
    this.toastNotif = null;
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
