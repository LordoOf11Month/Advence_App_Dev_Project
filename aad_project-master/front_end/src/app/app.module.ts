import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AuthService } from './core/services/auth.service';
import { CartService } from './features/cart/services/cart.service';

// Function to handle auth events including cart merging
export function initAuthListener(authService: AuthService, cartService: CartService, platformId: Object) {
  return () => {
    // Only execute in browser environment
    if (isPlatformBrowser(platformId)) {
      authService.currentUser$.subscribe(user => {
        if (user) {
          // User has logged in, merge carts
          setTimeout(() => cartService.mergeWithServerCart(), 0);
        }
      });
    }
    return Promise.resolve();
  };
}

@NgModule({
  declarations: [
    AppComponent  // Only the root component is declared in AppModule
  ],
  imports: [
    BrowserModule,
    CoreModule,        // CoreModule now declares & exports header, footer, and error components
    SharedModule,      // SharedModule for pipes, widgets, etc.
    AppRoutingModule,  // Routing module for feature modules and default routes
    NotificationComponent // Standalone component
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthListener,
      deps: [AuthService, CartService, PLATFORM_ID],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
