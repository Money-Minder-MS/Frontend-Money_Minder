import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategorieObjectif } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CategorieObjectifService {
  private readonly base = environment.apiUrl + environment.routes.categoriesObjectif;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategorieObjectif[]> {
    return this.http.get<CategorieObjectif[]>(`${this.base}/getall`);
  }

  getById(id: number): Observable<CategorieObjectif> {
    return this.http.get<CategorieObjectif>(`${this.base}/getbyid/${id}`);
  }

  add(c: CategorieObjectif): Observable<CategorieObjectif> {
    return this.http.post<CategorieObjectif>(`${this.base}/add`, c);
  }

  update(c: CategorieObjectif): Observable<CategorieObjectif> {
    return this.http.put<CategorieObjectif>(`${this.base}/update`, c);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
