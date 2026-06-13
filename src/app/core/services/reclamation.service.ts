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
    return this.http.get<Reclamation[]>(`${this.base}/getall`);
  }

  getById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.base}/getbyid/${id}`);
  }

  getByUser(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.base}/byuser/${userId}`);
  }

  add(r: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(`${this.base}/add`, r);
  }

  update(r: Reclamation): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.base}/update`, r);
  }

  changerStatut(id: number, statut: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.base}/${id}/statut`, { statut });
  }

  repondre(id: number, reponse: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.base}/${id}/repondre`, { reponse });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
