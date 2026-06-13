import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserIdInterceptor } from './core/interceptors/user-id.interceptor';

// Auth
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';

// Shared components
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from './shared/components/empty-state/empty-state.component';
import { StatCardComponent } from './shared/components/stat-card/stat-card.component';

// Layouts
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

// Client pages
import { ClientDashboardComponent } from './pages/client/dashboard/dashboard.component';
import { RevenuesComponent } from './pages/client/revenues/revenues.component';
import { DepensesComponent } from './pages/client/depenses/depenses.component';
import { ObjectifsComponent } from './pages/client/objectifs/objectifs.component';
import { ClientReclamationsComponent } from './pages/client/reclamations/reclamations.component';
import { ClientForumComponent } from './pages/client/forum/forum.component';
import { ClientProfilComponent } from './pages/client/profil/profil.component';
import { ClientNotificationsComponent } from './pages/client/notifications/notifications.component';

// Admin pages
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AdminUtilisateursComponent } from './pages/admin/utilisateurs/utilisateurs.component';
import { AdminCategoriesComponent } from './pages/admin/categories/categories.component';
import { AdminReclamationsComponent } from './pages/admin/reclamations/reclamations.component';
import { AdminForumComponent } from './pages/admin/forum/forum.component';
import { AdminConfigurationComponent } from './pages/admin/configuration/configuration.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    SidebarComponent,
    TopbarComponent,
    ModalComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    StatCardComponent,
    ClientLayoutComponent,
    AdminLayoutComponent,
    ClientDashboardComponent,
    RevenuesComponent,
    DepensesComponent,
    ObjectifsComponent,
    ClientReclamationsComponent,
    ClientForumComponent,
    ClientProfilComponent,
    ClientNotificationsComponent,
    AdminDashboardComponent,
    AdminUtilisateursComponent,
    AdminCategoriesComponent,
    AdminReclamationsComponent,
    AdminForumComponent,
    AdminConfigurationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: UserIdInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
