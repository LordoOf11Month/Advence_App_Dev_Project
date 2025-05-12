import { SharedModule } from './../../shared/shared.module';
// features/checkout/checkout.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutRoutingModule } from './checkout-routing.module';

import { CheckoutComponent } from './components/checkout/checkout.component';
import { PaymentComponent } from './components/payment/payment.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';

@NgModule({
  declarations: [CheckoutComponent, PaymentComponent, OrderSuccessComponent],
  imports: [ CommonModule, SharedModule, CheckoutRoutingModule ]
})
export class CheckoutModule { }
