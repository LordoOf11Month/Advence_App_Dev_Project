import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { AccountComponent } from './pages/account/account.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders.component';
import { AdminUsersComponent } from './pages/admin/admin-users.component';
import { AdminSellersComponent } from './pages/admin/admin-sellers.component';
import { SellerDashboardComponent } from './pages/seller/seller-dashboard.component';
import { SellerRegisterComponent } from './pages/seller/seller-register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category/:categoryId', component: ProductListComponent },
  { path: 'product/:productId', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { 
    path: 'account', 
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'seller/register', 
    loadComponent: () => import('./pages/seller/seller-register.component').then(m => m.SellerRegisterComponent) 
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { requiresAdmin: true },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'seller',
    canActivate: [AuthGuard],
    data: { requiresSeller: true },
    children: [
      { path: '', component: SellerDashboardComponent },
      { path: 'products', component: SellerDashboardComponent },
      { path: 'orders', component: SellerDashboardComponent },
      { path: 'profile', component: SellerDashboardComponent }
    ]
  },
  {
    path: 'seller/dashboard',
    loadComponent: () => import('./pages/seller/seller-dashboard.component').then(m => m.SellerDashboardComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
