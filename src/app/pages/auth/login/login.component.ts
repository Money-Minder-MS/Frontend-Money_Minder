import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = true;
  showPassword = false;

  loading = false;
  errorMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';
    if (form.invalid) {
      Object.values(form.controls).forEach((c) => c.markAsTouched());
      return;
    }

    this.loading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigateByUrl(
          user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard'
        );
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.message === 'Email ou mot de passe incorrect.'
            ? err.message
            : "Connexion impossible. Vérifiez que l'API Gateway et Keycloak sont démarrés.";
      },
    });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
