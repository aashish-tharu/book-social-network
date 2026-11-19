import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {TokenService} from '../../../../services/token/token';

@Component({
  selector: 'app-menu',
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  logout(): void {
    this.tokenService.removeToken();
    void this.router.navigate(['/login']);
  }
}
