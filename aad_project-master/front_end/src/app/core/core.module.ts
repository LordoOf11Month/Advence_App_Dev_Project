import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';

import { CoreRoutingModule } from './core-routing.module';  // Core routes for 403 and 404 pages

// Import core services (e.g., interceptors and guards)
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { SellerAdminGuard } from './guards/seller-admin.guard';
import { SystemAdminGuard } from './guards/system-admin.guard';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    AccessDeniedComponent
  ],
  imports: [
    CommonModule,
    RouterModule,       // Allows router directives (routerLink, etc.) in core components
    HttpClientModule,   // Enables HttpClient for interceptors and services
    CoreRoutingModule   // Include core-specific routes (error pages)
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    NotFoundComponent,
    AccessDeniedComponent
  ],
  providers: [
    // Global singleton services and interceptors
    AuthGuard,
    SellerAdminGuard,
    SystemAdminGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})
export class CoreModule {
  // Prevent CoreModule from being imported more than once
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}
