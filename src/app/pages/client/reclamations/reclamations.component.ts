import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../../core/services/reclamation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reclamation } from '../../../core/models/types';

@Component({
  selector: 'app-client-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrls: ['./reclamations.component.scss'],
})
export class ClientReclamationsComponent implements OnInit {
  loading = false;
  errorMsg = '';

  reclamations: Reclamation[] = [];
  filterStatut = '';

  createOpen = false;
  saving = false;
  form: Partial<Reclamation> = {};
  formError = '';

  detailOpen = false;
  selected: Reclamation | null = null;

  confirmOpen = false;
  toDelete: Reclamation | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private reclamationService: ReclamationService, private auth: AuthService) {}

  get userId(): number {
    return this.auth.userId ?? 0;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = (data || []).filter((r) => r.userId === this.userId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger les réclamations. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  get list(): Reclamation[] {
    return this.reclamations
      .filter((r) => !this.filterStatut || (r.statut || 'EN_ATTENTE') === this.filterStatut)
      .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
  }

  statutLabel(s?: string): string {
    return s === 'RESOLUE' ? 'Résolue' : s === 'EN_TRAITEMENT' ? 'En traitement' : 'En attente';
  }
  statutClass(s?: string): string {
    return s === 'RESOLUE' ? 'badge-success' : s === 'EN_TRAITEMENT' ? 'badge-warning' : 'badge-danger';
  }
  shortDate(d?: string): string {
    return d ? d.substring(0, 10) : '';
  }

  openCreate(): void {
    this.form = { sujet: '', message: '' };
    this.formError = '';
    this.createOpen = true;
  }

  submitReclamation(): void {
    if (!this.form.sujet || !this.form.message) {
      this.formError = 'Veuillez remplir tous les champs.';
      return;
    }
    this.saving = true;
    this.reclamationService.add({
      sujet: this.form.sujet!,
      message: this.form.message!,
      statut: 'EN_ATTENTE',
      userId: this.userId,
    }).subscribe({
      next: () => { this.saving = false; this.createOpen = false; this.showToast('Réclamation envoyée'); this.load(); },
      error: () => { this.saving = false; this.formError = "Échec de l'envoi."; },
    });
  }

  openDetail(r: Reclamation): void {
    this.selected = r;
    this.detailOpen = true;
  }

  askDelete(r: Reclamation, ev: Event): void {
    ev.stopPropagation();
    this.toDelete = r;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    this.reclamationService.delete(this.toDelete.id).subscribe({
      next: () => { this.showToast('Réclamation supprimée'); this.confirmOpen = false; this.toDelete = null; this.load(); },
      error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
