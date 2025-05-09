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
import { StorePageComponent } from './pages/store/store-page.component';
import { ShippingComponent } from './pages/checkout/shipping.component';
import { PaymentComponent } from './pages/checkout/payment.component';
import { ReviewComponent } from './pages/checkout/review.component';
import { ConfirmationComponent } from './pages/checkout/confirmation.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category/:categoryId', component: ProductListComponent },
  { path: 'product/:productId', component: ProductDetailComponent },
  { path: 'store/:sellerId', component: StorePageComponent },
  { path: 'cart', component: CartComponent },
  {
    path: 'checkout',
    children: [
      { path: 'shipping', component: ShippingComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'review', component: ReviewComponent },
      { path: 'confirmation', component: ConfirmationComponent },
      { path: '', redirectTo: 'shipping', pathMatch: 'full' }
    ]
  },
  { 
    path: 'account', 
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'seller/register', 
    component: SellerRegisterComponent 
  },
  {
    path: 'compare',
    loadComponent: () => import('./pages/product-compare/product-compare.component')
      .then(c => c.ProductCompareComponent)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { requiresAdmin: true },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'sellers', component: AdminSellersComponent },
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
  { path: '**', redirectTo: '' }
];
