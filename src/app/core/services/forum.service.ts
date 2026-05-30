import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commentaire, Post } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private readonly posts = environment.apiUrl + environment.routes.posts;
  private readonly comments = environment.apiUrl + environment.routes.commentaires;

  constructor(private http: HttpClient) {}

  /* ---------- Posts ---------- */
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.posts);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.posts}/${id}`);
  }

  createPost(p: Post): Observable<Post> {
    return this.http.post<Post>(this.posts, p);
  }

  updatePost(id: number, p: Post): Observable<Post> {
    return this.http.put<Post>(`${this.posts}/${id}`, p);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.posts}/${id}`);
  }

  /* ---------- Commentaires ---------- */
  getAllCommentaires(): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(this.comments);
  }

  getCommentairesByPost(postId: number): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.comments}/post/${postId}`);
  }

  createCommentaire(c: Commentaire): Observable<Commentaire> {
    return this.http.post<Commentaire>(this.comments, c);
  }

  deleteCommentaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.comments}/${id}`);
  }
}
