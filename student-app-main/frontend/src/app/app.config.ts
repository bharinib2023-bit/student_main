import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { config } from './config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth0({
      domain: config.auth0Domain,
      clientId: config.auth0ClientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: config.auth0Audience,
      },
      httpInterceptor: { allowedList: [config.apiUrl + '/*'] },
    }),
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
  ],
};
