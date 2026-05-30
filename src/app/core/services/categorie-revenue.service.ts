import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategorieRevenue } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CategorieRevenueService {
  private readonly base = environment.apiUrl + environment.routes.categoriesRevenue;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategorieRevenue[]> {
    return this.http.get<CategorieRevenue[]>(this.base);
  }

  getById(id: number): Observable<CategorieRevenue> {
    return this.http.get<CategorieRevenue>(`${this.base}/${id}`);
  }

  add(c: CategorieRevenue): Observable<CategorieRevenue> {
    return this.http.post<CategorieRevenue>(this.base, c);
  }

  update(id: number, c: CategorieRevenue): Observable<CategorieRevenue> {
    return this.http.put<CategorieRevenue>(`${this.base}/${id}`, c);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }
}
