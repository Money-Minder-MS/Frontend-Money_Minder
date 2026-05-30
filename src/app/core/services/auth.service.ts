import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, SessionUser, UserRole, Utilisateur } from '../models/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersUrl = environment.apiUrl + environment.routes.utilisateurs;
  private readonly rolesUrl = environment.apiUrl + environment.routes.roles;

  constructor(private http: HttpClient, private router: Router) {}

  /* ---------- Session ---------- */
  get token(): string | null {
    return localStorage.getItem('mm_token');
  }

  get currentUser(): SessionUser | null {
    const raw = localStorage.getItem('mm_user');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  get role(): UserRole | null {
    return this.currentUser?.role ?? null;
  }

  get userId(): number | null {
    return this.currentUser?.id ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  isAdmin(): boolean { return this.role === 'ADMIN'; }
  isClient(): boolean { return this.role === 'CLIENT'; }

  private persist(user: SessionUser): void {
    localStorage.setItem('mm_token', 'mm-' + Date.now());
    localStorage.setItem('mm_user', JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    this.router.navigateByUrl('/login');
  }

  /* ---------- Helpers ---------- */
  private roleToType(nom?: string): UserRole {
    return (nom || '').toUpperCase().includes('ADMIN') ? 'ADMIN' : 'CLIENT';
  }

  /**
   * Connexion : il n'existe pas d'endpoint d'authentification dédié.
   * On récupère la liste des utilisateurs et on compare email + mot de passe.
   * Le rôle est déduit du roleId via la liste des rôles.
   */
  login(email: string, motDePasse: string): Observable<SessionUser> {
    return forkJoin({
      users: this.http.get<Utilisateur[]>(`${this.usersUrl}/getall`),
      roles: this.http.get<Role[]>(`${this.rolesUrl}/getall`),
    }).pipe(
      map(({ users, roles }) => {
        const u = users.find(
          (x) => (x.email || '').toLowerCase() === email.trim().toLowerCase() &&
                 x.motDePasse === motDePasse
        );
        if (!u) {
          throw new Error('Email ou mot de passe incorrect.');
        }
        const role = roles.find((r) => r.id === u.roleId);
        const session: SessionUser = {
          id: u.id!,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          role: this.roleToType(role?.nom),
          roleId: u.roleId,
        };
        this.persist(session);
        return session;
      })
    );
  }

  /**
   * Inscription : crée un utilisateur avec le rôle CLIENT.
   * On cherche d'abord l'id du rôle CLIENT dans la liste des rôles.
   */
  register(data: Utilisateur): Observable<SessionUser> {
    return this.http.get<Role[]>(`${this.rolesUrl}/getall`).pipe(
      switchMap((roles) => {
        const clientRole = roles.find((r) => this.roleToType(r.nom) === 'CLIENT');
        const payload: Utilisateur = { ...data, roleId: clientRole?.id };
        return this.http.post<Utilisateur>(`${this.usersUrl}/add`, payload).pipe(
          map((created) => {
            const session: SessionUser = {
              id: created.id!,
              nom: created.nom,
              prenom: created.prenom,
              email: created.email,
              role: 'CLIENT',
              roleId: created.roleId,
            };
            this.persist(session);
            return session;
          })
        );
      })
    );
  }
}
