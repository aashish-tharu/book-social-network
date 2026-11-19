import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { httpTokenInterceptor } from './http-token-interceptor';
import { ApiConfiguration } from '../api-configuration';
import { TokenService } from '../token/token';

describe('httpTokenInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let apiRootUrl: string;
  let tokenService: {
    getToken: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    removeToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    tokenService = {
      getToken: vi.fn().mockReturnValue('jwt-token'),
      isAuthenticated: vi.fn().mockReturnValue(true),
      removeToken: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpTokenInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TokenService, useValue: tokenService },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    apiRootUrl = TestBed.inject(ApiConfiguration).rootUrl;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('adds the bearer token to the request', () => {
    http.get(`${apiRootUrl}/books`).subscribe();

    const request = httpTestingController.expectOne(`${apiRootUrl}/books`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('passes the request through unchanged when there is no token', () => {
    tokenService.getToken.mockReturnValue(null);
    http.get(`${apiRootUrl}/books`, { headers: { 'X-Request-Id': '123' } }).subscribe();

    const request = httpTestingController.expectOne(`${apiRootUrl}/books`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.headers.get('X-Request-Id')).toBe('123');
    request.flush([]);
  });

  it('does not send the token to a different origin', () => {
    http.get('https://example.com/books').subscribe();

    const request = httpTestingController.expectOne('https://example.com/books');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });
});
