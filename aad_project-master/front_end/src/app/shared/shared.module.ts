import { MoneyPipe } from './pipes/money.pipe';
// shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // for Template-driven forms if needed
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Angular Material imports (if using Material for dialog, spinner, etc.)
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorAlertComponent } from './components/error-alert/error-alert.component';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    MoneyPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // Material Modules
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  exports: [
    // Export components and pipe so they can be used in other modules
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    MoneyPipe,
    // Also export FormsModule, ReactiveFormsModule if needed widely
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
