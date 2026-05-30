import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ReclamationService } from '../../../core/services/reclamation.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Reclamation, Utilisateur } from '../../../core/models/types';

@Component({
  selector: 'app-admin-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrls: ['./reclamations.component.scss'],
})
export class AdminReclamationsComponent implements OnInit {
  loading = false;
  errorMsg = '';

  reclamations: Reclamation[] = [];
  users: Utilisateur[] = [];

  search = '';
  filterStatut = '';

  detailOpen = false;
  selected: Reclamation | null = null;

  confirmOpen = false;
  toDelete: Reclamation | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private reclamationService: ReclamationService,
    private utilisateurService: UtilisateurService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    forkJoin({
      reclamations: this.reclamationService.getAll(),
      users: this.utilisateurService.getAll(),
    }).subscribe({
      next: (res) => {
        this.reclamations = res.reclamations || [];
        this.users = res.users || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger les réclamations. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  userName(userId: number): string {
    const u = this.users.find((x) => x.id === userId);
    return u ? `${u.prenom} ${u.nom}` : `Utilisateur #${userId}`;
  }

  get list(): Reclamation[] {
    const q = this.search.toLowerCase();
    return this.reclamations
      .filter((r) => !this.filterStatut || (r.statut || 'EN_ATTENTE') === this.filterStatut)
      .filter((r) => !q || (r.sujet || '').toLowerCase().includes(q) || this.userName(r.userId).toLowerCase().includes(q))
      .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
  }

  get countAttente(): number { return this.reclamations.filter((r) => (r.statut || 'EN_ATTENTE') === 'EN_ATTENTE').length; }
  get countTraitement(): number { return this.reclamations.filter((r) => r.statut === 'EN_TRAITEMENT').length; }
  get countResolues(): number { return this.reclamations.filter((r) => r.statut === 'RESOLUE').length; }

  statutLabel(s?: string): string {
    return s === 'RESOLUE' ? 'Résolue' : s === 'EN_TRAITEMENT' ? 'En traitement' : 'En attente';
  }
  statutClass(s?: string): string {
    return s === 'RESOLUE' ? 'badge-success' : s === 'EN_TRAITEMENT' ? 'badge-warning' : 'badge-danger';
  }
  shortDate(d?: string): string {
    return d ? d.substring(0, 10) : '';
  }

  openDetail(r: Reclamation): void {
    this.selected = r;
    this.detailOpen = true;
  }

  askDelete(r: Reclamation, ev?: Event): void {
    ev?.stopPropagation();
    this.toDelete = r;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    this.reclamationService.delete(this.toDelete.id).subscribe({
      next: () => {
        this.showToast('Réclamation supprimée');
        if (this.selected?.id === this.toDelete?.id) this.detailOpen = false;
        this.confirmOpen = false;
        this.toDelete = null;
        this.load();
      },
      error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
