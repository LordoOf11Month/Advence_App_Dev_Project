import { NotificationService } from './../../../../../core/services/notification.service';
// features/seller-dashboard/components/products/seller-product-form/seller-product-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SellerService } from '../../../services/seller.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-seller-product-form',
  standalone: false,
  templateUrl: './seller-product-form.component.html'
})
export class SellerProductFormComponent implements OnInit {
  productForm!: FormGroup;
  editing: boolean = false;
  productId: number | null = null;
  error: string | null = null;
  loading: boolean = false;
  sellerStores: any[] = [];
  categories: any[] = [];

  constructor(private fb: FormBuilder, private sellerService: SellerService, private route: ActivatedRoute, private router: Router, private notify: NotificationService) {}

  ngOnInit(): void {
    // Load seller's stores
    this.loadSellerStores();
    this.loadCategories();

    // Initialize form fields
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      storeId: ['', Validators.required],
      description: [''],
      stockQuantity: [1, [Validators.required, Validators.min(0)]],
      imageUrls: this.fb.array([this.fb.control('')])
    });

    // Check if we are editing an existing product
    if (this.route.snapshot.paramMap.get('id')) {
      this.editing = true;
      this.productId = Number(this.route.snapshot.paramMap.get('id'));
      this.loading = true;
      // Load product data to edit
      this.sellerService.getProduct(this.productId).subscribe({
        next: product => {
          // Clear existing form array
          while (this.imageUrlsArray.length) {
            this.imageUrlsArray.removeAt(0);
          }

          // Add image URLs to form array
          if (product.imageUrls && product.imageUrls.length > 0) {
            product.imageUrls.forEach(url => {
              this.imageUrlsArray.push(this.fb.control(url));
            });
          } else {
            this.imageUrlsArray.push(this.fb.control(''));
          }

          this.productForm.patchValue({
            name: product.name,
            price: product.price,
            categoryId: product.categoryId,
            storeId: product.storeId,
            description: product.description,
            stockQuantity: product.stockQuantity
          });

          this.loading = false;
        },
        error: err => {
          console.error('Failed to load product', err);
          this.error = 'Product not found.';
          this.loading = false;
        }
      });
    }
  }

  get imageUrlsArray() {
    return this.productForm.get('imageUrls') as FormArray;
  }

  addImageUrl() {
    this.imageUrlsArray.push(this.fb.control(''));
  }

  removeImageUrl(index: number) {
    if (this.imageUrlsArray.length > 1) {
      this.imageUrlsArray.removeAt(index);
    }
  }

  loadSellerStores() {
    this.sellerService.getSellerStores().subscribe({
      next: (stores) => {
        this.sellerStores = stores;
        if (stores.length > 0) {
          this.productForm?.get('storeId')?.setValue(stores[0].id);
        }
      },
      error: (err) => {
        console.error('Failed to load stores', err);
        this.error = 'Could not load your stores.';
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.error = null;
    this.loading = true;
    const productData = this.productForm.value;

    // Filter out empty image URLs
    productData.imageUrls = productData.imageUrls.filter((url: string) => url.trim() !== '');

    if (this.editing && this.productId != null) {
      this.sellerService.updateProduct(this.productId, productData).subscribe({
        next: updated => {
          this.notify.showSuccess('Product updated.');
          this.router.navigate(['/seller/products']);
        },
        error: err => {
          console.error('Update failed', err);
          this.error = 'Failed to update product.';
          this.loading = false;
        }
      });
    } else {
      this.sellerService.createProduct(productData).subscribe({
        next: created => {
          this.notify.showSuccess('Product created.');
          this.router.navigate(['/seller/products']);
        },
        error: err => {
          console.error('Creation failed', err);
          this.error = 'Failed to create product.';
          this.loading = false;
        }
      });
    }
  }

  loadCategories() {
    this.sellerService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = Array.isArray(categories) ? categories : Object.values(categories);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
        this.error = 'Could not load categories.';
      }
    });
  }


}
