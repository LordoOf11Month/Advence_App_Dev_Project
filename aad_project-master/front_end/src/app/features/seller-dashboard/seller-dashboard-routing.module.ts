import { SellerDashboardComponent } from './components/dashboard/seller-dashboard.component';
// features/seller-dashboard/seller-dashboard-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SellerProductListComponent } from './components/products/seller-product-list/seller-product-list.component';
import { SellerProductFormComponent } from './components/products/seller-product-form/seller-product-form.component';
import { SellerOrderListComponent } from './components/orders/seller-order-list/seller-order-list.component';
import { ShipmentTrackingComponent } from './components/shipments/shipment-tracking/shipment-tracking.component';

const routes: Routes = [
  { path: '', component: SellerDashboardComponent },
  { path: 'products', component: SellerProductListComponent },
  { path: 'products/new', component: SellerProductFormComponent },
  { path: 'products/:id/edit', component: SellerProductFormComponent },
  { path: 'orders', component: SellerOrderListComponent },
  { path: 'shipments/:orderId', component: ShipmentTrackingComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellerDashboardRoutingModule { }
