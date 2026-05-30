import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth.service';
import { Commentaire, Post } from '../../../core/models/types';

@Component({
  selector: 'app-client-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss'],
})
export class ClientForumComponent implements OnInit {
  loading = false;
  errorMsg = '';

  posts: Post[] = [];
  search = '';

  createOpen = false;
  saving = false;
  form: Partial<Post> = {};
  formError = '';

  detailOpen = false;
  selected: Post | null = null;
  comments: Commentaire[] = [];
  commentsLoading = false;
  newComment = '';

  confirmOpen = false;
  toDelete: Post | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private forumService: ForumService, private auth: AuthService) {}

  get userId(): number {
    return this.auth.userId ?? 0;
  }

  get userName(): string {
    const u = this.auth.currentUser;
    return u ? `${u.prenom} ${u.nom}`.trim() : 'Utilisateur';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.forumService.getAllPosts().subscribe({
      next: (data) => { this.posts = data || []; this.loading = false; },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger le forum. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  get list(): Post[] {
    const q = this.search.toLowerCase();
    return this.posts
      .filter((p) => !q || (p.titre || '').toLowerCase().includes(q) || (p.contenu || '').toLowerCase().includes(q))
      .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
  }

  isMine(p: Post): boolean {
    return p.userId === this.userId;
  }
  shortDate(d?: string): string {
    return d ? d.substring(0, 10) : '';
  }

  openCreate(): void {
    this.form = { titre: '', contenu: '' };
    this.formError = '';
    this.createOpen = true;
  }

  submitPost(): void {
    if (!this.form.titre || !this.form.contenu) {
      this.formError = 'Veuillez remplir tous les champs.';
      return;
    }
    this.saving = true;
    this.forumService.createPost({
      titre: this.form.titre!,
      contenu: this.form.contenu!,
      auteur: this.userName,
      userId: this.userId,
    }).subscribe({
      next: () => { this.saving = false; this.createOpen = false; this.showToast('Sujet publié'); this.load(); },
      error: () => { this.saving = false; this.formError = 'Échec de la publication.'; },
    });
  }

  openDetail(p: Post): void {
    this.selected = p;
    this.newComment = '';
    this.comments = [];
    this.detailOpen = true;
    if (p.id != null) {
      this.commentsLoading = true;
      this.forumService.getCommentairesByPost(p.id).subscribe({
        next: (c) => { this.comments = c || []; this.commentsLoading = false; },
        error: () => { this.commentsLoading = false; },
      });
    }
  }

  addComment(): void {
    if (!this.selected?.id || !this.newComment.trim()) return;
    this.forumService.createCommentaire({
      contenu: this.newComment.trim(),
      auteur: this.userName,
      userId: this.userId,
      post: { id: this.selected.id },
    }).subscribe({
      next: (c) => { this.comments.push(c); this.newComment = ''; },
      error: () => this.showToast("Échec de l'ajout du commentaire", 'error'),
    });
  }

  askDelete(p: Post, ev: Event): void {
    ev.stopPropagation();
    this.toDelete = p;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    this.forumService.deletePost(this.toDelete.id).subscribe({
      next: () => { this.showToast('Sujet supprimé'); this.confirmOpen = false; this.toDelete = null; this.load(); },
      error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
