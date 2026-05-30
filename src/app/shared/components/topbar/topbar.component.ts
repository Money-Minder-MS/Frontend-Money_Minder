import { Component, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  @Input() pageTitle = '';
  @Input() pageSubtitle = '';

  searchQuery = '';
  notifOpen = false;
  menuOpen = false;

  notifications = [
    { id: 1, icon: 'bell',  title: 'Nouvelle réponse',   message: 'L\'admin a répondu à votre réclamation.', date: 'il y a 2 h',   read: false },
    { id: 2, icon: 'check', title: 'Objectif atteint',    message: 'Vous avez atteint 100% de "Nouveau Mac".',  date: 'hier',       read: false },
    { id: 3, icon: 'info',  title: 'Conseil du jour',     message: 'Pensez à classer vos dépenses ce mois-ci.', date: 'il y a 3 j', read: true  },
  ];

  constructor(public auth: AuthService) {}

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get displayName(): string {
    const u = this.auth.currentUser;
    if (!u) return '';
    return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email;
  }

  toggleNotif(): void { this.notifOpen = !this.notifOpen; this.menuOpen = false; }
  toggleMenu(): void { this.menuOpen = !this.menuOpen; this.notifOpen = false; }
  markAllRead(): void { this.notifications.forEach(n => n.read = true); }
  logout(): void { this.auth.logout(); }
}
