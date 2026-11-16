import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfiguration } from '../api-configuration';
import { TokenService } from '../token/token';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getToken();
  const apiUrl = new URL(inject(ApiConfiguration).rootUrl);
  const requestUrl = new URL(req.url, apiUrl);
  const apiPath = apiUrl.pathname.replace(/\/$/, '');
  const isApiRequest =
    requestUrl.origin === apiUrl.origin &&
    (requestUrl.pathname === apiPath || requestUrl.pathname.startsWith(`${apiPath}/`));

  if (!token || !isApiRequest) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
