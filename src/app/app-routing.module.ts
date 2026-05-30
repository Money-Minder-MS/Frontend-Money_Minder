import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';

import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';

import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

import { ClientDashboardComponent } from './pages/client/dashboard/dashboard.component';
import { RevenuesComponent } from './pages/client/revenues/revenues.component';
import { DepensesComponent } from './pages/client/depenses/depenses.component';
import { ObjectifsComponent } from './pages/client/objectifs/objectifs.component';
import { ClientReclamationsComponent } from './pages/client/reclamations/reclamations.component';
import { ClientForumComponent } from './pages/client/forum/forum.component';
import { ClientProfilComponent } from './pages/client/profil/profil.component';

import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminUtilisateursComponent } from './pages/admin/utilisateurs/utilisateurs.component';
import { AdminCategoriesComponent } from './pages/admin/categories/categories.component';
import { AdminReclamationsComponent } from './pages/admin/reclamations/reclamations.component';
import { AdminForumComponent } from './pages/admin/forum/forum.component';
import { AdminConfigurationComponent } from './pages/admin/configuration/configuration.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'client',
    component: ClientLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'CLIENT' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: ClientDashboardComponent,    data: { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de vos finances' } },
      { path: 'revenues',     component: RevenuesComponent,           data: { title: 'Mes revenues', subtitle: 'Gérez vos rentrées d\'argent' } },
      { path: 'depenses',     component: DepensesComponent,           data: { title: 'Mes dépenses', subtitle: 'Suivez vos sorties d\'argent' } },
      { path: 'objectifs',    component: ObjectifsComponent,          data: { title: 'Mes objectifs', subtitle: 'Suivez vos objectifs d\'épargne' } },
      { path: 'reclamations', component: ClientReclamationsComponent, data: { title: 'Mes réclamations', subtitle: 'Contactez le support' } },
      { path: 'forum',        component: ClientForumComponent,        data: { title: 'Forum', subtitle: 'Échangez avec la communauté' } },
      { path: 'profil',       component: ClientProfilComponent,       data: { title: 'Mon profil', subtitle: 'Gérez votre compte' } },
    ],
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',     component: AdminDashboardComponent,     data: { title: 'Tableau de bord', subtitle: 'Statistiques de la plateforme' } },
      { path: 'utilisateurs',  component: AdminUtilisateursComponent,  data: { title: 'Utilisateurs', subtitle: 'Gérez les comptes utilisateurs' } },
      { path: 'categories',    component: AdminCategoriesComponent,    data: { title: 'Catégories', subtitle: 'Catégories globales de l\'application' } },
      { path: 'reclamations',  component: AdminReclamationsComponent,  data: { title: 'Réclamations', subtitle: 'Traitez les demandes des clients' } },
      { path: 'forum',         component: AdminForumComponent,         data: { title: 'Modération du forum', subtitle: 'Surveillez les discussions' } },
      { path: 'configuration', component: AdminConfigurationComponent, data: { title: 'Configuration', subtitle: 'Paramètres de l\'application' } },
    ],
  },

  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
