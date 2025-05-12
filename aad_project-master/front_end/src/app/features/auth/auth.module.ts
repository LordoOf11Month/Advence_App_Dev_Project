import { SharedModule } from './../../shared/shared.module';
// features/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { SellerRegisterComponent } from './components/seller-register/seller-register.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    UserProfileComponent,
    SellerRegisterComponent
  ],
  imports: [ CommonModule, ReactiveFormsModule, SharedModule, AuthRoutingModule ]
})
export class AuthModule { }
