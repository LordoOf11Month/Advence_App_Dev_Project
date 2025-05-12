import { SharedModule } from './../../shared/shared.module';
// features/system-admin/system-admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemAdminRoutingModule } from './system-admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SellerListComponent } from './components/sellers/seller-list/seller-list.component';
import { SellerFormComponent } from './components/sellers/seller-form/seller-form.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { GlobalOrderListComponent } from './components/global-orders/global-order-list/global-order-list.component';
import { PaymentIssuesComponent } from './components/payments/payment-issues/payment-issues.component';
import { ProductManagementComponent } from './components/products/product-management/product-management.component';

@NgModule({
  declarations: [
    DashboardComponent,
    SellerListComponent,
    SellerFormComponent,
    UserListComponent,
    GlobalOrderListComponent,
    PaymentIssuesComponent,
    ProductManagementComponent
  ],
  imports: [ CommonModule, ReactiveFormsModule, SharedModule, SystemAdminRoutingModule ]
})
export class SystemAdminModule { }
