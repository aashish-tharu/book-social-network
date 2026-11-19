import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiConfiguration } from '../api-configuration';
import { TokenService } from '../token/token';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.isAuthenticated() ? tokenService.getToken() : null;
  const apiUrl = new URL(inject(ApiConfiguration).rootUrl);
  const requestUrl = new URL(req.url, apiUrl);
  const apiPath = apiUrl.pathname.replace(/\/$/, '');
  const isApiRequest =
    requestUrl.origin === apiUrl.origin &&
    (requestUrl.pathname === apiPath || requestUrl.pathname.startsWith(`${apiPath}/`));
  const isAuthRequest = isApiRequest && requestUrl.pathname.startsWith(`${apiPath}/auth/`);

  if (!token || !isApiRequest || isAuthRequest) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        tokenService.removeToken();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
