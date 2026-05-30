import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reclamation } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ReclamationService {
  private readonly base = environment.apiUrl + environment.routes.reclamations;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.base);
  }

  add(r: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.base, r);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
