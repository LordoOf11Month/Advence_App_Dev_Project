import { NotificationService } from './../../../../../core/services/notification.service';
import { AdminService, SellerAccount } from './../../../services/system-admin.service';
// features/system-admin/components/sellers/seller-form/seller-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-seller-form',
  standalone: false,
  templateUrl: './seller-form.component.html'
})
export class SellerFormComponent implements OnInit {
  sellerForm!: FormGroup;
  editing: boolean = false;
  sellerId: number | null = null;
  error: string | null = null;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private adminService: AdminService, private route: ActivatedRoute, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    this.sellerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.editing ? null : Validators.required],
      active: [true],
      // possibly other fields like companyName
    });
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editing = true;
      this.sellerId = Number(idParam);
      this.loading = true;
      this.adminService.getAllSellers().subscribe({  // reuse getAllSellers to find one, in absence of getSellerById
        next: sellers => {
          const seller = sellers.find(s => s.id === this.sellerId);
          if (seller) {
            this.sellerForm.patchValue(seller);
            this.sellerForm.get('password')?.clearValidators();
            this.sellerForm.get('password')?.updateValueAndValidity();
          } else {
            this.error = 'Seller not found.';
          }
          this.loading = false;
        },
        error: err => {
          console.error('Failed to load seller', err);
          this.error = 'Failed to load seller.';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.sellerForm.invalid) return;
    this.error = null;
    this.loading = true;
    const data = this.sellerForm.value;
    if (this.editing && this.sellerId) {
      this.adminService.updateSeller(this.sellerId, data).subscribe({
        next: () => {
          this.notify.showSuccess('Seller updated.');
          this.router.navigate(['/system-admin/sellers']);
        },
        error: err => {
          console.error('Update seller failed', err);
          this.error = 'Failed to update seller.';
          this.loading = false;
        }
      });
    } else {
      this.adminService.createSeller(data).subscribe({
        next: () => {
          this.notify.showSuccess('Seller account created.');
          this.router.navigate(['/admin/sellers']);
        },
        error: err => {
          console.error('Create seller failed', err);
          this.error = 'Failed to create seller.';
          this.loading = false;
        }
      });
    }
  }
}
