import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return false;
    }
    const expectedRole = route.data?.['role'] as UserRole | undefined;
    if (expectedRole && this.auth.role !== expectedRole) {
      const fallback = this.auth.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard';
      this.router.navigateByUrl(fallback);
      return false;
    }
    return true;
  }
}
