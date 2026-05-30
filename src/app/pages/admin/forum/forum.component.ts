import { Component, OnInit } from '@angular/core';
import { ForumService } from '../../../core/services/forum.service';
import { Commentaire, Post } from '../../../core/models/types';

@Component({
  selector: 'app-admin-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.scss'],
})
export class AdminForumComponent implements OnInit {
  loading = false;
  errorMsg = '';

  posts: Post[] = [];
  allComments: Commentaire[] = [];

  search = '';

  detailOpen = false;
  selected: Post | null = null;
  comments: Commentaire[] = [];
  commentsLoading = false;

  confirmOpen = false;
  deleteMode: 'post' | 'commentaire' = 'post';
  toDeletePost: Post | null = null;
  toDeleteComment: Commentaire | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.forumService.getAllCommentaires().subscribe({
      next: (c) => (this.allComments = c || []),
      error: () => (this.allComments = []),
    });

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
      .filter((p) => !q || (p.titre || '').toLowerCase().includes(q) || (p.auteur || '').toLowerCase().includes(q))
      .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
  }

  get totalCommentaires(): number {
    return this.allComments.length;
  }

  commentCount(postId?: number): number {
    return this.allComments.filter((c) => c.post?.id === postId).length;
  }
  shortDate(d?: string): string {
    return d ? d.substring(0, 10) : '';
  }

  openDetail(p: Post): void {
    this.selected = p;
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

  askDeletePost(p: Post, ev?: Event): void {
    ev?.stopPropagation();
    this.deleteMode = 'post';
    this.toDeletePost = p;
    this.confirmOpen = true;
  }

  askDeleteComment(c: Commentaire): void {
    this.deleteMode = 'commentaire';
    this.toDeleteComment = c;
    this.confirmOpen = true;
  }

  get confirmTitle(): string {
    return this.deleteMode === 'post' ? 'Supprimer ce sujet ?' : 'Supprimer ce commentaire ?';
  }
  get confirmMsg(): string {
    return this.deleteMode === 'post'
      ? `« ${this.toDeletePost?.titre ?? ''} » et ses commentaires seront supprimés.`
      : 'Ce commentaire sera définitivement supprimé.';
  }

  confirmDelete(): void {
    if (this.deleteMode === 'post' && this.toDeletePost?.id != null) {
      this.forumService.deletePost(this.toDeletePost.id).subscribe({
        next: () => {
          this.showToast('Sujet supprimé');
          if (this.selected?.id === this.toDeletePost?.id) this.detailOpen = false;
          this.finishDelete();
        },
        error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
      });
    } else if (this.deleteMode === 'commentaire' && this.toDeleteComment?.id != null) {
      this.forumService.deleteCommentaire(this.toDeleteComment.id).subscribe({
        next: () => {
          this.comments = this.comments.filter((c) => c.id !== this.toDeleteComment?.id);
          this.allComments = this.allComments.filter((c) => c.id !== this.toDeleteComment?.id);
          this.showToast('Commentaire supprimé');
          this.confirmOpen = false;
          this.toDeleteComment = null;
        },
        error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
      });
    } else {
      this.confirmOpen = false;
    }
  }

  private finishDelete(): void {
    this.confirmOpen = false;
    this.toDeletePost = null;
    this.load();
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
