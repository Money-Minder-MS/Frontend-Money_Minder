import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() role: 'ADMIN' | 'CLIENT' = 'CLIENT';
  collapsed = false;

  clientItems: NavItem[] = [
    { label: 'Dashboard',     icon: 'home',      route: '/client/dashboard' },
    { label: 'Mes revenues',  icon: 'trending-up', route: '/client/revenues' },
    { label: 'Mes dépenses',  icon: 'trending-down', route: '/client/depenses' },
    { label: 'Mes objectifs', icon: 'target',    route: '/client/objectifs' },
    { label: 'Réclamations',  icon: 'message-circle', route: '/client/reclamations' },
    { label: 'Forum',         icon: 'users',     route: '/client/forum' },
    { label: 'Notifications', icon: 'bell',      route: '/client/notifications' },
    { label: 'Mon profil',    icon: 'user',      route: '/client/profil' },
  ];

  adminItems: NavItem[] = [
    { label: 'Dashboard',      icon: 'home',           route: '/admin/dashboard' },
    { label: 'Utilisateurs',   icon: 'users',          route: '/admin/utilisateurs' },
    { label: 'Catégories',     icon: 'tag',            route: '/admin/categories' },
    { label: 'Réclamations',   icon: 'message-circle', route: '/admin/reclamations' },
    { label: 'Forum',          icon: 'message-square', route: '/admin/forum' },
    { label: 'Configuration',  icon: 'settings',       route: '/admin/configuration' },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  get items(): NavItem[] {
    return this.role === 'ADMIN' ? this.adminItems : this.clientItems;
  }

  get displayName(): string {
    const u = this.auth.currentUser;
    if (!u) return '';
    return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email;
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.auth.logout();
  }
}
