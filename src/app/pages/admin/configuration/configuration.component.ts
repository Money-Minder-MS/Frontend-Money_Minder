import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../core/models/types';

interface AppSection {
  id: number;
  nom: string;
  description: string;
  icon: string;
  active: boolean;
}

@Component({
  selector: 'app-admin-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
})
export class AdminConfigurationComponent implements OnInit {
  /** Paramètres applicatifs (front-only, conservés en localStorage) */
  app = {
    nom: 'MoneyMinder',
    devise: 'EUR',
    langue: 'Français',
    inscriptionOuverte: true,
    modeMaintenance: false,
  };

  /** Compte administrateur réel, chargé depuis le backend */
  adminUser: Utilisateur | null = null;
  admin = { nom: '', prenom: '', email: '' };
  loadingAdmin = false;
  savingAdmin = false;

  sections: AppSection[] = [
    { id: 1, nom: 'Revenues',     description: 'Gestion des revenues clients', icon: '📈', active: true },
    { id: 2, nom: 'Dépenses',     description: 'Gestion des dépenses clients', icon: '📉', active: true },
    { id: 3, nom: 'Objectifs',    description: "Objectifs d'épargne",          icon: '🎯', active: true },
    { id: 4, nom: 'Réclamations', description: 'Support et réclamations',       icon: '💬', active: true },
    { id: 5, nom: 'Forum',        description: 'Espace communautaire',          icon: '💭', active: true },
  ];

  sectionModalOpen = false;
  newSection: Partial<AppSection> = {};
  formError = '';

  confirmOpen = false;
  toDelete: AppSection | null = null;

  toast = '';
  toastType: 'success' | 'error' = 'success';

  constructor(public auth: AuthService, private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('mm_app_settings');
    if (saved) {
      try { this.app = { ...this.app, ...JSON.parse(saved) }; } catch {}
    }
    const savedSections = localStorage.getItem('mm_app_sections');
    if (savedSections) {
      try { this.sections = JSON.parse(savedSections); } catch {}
    }

    const id = this.auth.userId;
    if (id) {
      this.loadingAdmin = true;
      this.utilisateurService.getById(id).subscribe({
        next: (u) => {
          this.adminUser = u;
          this.admin = { nom: u.nom || '', prenom: u.prenom || '', email: u.email || '' };
          this.loadingAdmin = false;
        },
        error: () => { this.loadingAdmin = false; },
      });
    }
  }

  saveApp(): void {
    localStorage.setItem('mm_app_settings', JSON.stringify(this.app));
    this.showToast("Paramètres de l'application enregistrés");
  }

  saveAdmin(): void {
    if (!this.admin.nom || !this.admin.prenom || !this.admin.email) {
      this.showToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    if (!this.adminUser) {
      this.showToast('Compte administrateur introuvable', 'error');
      return;
    }
    this.savingAdmin = true;
    this.utilisateurService.update({
      ...this.adminUser,
      nom: this.admin.nom,
      prenom: this.admin.prenom,
      email: this.admin.email,
    }).subscribe({
      next: (u) => {
        this.adminUser = u;
        this.savingAdmin = false;
        this.showToast('Profil administrateur mis à jour');
      },
      error: () => {
        this.savingAdmin = false;
        this.showToast('Échec de la mise à jour', 'error');
      },
    });
  }

  private persistSections(): void {
    localStorage.setItem('mm_app_sections', JSON.stringify(this.sections));
  }

  toggleSection(s: AppSection): void {
    s.active = !s.active;
    this.persistSections();
    this.showToast(s.active ? `Section « ${s.nom} » activée` : `Section « ${s.nom} » désactivée`);
  }

  openAddSection(): void {
    this.newSection = { nom: '', description: '', icon: '📦', active: true };
    this.formError = '';
    this.sectionModalOpen = true;
  }

  saveSection(): void {
    if (!this.newSection.nom) {
      this.formError = 'Le nom de la section est obligatoire.';
      return;
    }
    this.sections.push({
      id: Math.max(0, ...this.sections.map((s) => s.id)) + 1,
      nom: this.newSection.nom!,
      description: this.newSection.description ?? '',
      icon: this.newSection.icon ?? '📦',
      active: true,
    });
    this.persistSections();
    this.sectionModalOpen = false;
    this.showToast('Nouvelle section ajoutée');
  }

  askDelete(s: AppSection): void {
    this.toDelete = s;
    this.confirmOpen = true;
  }

  confirmDelete(): void {
    if (this.toDelete) {
      this.sections = this.sections.filter((s) => s.id !== this.toDelete!.id);
      this.persistSections();
      this.showToast('Section supprimée');
    }
    this.confirmOpen = false;
    this.toDelete = null;
  }

  private showToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toast = msg;
    this.toastType = type;
    setTimeout(() => (this.toast = ''), 3000);
  }
}
