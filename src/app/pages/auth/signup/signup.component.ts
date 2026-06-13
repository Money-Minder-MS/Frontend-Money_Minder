import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  acceptTerms = false;

  loading = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  get passwordStrength(): { score: number; label: string; color: string } {
    const pwd = this.password || '';
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Faible', color: '#EF4444' };
    if (score <= 3) return { score, label: 'Moyen', color: '#F59E0B' };
    return { score, label: 'Fort', color: '#10B981' };
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';

    if (form.invalid) {
      Object.values(form.controls).forEach((c) => c.markAsTouched());
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (!this.acceptTerms) {
      this.errorMessage = "Veuillez accepter les conditions d'utilisation.";
      return;
    }

    this.loading = true;

    this.authService
      .register({
        nom: this.nom,
        prenom: this.prenom,
        email: this.email,
        telephone: this.telephone,
        motDePasse: this.password,
      })
      .subscribe({
        next: (user) => {
          this.loading = false;
          this.router.navigateByUrl(
            user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'
          );
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.message ||
            "Création du compte impossible. Vérifiez que Keycloak et l'API Gateway sont démarrés.";
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
