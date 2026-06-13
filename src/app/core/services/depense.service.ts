import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Depense } from '../models/types';

/**
 * Service Dépense — connecté au microservice Spring Boot Depense (port 8081)
 * via l'API Gateway sur /api/depenses.
 *
 * Le backend exige un champ `titre` (@NotBlank). Si l'appelant ne fournit
 * que `description`, on utilise cette valeur comme `titre` pour rester
 * compatible avec l'UI existante.
 */
@Injectable({ providedIn: 'root' })
export class DepenseService {
  private readonly base = environment.apiUrl + '/api/depenses';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Depense[]> {
    return this.http.get<Depense[]>(this.base);
  }

  getByUser(userId: number): Observable<Depense[]> {
    // Le backend n'expose pas /byuser : on filtre côté client.
    return this.getAll().pipe(
      map((list) => list.filter((d) => d.userId === userId))
    );
  }

  getById(id: number): Observable<Depense> {
    return this.http.get<Depense>(`${this.base}/${id}`);
  }

  add(d: Omit<Depense, 'id'>): Observable<Depense> {
    const payload = this.withTitre(d);
    return this.http.post<Depense>(this.base, payload);
  }

  update(d: Depense): Observable<Depense> {
    const payload = this.withTitre(d);
    return this.http.put<Depense>(`${this.base}/${d.id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  private withTitre<T extends { titre?: string; description?: string }>(d: T): T {
    if (d.titre && d.titre.trim()) return d;
    return { ...d, titre: d.description || 'Sans titre' };
  }
}
