import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services';
import { CodeInputModule } from 'angular-code-input';

@Component({
  selector: 'app-activate-account',
  imports: [
    CommonModule,
    CodeInputModule
  ],
  templateUrl: './activate-account.html',
  styleUrl: './activate-account.scss',
})
export class ActivateAccount {
  message = '';
  isOkay = true;
  submitted = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  protected onCodeCompleted(token: string): void {
    this.confirmAccount(token);
  }

  protected redirectToLogin(): void {
    this.router.navigate(['login']);
  }

  protected retryActivation(): void {
    this.message = '';
    this.isOkay = true;
    this.submitted = false;
  }

  private confirmAccount(token: string): void {
    this.authService.confirm({ token }).subscribe({
      next: () => {
        this.message = 'Your account has been successfully activated. You can now log in.';
        this.isOkay = true;
        this.submitted = true;
        this.changeDetector.markForCheck();
      },
      error: (err) => {
        this.message = err?.error?.businessErrorDescription
          || err?.error?.error
          || 'The activation code is invalid or has expired.';
        this.submitted = true;
        this.isOkay = false;
        this.changeDetector.markForCheck();
      }
    });
  }
}
