import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Intercepteur unique pour les requêtes sortantes :
 * - Ajoute Authorization: Bearer <token Keycloak> si l'user est loggé.
 * - Ajoute X-User-Id / X-User-Roles (utilisés par certains MS qui ne décodent
 *   pas le JWT eux-mêmes — ex. Revenue Service).
 *
 * Les requêtes vers Keycloak (token/logout) sont exclues : elles portent
 * leurs propres credentials.
 */
@Injectable()
export class UserIdInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ne pas injecter sur les appels vers Keycloak lui-même
    if (req.url.startsWith(environment.keycloak.url)) {
      return next.handle(req);
    }

    const token = this.auth.token;
    const user = this.auth.currentUser;

    if (!token && !user) {
      return next.handle(req);
    }

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (user) {
      headers['X-User-Id'] = String(user.id);
      headers['X-User-Roles'] = user.role;
    }

    return next.handle(req.clone({ setHeaders: headers }));
  }
}
