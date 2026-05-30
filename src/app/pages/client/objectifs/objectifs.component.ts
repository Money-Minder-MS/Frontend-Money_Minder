import { Component, OnInit } from '@angular/core';
import { ObjectifService } from '../../../core/services/objectif.service';
import { CategorieObjectifService } from '../../../core/services/categorie-objectif.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategorieObjectif, Objectif } from '../../../core/models/types';

@Component({
  selector: 'app-objectifs',
  templateUrl: './objectifs.component.html',
  styleUrls: ['./objectifs.component.scss'],
})
export class ObjectifsComponent implements OnInit {
  frequences = ['MENSUELLE', 'TRIMESTRIELLE', 'ANNUELLE'];
  statuts = ['EN_COURS', 'ATTEINT', 'ABANDONNE'];

  loading = false;
  errorMsg = '';

  objectifs: Objectif[] = [];
  categories: CategorieObjectif[] = [];

  search = '';
  filterStatut = '';

  modalOpen = false;
  saving = false;
  editing: Objectif | null = null;
  form: Partial<Objectif> = {};
  formError = '';

  confirmOpen = false;
  toDelete: Objectif | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private objectifService: ObjectifService,
    private categorieService: CategorieObjectifService,
    private auth: AuthService,
  ) {}

  get userId(): number {
    return this.auth.userId ?? 0;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.categorieService.getAll().subscribe({
      next: (c) => (this.categories = c),
      error: () => (this.categories = []),
    });

    this.objectifService.getByUser(this.userId).subscribe({
      next: (data) => { this.objectifs = data || []; this.loading = false; },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger les objectifs. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  get list(): Objectif[] {
    const q = this.search.toLowerCase();
    return this.objectifs
      .filter((o) => !this.filterStatut || o.statut === this.filterStatut)
      .filter((o) => !q || (o.titre || '').toLowerCase().includes(q));
  }

  get countActifs(): number {
    return this.objectifs.filter((o) => o.statut === 'EN_COURS').length;
  }
  get countAtteints(): number {
    return this.objectifs.filter((o) => o.statut === 'ATTEINT').length;
  }

  catName(id: number): string {
    return this.categories.find((c) => c.id === id)?.nom ?? 'Sans catégorie';
  }

  statutLabel(s: string): string {
    return s === 'ATTEINT' ? 'Atteint' : s === 'ABANDONNE' ? 'Abandonné' : 'En cours';
  }
  statutClass(s: string): string {
    return s === 'ATTEINT' ? 'badge-success' : s === 'ABANDONNE' ? 'badge-neutral' : 'badge-info';
  }

  openAdd(): void {
    this.editing = null;
    const now = new Date();
    this.form = {
      titre: '',
      montantGlobal: undefined,
      frequence: 'MENSUELLE',
      mensualite: undefined,
      mois: now.getMonth() + 1,
      annee: now.getFullYear(),
      commentaire: '',
      statut: 'EN_COURS',
      categorieId: this.categories[0]?.id,
    };
    this.formError = '';
    this.modalOpen = true;
  }

  openEdit(o: Objectif): void {
    this.editing = o;
    this.form = { ...o };
    this.formError = '';
    this.modalOpen = true;
  }

  save(): void {
    if (!this.form.titre || !this.form.montantGlobal || !this.form.categorieId) {
      this.formError = 'Titre, montant global et catégorie sont obligatoires.';
      return;
    }
    if (this.form.montantGlobal <= 0) {
      this.formError = 'Le montant global doit être positif.';
      return;
    }

    const payload: Objectif = {
      titre: this.form.titre!,
      montantGlobal: this.form.montantGlobal!,
      frequence: this.form.frequence || 'MENSUELLE',
      mensualite: this.form.mensualite || 0,
      mois: this.form.mois || 1,
      annee: this.form.annee || new Date().getFullYear(),
      commentaire: this.form.commentaire || '',
      statut: this.form.statut || 'EN_COURS',
      categorieId: this.form.categorieId!,
      userId: this.userId,
    };

    this.saving = true;

    if (this.editing && this.editing.id != null) {
      this.objectifService.update({ ...payload, id: this.editing.id }).subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Objectif modifié'); this.load(); },
        error: () => { this.saving = false; this.formError = 'Échec de la modification.'; },
      });
    } else {
      this.objectifService.add(payload).subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Objectif créé'); this.load(); },
        error: () => { this.saving = false; this.formError = 'Échec de la création.'; },
      });
    }
  }

  askDelete(o: Objectif): void {
    this.toDelete = o;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    this.objectifService.delete(this.toDelete.id).subscribe({
      next: () => { this.showToast('Objectif supprimé'); this.confirmOpen = false; this.toDelete = null; this.load(); },
      error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
