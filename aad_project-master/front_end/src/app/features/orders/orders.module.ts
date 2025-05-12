import { SharedModule } from './../../shared/shared.module';
// features/orders/orders.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersRoutingModule } from './orders-routing.module';

import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';

@NgModule({
  declarations: [OrderHistoryComponent, OrderDetailComponent],
  imports: [ CommonModule, SharedModule, OrdersRoutingModule ]
})
export class OrdersModule { }
