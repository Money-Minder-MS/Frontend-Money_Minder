import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/types';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly base = environment.apiUrl + environment.routes.roles;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.base}/getall`);
  }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.base}/getbyid/${id}`);
  }

  add(r: Role): Observable<Role> {
    return this.http.post<Role>(`${this.base}/add`, r);
  }

  update(r: Role): Observable<Role> {
    return this.http.put<Role>(`${this.base}/update`, r);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${id}`);
  }
}
