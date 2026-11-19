import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
  private readonly changeDetector = inject(ChangeDetectorRef);

  authRequest: AuthenticationRequest = { email: '', password: '' };
  errorMsg: string[] = [];
  isLoggingIn = false;

  login(): void {
    this.errorMsg = [];
    this.isLoggingIn = true;
    this.tokenService.removeToken();

    this.authService.authenticate({ body: this.authRequest }).subscribe({
      next: (res) => {
        this.isLoggingIn = false;
        if (res.token) {
          this.tokenService.setToken(res.token);
          void this.router.navigate(['/books']);
        } else {
          this.errorMsg.push('The server did not return a valid access token.');
        }
        this.changeDetector.markForCheck();
      },
      error: (err) => {
        this.isLoggingIn = false;
        console.error('Login error:', err);

        if (err?.error?.validationErrors && Array.isArray(err.error.validationErrors)) {
          this.errorMsg = err.error.validationErrors;
        } else if (err?.error?.errorMsg) {
          this.errorMsg.push(err.error.errorMsg);
        } else if (err?.status === 401 || err?.status === 403) {
          this.errorMsg.push('Invalid email or password.');
        } else {
          this.errorMsg.push('Something went wrong. Please try again.');
        }
        this.changeDetector.markForCheck();
      }
    });
  }

  register(): void {
    this.router.navigate(['register']);
  }
}
