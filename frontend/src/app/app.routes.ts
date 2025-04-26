import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { AccountComponent } from './pages/account/account.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
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
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { requiresAdmin: true }
  },
  { path: '**', redirectTo: '' }
];