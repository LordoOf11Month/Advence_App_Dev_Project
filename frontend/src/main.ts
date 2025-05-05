import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { AuthModule } from './app/auth/auth.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(AuthModule)
  ]
}).catch(err => console.error(err));
