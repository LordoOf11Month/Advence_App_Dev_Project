// shared/components/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  message: string;
  confirmLabel: string;
  cancelLabel: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string, confirmText?: string, cancelText?: string }
  ) {
    this.message = data.message;
    this.confirmLabel = data.confirmText || 'Yes';
    this.cancelLabel = data.cancelText || 'No';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
