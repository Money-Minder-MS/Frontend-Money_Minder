import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Objectif } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ObjectifService {
  private readonly base = environment.apiUrl + environment.routes.objectifs;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Objectif[]> {
    return this.http.get<Objectif[]>(`${this.base}/getall`);
  }

  getById(id: number): Observable<Objectif> {
    return this.http.get<Objectif>(`${this.base}/getbyid/${id}`);
  }

  getByUser(userId: number): Observable<Objectif[]> {
    return this.http.get<Objectif[]>(`${this.base}/byuser/${userId}`);
  }

  add(o: Objectif): Observable<Objectif> {
    return this.http.post<Objectif>(`${this.base}/add`, o);
  }

  update(o: Objectif): Observable<Objectif> {
    return this.http.put<Objectif>(`${this.base}/update`, o);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
