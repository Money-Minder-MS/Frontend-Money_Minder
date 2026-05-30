import { Component, OnInit } from '@angular/core';
import { RevenueService } from '../../../core/services/revenue.service';
import { CategorieRevenueService } from '../../../core/services/categorie-revenue.service';
import { AuthService } from '../../../core/services/auth.service';
import { CategorieRevenue, Revenue } from '../../../core/models/types';

const PALETTE = ['#3D9B8E', '#1B3A57', '#5FBEAB', '#F59E0B', '#8B5CF6', '#0EA5E9', '#10B981', '#EF4444'];

@Component({
  selector: 'app-revenues',
  templateUrl: './revenues.component.html',
  styleUrls: ['./revenues.component.scss'],
})
export class RevenuesComponent implements OnInit {
  loading = false;
  errorMsg = '';

  revenues: Revenue[] = [];
  categories: CategorieRevenue[] = [];

  search = '';
  filterCat = 0;

  modalOpen = false;
  saving = false;
  editing: Revenue | null = null;
  form: Partial<Revenue> = {};
  formError = '';

  confirmOpen = false;
  toDelete: Revenue | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private revenueService: RevenueService,
    private categorieService: CategorieRevenueService,
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

    this.revenueService.getAll().subscribe({
      next: (data) => {
        this.revenues = data.filter((r) => r.userId === this.userId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger les revenues. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  get list(): Revenue[] {
    const q = this.search.toLowerCase();
    return this.revenues
      .filter((r) => !this.filterCat || r.categoryId === this.filterCat)
      .filter((r) => !q || (r.description || '').toLowerCase().includes(q) || (r.source || '').toLowerCase().includes(q))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  get total(): number {
    return this.list.reduce((s, r) => s + (r.amount || 0), 0);
  }

  catName(id: number): string {
    return this.categories.find((c) => c.id === id)?.name ?? 'Sans catégorie';
  }

  catColor(id: number): string {
    const idx = this.categories.findIndex((c) => c.id === id);
    return PALETTE[idx >= 0 ? idx % PALETTE.length : 0];
  }

  openAdd(): void {
    this.editing = null;
    this.form = {
      amount: undefined,
      source: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      categoryId: this.categories[0]?.id,
    };
    this.formError = '';
    this.modalOpen = true;
  }

  openEdit(r: Revenue): void {
    this.editing = r;
    this.form = { ...r };
    this.formError = '';
    this.modalOpen = true;
  }

  save(): void {
    if (!this.form.description || !this.form.amount || !this.form.date || !this.form.categoryId) {
      this.formError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (this.form.amount <= 0) {
      this.formError = 'Le montant doit être positif.';
      return;
    }

    const payload: Revenue = {
      amount: this.form.amount!,
      source: this.form.source || '',
      description: this.form.description!,
      date: this.form.date!,
      categoryId: this.form.categoryId!,
      userId: this.userId,
    };

    this.saving = true;

    if (this.editing && this.editing.id != null) {
      this.revenueService.update(this.editing.id, { ...payload, id: this.editing.id }).subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Revenue modifié'); this.load(); },
        error: () => { this.saving = false; this.formError = 'Échec de la modification.'; },
      });
    } else {
      this.revenueService.add(payload).subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Revenue ajouté'); this.load(); },
        error: () => { this.saving = false; this.formError = "Échec de l'ajout."; },
      });
    }
  }

  askDelete(r: Revenue): void {
    this.toDelete = r;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    this.revenueService.delete(this.toDelete.id).subscribe({
      next: () => { this.showToast('Revenue supprimé'); this.confirmOpen = false; this.toDelete = null; this.load(); },
      error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
