import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Utilisateur } from '../models/types';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly base = environment.apiUrl + environment.routes.utilisateurs;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.base}/getall`);
  }

  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.base}/getbyid/${id}`);
  }

  add(u: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${this.base}/add`, u);
  }

  update(u: Utilisateur): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.base}/update`, u);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
