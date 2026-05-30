import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { RoleService } from '../../../core/services/role.service';
import { Role, Utilisateur } from '../../../core/models/types';

@Component({
  selector: 'app-admin-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss'],
})
export class AdminUtilisateursComponent implements OnInit {
  loading = false;
  errorMsg = '';

  users: Utilisateur[] = [];
  roles: Role[] = [];

  search = '';
  filterRole = 0;

  modalOpen = false;
  saving = false;
  editing: Utilisateur | null = null;
  form: Partial<Utilisateur> = {};
  formError = '';

  confirmOpen = false;
  toDelete: Utilisateur | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private utilisateurService: UtilisateurService,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    forkJoin({
      users: this.utilisateurService.getAll(),
      roles: this.roleService.getAll(),
    }).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.roles = res.roles || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = "Impossible de charger les utilisateurs. L'API Gateway est-elle démarrée ?";
      },
    });
  }

  roleName(roleId?: number): string {
    return this.roles.find((r) => r.id === roleId)?.nom ?? 'Aucun';
  }

  isAdmin(roleId?: number): boolean {
    return (this.roleName(roleId) || '').toUpperCase().includes('ADMIN');
  }

  get list(): Utilisateur[] {
    const q = this.search.toLowerCase();
    return this.users
      .filter((u) => !this.filterRole || u.roleId === this.filterRole)
      .filter((u) => {
        if (!q) return true;
        return (`${u.prenom} ${u.nom}`).toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
      });
  }

  get countAdmins(): number {
    return this.users.filter((u) => this.isAdmin(u.roleId)).length;
  }
  get countClients(): number {
    return this.users.filter((u) => !this.isAdmin(u.roleId)).length;
  }

  openAdd(): void {
    this.editing = null;
    this.form = { nom: '', prenom: '', email: '', telephone: '', motDePasse: '', roleId: this.roles[0]?.id };
    this.formError = '';
    this.modalOpen = true;
  }

  openEdit(u: Utilisateur): void {
    this.editing = u;
    this.form = { ...u };
    this.formError = '';
    this.modalOpen = true;
  }

  save(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.email) {
      this.formError = 'Nom, prénom et email sont obligatoires.';
      return;
    }
    if (!this.form.email.includes('@')) {
      this.formError = 'Adresse email invalide.';
      return;
    }
    if (!this.editing && !this.form.motDePasse) {
      this.formError = 'Le mot de passe est obligatoire pour un nouveau compte.';
      return;
    }

    this.saving = true;

    if (this.editing) {
      const payload: Utilisateur = {
        ...this.editing,
        nom: this.form.nom!,
        prenom: this.form.prenom!,
        email: this.form.email!,
        telephone: this.form.telephone,
        dateNaissance: this.form.dateNaissance,
        roleId: this.form.roleId,
        motDePasse: this.form.motDePasse || this.editing.motDePasse,
      };
      this.utilisateurService.update(payload).subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Utilisateur modifié'); this.load(); },
        error: () => { this.saving = false; this.formError = 'Échec de la modification.'; },
      });
    } else {
      this.utilisateurService.add({
        nom: this.form.nom!,
        prenom: this.form.prenom!,
        email: this.form.email!,
        telephone: this.form.telephone,
        dateNaissance: this.form.dateNaissance,
        motDePasse: this.form.motDePasse!,
        roleId: this.form.roleId,
      }).subscribe({
        next: () => { this.saving = false; this.modalOpen = false; this.showToast('Utilisateur créé'); this.load(); },
        error: () => { this.saving = false; this.formError = 'Échec de la création.'; },
      });
    }
  }

  askDelete(u: Utilisateur): void {
    this.toDelete = u;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete?.id == null) { this.confirmOpen = false; return; }
    this.utilisateurService.delete(this.toDelete.id).subscribe({
      next: () => { this.showToast('Utilisateur supprimé'); this.confirmOpen = false; this.toDelete = null; this.load(); },
      error: () => { this.showToast('Échec de la suppression', 'error'); this.confirmOpen = false; },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
