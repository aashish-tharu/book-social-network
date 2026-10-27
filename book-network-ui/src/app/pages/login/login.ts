import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthenticationRequest } from '../../services/models/authentication-request';
import { AuthenticationService } from '../../services/services/authentication.service';
import { TokenService } from '../../services/token/token';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly tokenService = inject(TokenService);

  authRequest: AuthenticationRequest = { email: '', password: '' };
  errorMsg: string[] = [];

  login(): void {
    this.errorMsg = [];

    this.authService.authenticate({ body: this.authRequest }).subscribe({
      next: (res) => {
        if (res.token) {
          this.tokenService.setToken(res.token);
          this.router.navigate(['books']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);

        if (err?.error?.validationErrors && Array.isArray(err.error.validationErrors)) {
          this.errorMsg = err.error.validationErrors;
        } else if (err?.error?.errorMsg) {
          this.errorMsg.push(err.error.errorMsg);
        } else {
          this.errorMsg.push('Something went wrong. Please try again.');
        }
      }
    });
  }

  register(): void {
    this.router.navigate(['register']);
  }
}
