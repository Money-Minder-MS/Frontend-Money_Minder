import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionUser, UserRole, Utilisateur } from '../models/types';

const SESSION_USER_KEY = 'mm_user';
const SESSION_TOKEN_KEY = 'mm_token';
const SESSION_REFRESH_KEY = 'mm_refresh';

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface JwtPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles?: string[] };
}

/**
 * Auth via Keycloak en mode "Direct Grants" :
 * - L'UI reste 100 % côté Angular (formulaire email/password d'origine).
 * - login() POST direct sur le token endpoint Keycloak.
 * - register() crée le compte via l'endpoint backend qui appelle l'Admin API Keycloak.
 * - Le token Keycloak est stocké en localStorage et injecté en Bearer par l'intercepteur.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenUrl =
    `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/token`;
  private readonly logoutUrl =
    `${environment.keycloak.url}/realms/${environment.keycloak.realm}/protocol/openid-connect/logout`;
  private readonly usersUrl = environment.apiUrl + environment.routes.utilisateurs;

  constructor(private http: HttpClient, private router: Router) {}

  /* ---------- Session locale ---------- */
  get token(): string | null {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }

  get currentUser(): SessionUser | null {
    const raw = localStorage.getItem(SESSION_USER_KEY);
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

  /* ---------- Actions ---------- */

  /**
   * Login direct grants : POST sur /token Keycloak, puis /sync-keycloak pour
   * récupérer (ou créer) l'utilisateur local et avoir l'id Long.
   */
  login(email: string, motDePasse: string): Observable<SessionUser> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: environment.keycloak.clientId,
      username: email,
      password: motDePasse,
    });

    return this.http.post<KeycloakTokenResponse>(
      this.tokenUrl,
      body.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    ).pipe(
      switchMap((tokenResp) => {
        const accessToken = tokenResp.access_token;
        localStorage.setItem(SESSION_TOKEN_KEY, accessToken);
        if (tokenResp.refresh_token) {
          localStorage.setItem(SESSION_REFRESH_KEY, tokenResp.refresh_token);
        }

        const decoded = this.decodeJwt(accessToken);
        const roles = decoded.realm_access?.roles ?? [];

        return this.http.post<Utilisateur>(
          `${this.usersUrl}/sync-keycloak`,
          {
            keycloakSub: decoded.sub,
            email: decoded.email || email,
            nom: decoded.family_name || '',
            prenom: decoded.given_name || '',
            roles,
          },
          { headers: { Authorization: 'Bearer ' + accessToken } },
        ).pipe(
          map((u) => {
            const role: UserRole = roles.some((r) => r.toUpperCase().includes('ADMIN')) ? 'ADMIN' : 'CLIENT';
            const session: SessionUser = {
              id: u.id!,
              nom: u.nom,
              prenom: u.prenom,
              email: u.email,
              role,
              roleId: u.roleId,
            };
            this.persist(session);
            return session;
          }),
        );
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 400) {
          return throwError(() => new Error('Email ou mot de passe incorrect.'));
        }
        return throwError(() => err);
      }),
    );
  }

  /**
   * Inscription : passe par le backend qui crée le user dans Keycloak
   * (Admin API) puis en base locale. Auto-login juste après.
   */
  register(data: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    motDePasse: string;
  }): Observable<SessionUser> {
    return this.http.post<Utilisateur>(
      `${this.usersUrl}/register-keycloak`,
      data,
    ).pipe(
      switchMap(() => this.login(data.email, data.motDePasse)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409 || (typeof err.error === 'string' && err.error.includes('existe'))) {
          return throwError(() => new Error('Un compte existe déjà avec cet email.'));
        }
        if (err?.error?.message) {
          return throwError(() => new Error(err.error.message));
        }
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    const refresh = localStorage.getItem(SESSION_REFRESH_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_REFRESH_KEY);

    // Best-effort : invalider la session Keycloak. On ignore le résultat.
    if (refresh) {
      const body = new URLSearchParams({
        client_id: environment.keycloak.clientId,
        refresh_token: refresh,
      });
      this.http.post(this.logoutUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }).subscribe({ error: () => {} });
    }
    this.router.navigateByUrl('/login');
  }

  /* ---------- Helpers ---------- */
  private persist(user: SessionUser): void {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  }

  private decodeJwt(token: string): JwtPayload {
    try {
      const payload = token.split('.')[1];
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '==='.slice((b64.length + 3) % 4);
      return JSON.parse(decodeURIComponent(
        atob(padded).split('').map((c) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2),
        ).join(''),
      ));
    } catch {
      return { sub: '' };
    }
  }
}
