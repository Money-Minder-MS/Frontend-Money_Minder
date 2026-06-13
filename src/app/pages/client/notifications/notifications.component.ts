import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Notification, NotificationType } from '../../../core/models/types';

type FilterStatut = '' | 'unread' | 'read';
type FilterType = '' | 'revenue' | 'depense' | 'objectif' | 'reclamation' | 'post';

@Component({
  selector: 'app-client-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class ClientNotificationsComponent implements OnInit, OnDestroy {
  loading = false;
  search = '';
  filterStatut: FilterStatut = '';
  filterType: FilterType = '';

  all: Notification[] = [];
  private sub = new Subscription();

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(public notif: NotificationService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loading = true;
    this.notif.loadAll(this.auth.userId ?? undefined).subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false),
    });
    this.sub.add(this.notif.notifications$.subscribe((l) => (this.all = l)));
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  /* ─────────────── Liste filtrée ─────────────── */
  get list(): Notification[] {
    const q = this.search.toLowerCase().trim();
    return this.all.filter((n) => {
      if (this.filterStatut === 'unread' && n.is_read) return false;
      if (this.filterStatut === 'read' && !n.is_read) return false;
      if (this.filterType && !this.matchType(n.type, this.filterType)) return false;
      if (q && !(n.message || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  get countAll(): number { return this.all.length; }
  get countUnread(): number { return this.all.filter((n) => !n.is_read).length; }
  get countRead(): number { return this.all.filter((n) => n.is_read).length; }

  /* ─────────────── Actions ─────────────── */
  markAllRead(): void {
    if (!this.countUnread) return;
    this.notif.markAllRead().subscribe({
      next: () => this.showToast('Toutes les notifications marquées comme lues'),
      error: () => this.showToast('Échec de la mise à jour', 'error'),
    });
  }

  toggleRead(n: Notification): void {
    if (n.is_read) return;
    this.notif.markRead(n.id).subscribe();
  }

  delete(n: Notification): void {
    this.notif.remove(n.id).subscribe({
      next: () => this.showToast('Notification supprimée'),
      error: () => this.showToast('Échec de la suppression', 'error'),
    });
  }

  resetFilters(): void {
    this.search = '';
    this.filterStatut = '';
    this.filterType = '';
  }

  /* ─────────────── Helpers ─────────────── */
  iconKind(t: NotificationType): 'revenue' | 'depense' | 'objectif' | 'reclamation' | 'post' | 'bell' {
    if (t?.includes('revenue')) return 'revenue';
    if (t?.includes('depense')) return 'depense';
    if (t?.includes('objectif')) return 'objectif';
    if (t?.includes('reclamation')) return 'reclamation';
    if (t?.includes('post')) return 'post';
    return 'bell';
  }

  typeLabel(t: NotificationType): string {
    switch (this.iconKind(t)) {
      case 'revenue':     return 'Revenu';
      case 'depense':     return 'Dépense';
      case 'objectif':    return 'Objectif';
      case 'reclamation': return 'Réclamation';
      case 'post':        return 'Forum';
      default:            return 'Notification';
    }
  }

  relativeTime(iso?: string): string {
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

  private matchType(type: NotificationType, kind: FilterType): boolean {
    return this.iconKind(type) === kind;
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 2500);
  }
}
