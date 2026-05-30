import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { RevenueService } from '../../../core/services/revenue.service';
import { ObjectifService } from '../../../core/services/objectif.service';
import { DepenseService } from '../../../core/services/depense.service';
import { AuthService } from '../../../core/services/auth.service';
import { Utilisateur } from '../../../core/models/types';

@Component({
  selector: 'app-client-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
})
export class ClientProfilComponent implements OnInit {
  loading = false;
  errorMsg = '';

  user: Utilisateur | null = null;

  form: { nom: string; prenom: string; email: string; telephone: string; dateNaissance: string } = {
    nom: '', prenom: '', email: '', telephone: '', dateNaissance: '',
  };

  pwd = { next: '', confirm: '' };
  pwdError = '';

  savingProfile = false;
  savingPwd = false;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  stats = { revenues: 0, depenses: 0, objectifs: 0 };

  constructor(
    private utilisateurService: UtilisateurService,
    private revenueService: RevenueService,
    private objectifService: ObjectifService,
    private depenseService: DepenseService,
    private auth: AuthService,
  ) {}

  get userId(): number {
    return this.auth.userId ?? 0;
  }

  get initials(): string {
    return ((this.form.prenom[0] ?? '') + (this.form.nom[0] ?? '')).toUpperCase();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';

    this.utilisateurService.getById(this.userId).subscribe({
      next: (u) => {
        this.user = u;
        this.form = {
          nom: u.nom || '',
          prenom: u.prenom || '',
          email: u.email || '',
          telephone: u.telephone || '',
          dateNaissance: u.dateNaissance || '',
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Impossible de charger votre profil.';
      },
    });

    this.revenueService.getAll().subscribe({
      next: (r) => (this.stats.revenues = r.filter((x) => x.userId === this.userId).length),
      error: () => {},
    });
    this.objectifService.getByUser(this.userId).subscribe({
      next: (o) => (this.stats.objectifs = (o || []).length),
      error: () => {},
    });
    this.depenseService.getByUser(this.userId).subscribe({
      next: (d) => (this.stats.depenses = d.length),
    });
  }

  saveProfile(): void {
    if (!this.form.nom || !this.form.prenom || !this.form.email) {
      this.showToast('Veuillez remplir les champs obligatoires', 'error');
      return;
    }
    if (!this.user) return;

    this.savingProfile = true;
    const payload: Utilisateur = {
      ...this.user,
      nom: this.form.nom,
      prenom: this.form.prenom,
      email: this.form.email,
      telephone: this.form.telephone,
      dateNaissance: this.form.dateNaissance || undefined,
    };

    this.utilisateurService.update(payload).subscribe({
      next: (u) => {
        this.savingProfile = false;
        this.user = u;
        this.showToast('Profil mis à jour avec succès');
      },
      error: () => {
        this.savingProfile = false;
        this.showToast('Échec de la mise à jour', 'error');
      },
    });
  }

  changePassword(): void {
    this.pwdError = '';
    if (!this.pwd.next || !this.pwd.confirm) {
      this.pwdError = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.pwd.next.length < 6) {
      this.pwdError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (this.pwd.next !== this.pwd.confirm) {
      this.pwdError = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (!this.user) return;

    this.savingPwd = true;
    this.utilisateurService.update({ ...this.user, motDePasse: this.pwd.next }).subscribe({
      next: (u) => {
        this.savingPwd = false;
        this.user = u;
        this.pwd = { next: '', confirm: '' };
        this.showToast('Mot de passe modifié avec succès');
      },
      error: () => {
        this.savingPwd = false;
        this.pwdError = 'Échec de la modification.';
      },
    });
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
