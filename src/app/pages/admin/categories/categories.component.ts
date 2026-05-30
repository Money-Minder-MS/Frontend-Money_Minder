import { Component, OnInit } from '@angular/core';
import { CategorieRevenueService } from '../../../core/services/categorie-revenue.service';
import { CategorieObjectifService } from '../../../core/services/categorie-objectif.service';
import { CategorieObjectif, CategorieRevenue } from '../../../core/models/types';

type TabKey = 'revenue' | 'objectif';

interface CatRow {
  id?: number;
  nom: string;
  description?: string;
}

@Component({
  selector: 'app-admin-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class AdminCategoriesComponent implements OnInit {
  tab: TabKey = 'revenue';

  loading = false;
  errorMsg = '';

  revenueCats: CategorieRevenue[] = [];
  objectifCats: CategorieObjectif[] = [];

  modalOpen = false;
  saving = false;
  editingId: number | null = null;
  formNom = '';
  formDescription = '';
  formError = '';

  confirmOpen = false;
  toDelete: CatRow | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private revenueCatService: CategorieRevenueService,
    private objectifCatService: CategorieObjectifService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.revenueCatService.getAll().subscribe({
      next: (c) => (this.revenueCats = c || []),
      error: () => (this.errorMsg = "Impossible de charger les catégories. L'API Gateway est-elle démarrée ?"),
    });

    this.objectifCatService.getAll().subscribe({
      next: (c) => { this.objectifCats = c || []; this.loading = false; },
      error: () => { this.loading = false; this.errorMsg = "Impossible de charger les catégories."; },
    });
  }

  get tabLabel(): string {
    return this.tab === 'revenue' ? 'revenue' : 'objectif';
  }

  /** Liste normalisée (nom/description) pour l'affichage */
  get list(): CatRow[] {
    if (this.tab === 'revenue') {
      return this.revenueCats.map((c) => ({ id: c.id, nom: c.name, description: c.description }));
    }
    return this.objectifCats.map((c) => ({ id: c.id, nom: c.nom, description: c.description }));
  }

  setTab(t: TabKey): void {
    this.tab = t;
  }

  openAdd(): void {
    this.editingId = null;
    this.formNom = '';
    this.formDescription = '';
    this.formError = '';
    this.modalOpen = true;
  }

  openEdit(c: CatRow): void {
    this.editingId = c.id ?? null;
    this.formNom = c.nom;
    this.formDescription = c.description || '';
    this.formError = '';
    this.modalOpen = true;
  }

  save(): void {
    if (!this.formNom.trim()) {
      this.formError = 'Le nom de la catégorie est obligatoire.';
      return;
    }
    this.saving = true;

    if (this.tab === 'revenue') {
      const payload: CategorieRevenue = { name: this.formNom.trim(), description: this.formDescription };
      const obs = this.editingId != null
        ? this.revenueCatService.update(this.editingId, { ...payload, id: this.editingId })
        : this.revenueCatService.add(payload);
      obs.subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Catégorie enregistrée'); this.load(); },
        error: () => { this.saving = false; this.formError = "Échec de l'enregistrement."; },
      });
    } else {
      const payload: CategorieObjectif = { nom: this.formNom.trim(), description: this.formDescription };
      const obs = this.editingId != null
        ? this.objectifCatService.update({ ...payload, id: this.editingId })
        : this.objectifCatService.add(payload);
      obs.subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Catégorie enregistrée'); this.load(); },
        error: () => { this.saving = false; this.formError = "Échec de l'enregistrement."; },
      });
    }
  }

  askDelete(c: CatRow): void {
    this.toDelete = c;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    const id = this.toDelete.id;
    const done = () => {
      this.showToast('Catégorie supprimée');
      this.confirmOpen = false;
      this.toDelete = null;
      this.load();
    };
    const fail = () => {
      this.showToast('Échec de la suppression', 'error');
      this.confirmOpen = false;
    };
    if (this.tab === 'revenue') {
      this.revenueCatService.delete(id).subscribe({ next: done, error: fail });
    } else {
      this.objectifCatService.delete(id).subscribe({ next: done, error: fail });
    }
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
