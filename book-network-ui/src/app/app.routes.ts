import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { Register } from './pages/register/register';
import { ActivateAccount } from './pages/activate-account/activate-account';
import { authGuard, guestGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
  },
  {
    path: 'activate-account',
    component: ActivateAccount,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'books',
    canActivate: [authGuard],
    loadChildren: ()=> import('./modules/book/book-module').then(m => m.BookModule)
  }
];
