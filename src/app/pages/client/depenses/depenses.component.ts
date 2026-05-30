import { Component, OnInit } from '@angular/core';
import { DepenseService } from '../../../core/services/depense.service';
import { AuthService } from '../../../core/services/auth.service';
import { Depense } from '../../../core/models/types';

const CATEGORIES = ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé', 'Abonnements', 'Autre'];

@Component({
  selector: 'app-depenses',
  templateUrl: './depenses.component.html',
  styleUrls: ['./depenses.component.scss'],
})
export class DepensesComponent implements OnInit {
  categories = CATEGORIES;

  loading = false;
  depenses: Depense[] = [];

  search = '';
  filterCat = '';

  modalOpen = false;
  editing: Depense | null = null;
  form: Partial<Depense> = {};
  formError = '';

  confirmOpen = false;
  toDelete: Depense | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private depenseService: DepenseService, private auth: AuthService) {}

  get userId(): number {
    return this.auth.userId ?? 0;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.depenseService.getByUser(this.userId).subscribe({
      next: (d) => { this.depenses = d; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get list(): Depense[] {
    const q = this.search.toLowerCase();
    return this.depenses
      .filter((d) => !this.filterCat || d.categorie === this.filterCat)
      .filter((d) => !q || (d.description || '').toLowerCase().includes(q))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  get total(): number {
    return this.list.reduce((s, d) => s + (d.montant || 0), 0);
  }

  openAdd(): void {
    this.editing = null;
    this.form = {
      montant: undefined,
      description: '',
      categorie: this.categories[0],
      date: new Date().toISOString().slice(0, 10),
    };
    this.formError = '';
    this.modalOpen = true;
  }

  openEdit(d: Depense): void {
    this.editing = d;
    this.form = { ...d };
    this.formError = '';
    this.modalOpen = true;
  }

  save(): void {
    if (!this.form.description || !this.form.montant || !this.form.date || !this.form.categorie) {
      this.formError = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.form.montant <= 0) {
      this.formError = 'Le montant doit être positif.';
      return;
    }

    if (this.editing) {
      this.depenseService.update({ ...this.editing, ...this.form } as Depense).subscribe(() => {
        this.modalOpen = false;
        this.showToast('Dépense modifiée');
        this.load();
      });
    } else {
      this.depenseService.add({
        montant: this.form.montant!,
        description: this.form.description!,
        categorie: this.form.categorie!,
        date: this.form.date!,
        userId: this.userId,
      }).subscribe(() => {
        this.modalOpen = false;
        this.showToast('Dépense ajoutée');
        this.load();
      });
    }
  }

  askDelete(d: Depense): void {
    this.toDelete = d;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete) {
      this.depenseService.delete(this.toDelete.id).subscribe(() => {
        this.showToast('Dépense supprimée');
        this.confirmOpen = false;
        this.toDelete = null;
        this.load();
      });
    }
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
