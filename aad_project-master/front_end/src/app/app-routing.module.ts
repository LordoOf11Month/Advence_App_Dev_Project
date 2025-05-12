import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CoreModule }          from './core/core.module';
import { NotFoundComponent }   from './core/not-found/not-found.component';
import { AuthGuard }           from './core/guards/auth.guard';
import { SellerAdminGuard }    from './core/guards/seller-admin.guard';
import { SystemAdminGuard }    from './core/guards/system-admin.guard';

const routes: Routes = [

  { path: '', redirectTo: '/catalogue', pathMatch: 'full' },

  /* public feature modules */
  { path: 'catalogue', loadChildren: () => import('./features/catalogue/catalogue.module').then(m => m.CatalogueModule) },
  { path: 'cart',      loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },
  { path: 'checkout',  loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule) },
  { path: 'orders',    loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule) },
  { path: 'auth',      loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },

  /* protected feature modules */
  {
    path: 'seller',                                     //  ← moved  (was “seller-dashboard”)
    canLoad: [/*AuthGuard, SellerAdminGuard*/],
    loadChildren: () => import('./features/seller-dashboard/seller-dashboard.module')
                      .then(m => m.SellerDashboardModule)
  },
  {
    path: 'admin',
    canActivate: [/*AuthGuard, SystemAdminGuard*/],
    loadChildren: () => import('./features/system-admin/system-admin.module')
                      .then(m => m.SystemAdminModule)
  },
  {
    path: 'system-admin',
    redirectTo: 'admin',
    pathMatch: 'full'
  },

  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CoreModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}
