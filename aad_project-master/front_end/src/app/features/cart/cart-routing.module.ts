import { AuthGuard } from './../../core/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CartComponent } from './components/cart/cart.component';

const routes: Routes = [
  {
    path: '',
    component: CartComponent,
    canActivate: [AuthGuard]  // Protect this route with AuthGuard (requires login)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CartRoutingModule { }
