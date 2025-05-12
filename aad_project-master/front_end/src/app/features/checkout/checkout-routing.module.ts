// features/checkout/checkout-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { PaymentComponent } from './components/payment/payment.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';

const routes: Routes = [
  { path: '', component: CheckoutComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'success', component: OrderSuccessComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutRoutingModule { }
