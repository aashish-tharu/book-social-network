import { Component } from '@angular/core';
import {AuthenticationService, RegistrationRequest} from '../../services';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
  }

  registerRequest: RegistrationRequest = {email:'', firstname: '', lastname: '', password: ''};
  errorMsg: string[] = [];

  register(): void {
    this.errorMsg = [];
    this.authService.register({
      body: this.registerRequest
    }).subscribe({
      next: () => {
        this.router.navigate(['activate-account']);
      },
      error: (err) => {
        const response = err?.error;
        if (Array.isArray(response?.validationErrors)) {
          this.errorMsg = response.validationErrors;
        } else if (response?.businessErrorDescription || response?.error) {
          this.errorMsg = [response.businessErrorDescription || response.error];
        } else {
          this.errorMsg = ['Registration failed. Please try again.'];
        }
      }
    });
  }

  login(): void {
    this.router.navigate(['login']);
  }

}
