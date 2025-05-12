import { SharedModule } from './../../shared/shared.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './components/cart/cart.component';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { CartService } from './services/cart.service';

@NgModule({
  declarations: [
    CartComponent,
    CartItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,       // Import RouterModule for router directives (like routerLink) if needed
    CartRoutingModule,
    SharedModule   // Include child routes for CartModule
  ],
  providers: [
    CartService         // Provide CartService at the module level (feature-scoped service)
  ]
})
export class CartModule { }
