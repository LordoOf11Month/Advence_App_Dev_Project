import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { SellerProfile } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private mockSellers: SellerProfile[] = [
    {
      id: '1',
      userId: '3',
      storeName: 'Tech Galaxy',
      storeDescription: 'Your one-stop shop for all electronics',
      rating: 4.8,
      productCount: 150,
      totalSales: 1250,
      dateJoined: new Date('2024-01-15'),
      status: 'active'
    },
    {
      id: '2',
      userId: '4',
      storeName: 'Fashion Hub',
      storeDescription: 'Latest fashion trends and accessories',
      rating: 4.6,
      productCount: 300,
      totalSales: 2100,
      dateJoined: new Date('2024-01-15'),
      status: 'active'
    }
  ];

  private mockSellerProducts: Product[] = [
    {
      id: 1,
      title: 'Wireless Earbuds',
      price: 299.99,
      description: 'High-quality wireless earbuds with noise cancellation',
      category: 'electronics',
      brand: 'TechBrand',
      rating: 4.5,
      reviewCount: 128,
      images: ['https://example.com/earbuds.jpg'],
      inStock: true,
      sellerId: '1',
      sellerName: 'Tech Galaxy'
    }
  ];

  private mockOrders: any[] = [
    {
      id: '1001',
      customerId: '123',
      customerName: 'John Doe',
      dateCreated: new Date('2023-05-15'),
      status: 'pending',
      totalAmount: 299.99,
      items: [
        {
          productId: 1,
          productName: 'Wireless Earbuds',
          quantity: 1,
          price: 299.99
        }
      ],
      sellerId: '1'
    }
  ];

  constructor() {}

  getSellerProfile(userId: string): Observable<SellerProfile> {
    const seller = this.mockSellers.find(s => s.userId === userId);
    if (!seller) {
      return throwError(() => new Error('Seller not found'));
    }
    return of(seller).pipe(delay(500));
  }

  getAllSellers(): Observable<SellerProfile[]> {
    return of(this.mockSellers).pipe(delay(500));
  }

  getSellerProducts(sellerId: string): Observable<Product[]> {
    return of(this.mockSellerProducts.filter(p => p.sellerId === sellerId)).pipe(delay(500));
  }

  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    const newProduct = {
      ...product,
      id: Math.floor(Math.random() * 10000) + 1
    };
    this.mockSellerProducts.push(newProduct);
    return of(newProduct).pipe(delay(500));
  }

  createProduct(product: any): Observable<Product> {
    const newProduct = {
      ...product,
      id: Math.floor(Math.random() * 10000) + 1
    };
    this.mockSellerProducts.push(newProduct);
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    const index = this.mockSellerProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Product not found'));
    }
    this.mockSellerProducts[index] = { ...this.mockSellerProducts[index], ...product };
    return of(this.mockSellerProducts[index]).pipe(delay(500));
  }

  deleteProduct(id: number): Observable<void> {
    const index = this.mockSellerProducts.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Product not found'));
    }
    this.mockSellerProducts.splice(index, 1);
    return of(void 0).pipe(delay(500));
  }

  updateSellerProfile(userId: string, profile: Partial<SellerProfile>): Observable<SellerProfile> {
    const index = this.mockSellers.findIndex(s => s.userId === userId);
    if (index === -1) {
      return throwError(() => new Error('Seller not found'));
    }
    this.mockSellers[index] = { ...this.mockSellers[index], ...profile };
    return of(this.mockSellers[index]).pipe(delay(500));
  }

  suspendSeller(sellerId: string): Observable<void> {
    const seller = this.mockSellers.find(s => s.id === sellerId);
    if (!seller) {
      return throwError(() => new Error('Seller not found'));
    }
    seller.status = 'suspended';
    return of(void 0).pipe(delay(500));
  }

  activateSeller(sellerId: string): Observable<void> {
    const seller = this.mockSellers.find(s => s.id === sellerId);
    if (!seller) {
      return throwError(() => new Error('Seller not found'));
    }
    seller.status = 'active';
    return of(void 0).pipe(delay(500));
  }

  register(sellerData: Partial<SellerProfile>): Observable<SellerProfile> {
    const newSeller: SellerProfile = {
      id: (this.mockSellers.length + 1).toString(),
      userId: (this.mockSellers.length + 3).toString(), // Assuming users 1-2 are regular users
      storeName: sellerData.storeName || '',
      storeDescription: sellerData.storeDescription || '',
      rating: 0,
      productCount: 0,
      totalSales: 0,
      dateJoined: new Date(),
      status: 'active'
    };

    this.mockSellers.push(newSeller);
    return of(newSeller).pipe(delay(500));
  }

  getSellerOrders(sellerId: string): Observable<any[]> {
    return of(this.mockOrders.filter(o => o.sellerId === sellerId)).pipe(delay(500));
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    const order = this.mockOrders.find(o => o.id === orderId);
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }
    order.status = status;
    return of(order).pipe(delay(500));
  }
}
