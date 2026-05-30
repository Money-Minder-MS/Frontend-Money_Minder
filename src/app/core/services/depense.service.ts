import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Depense } from '../models/types';

/**
 * Service Dépense — AUCUN microservice backend n'existe pour les dépenses.
 * Les données sont persistées en localStorage en attendant la création
 * du microservice. L'API (Observable) est identique à un service HTTP,
 * il suffira de remplacer le corps des méthodes le moment venu.
 */
@Injectable({ providedIn: 'root' })
export class DepenseService {
  private readonly storageKey = 'mm_depenses';

  private read(): Depense[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  private write(list: Depense[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
  }

  getByUser(userId: number): Observable<Depense[]> {
    return of(this.read().filter((d) => d.userId === userId));
  }

  getAll(): Observable<Depense[]> {
    return of(this.read());
  }

  add(d: Omit<Depense, 'id'>): Observable<Depense> {
    const list = this.read();
    const created: Depense = { ...d, id: list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1 };
    list.push(created);
    this.write(list);
    return of(created);
  }

  update(d: Depense): Observable<Depense> {
    const list = this.read();
    const i = list.findIndex((x) => x.id === d.id);
    if (i >= 0) list[i] = d;
    this.write(list);
    return of(d);
  }

  delete(id: number): Observable<void> {
    this.write(this.read().filter((x) => x.id !== id));
    return of(void 0);
  }
}
