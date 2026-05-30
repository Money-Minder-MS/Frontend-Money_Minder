import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Revenue } from '../models/types';

@Injectable({ providedIn: 'root' })
export class RevenueService {
  private readonly base = environment.apiUrl + environment.routes.revenues;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Revenue[]> {
    return this.http.get<Revenue[]>(this.base);
  }

  getById(id: number): Observable<Revenue> {
    return this.http.get<Revenue>(`${this.base}/${id}`);
  }

  add(r: Revenue): Observable<Revenue> {
    return this.http.post<Revenue>(this.base, r);
  }

  update(id: number, r: Revenue): Observable<Revenue> {
    return this.http.put<Revenue>(`${this.base}/${id}`, r);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }
}
