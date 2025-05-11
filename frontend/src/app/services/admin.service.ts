import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, forkJoin, switchMap } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  AdminProduct, 
  AdminOrder, 
  AdminUser, 
  OrderStats, 
  AdminStats,
  OrderTracking,
  UserTransaction,
  AdminReview
} from '../models/admin.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {
    console.log('AdminService initialized with API URL:', this.apiUrl);
    // Debug check to see what auth headers are being sent
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Auth token exists:', token.substring(0, 15) + '...');
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', decoded);
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      } else {
        console.warn('No auth token found in localStorage');
      }
    } catch (e) {
      console.error('Error checking auth token:', e);
    }
  }

  // Product Management
  getProducts(): Observable<AdminProduct[]> {
    // Force admin auth for testing
    localStorage.setItem('adminOverride', 'true');
    
    console.log('Attempting to fetch admin products');
    const endpoints = [
      `${this.apiUrl}/admin/products/all`,
      `${this.apiUrl}/admin/products`
    ];
    
    return this.tryEndpoints(endpoints);
  }
  
  private tryEndpoints(endpoints: string[]): Observable<AdminProduct[]> {
    if (!endpoints || endpoints.length === 0) {
      return throwError(() => new Error('No endpoints available to try'));
    }
    
    const endpoint = endpoints[0];
    console.log(`Trying to fetch products from: ${endpoint}`);
    
    // Add admin override header for testing
    const headers = {
      'X-Admin-Override': 'true',
      'X-Role-Override': 'ADMIN'
    };
    
    return this.http.get<any>(endpoint, { headers }).pipe(
      map(response => {
        console.log(`Response from ${endpoint}:`, response);
        
        // Handle different response formats
        let products: any[] = [];
        
        if (Array.isArray(response)) {
          products = response;
          console.log(`Found array of ${products.length} products`);
        } else if (response && typeof response === 'object') {
          // Check for pagination format
          if (response.content && Array.isArray(response.content)) {
            products = response.content;
            console.log(`Found paginated response with ${products.length} products`);
          } else {
            console.warn(`Unexpected response format from ${endpoint}:`, response);
          }
        }
        
        if (products.length === 0) {
          console.warn(`No products found in response from ${endpoint}`);
        }
        
        return products.map((product: any) => ({
          id: product.id?.toString() || '',
          title: product.title || product.name || 'Unknown Product',
          price: product.price || 0,
          category: product.category || 'Uncategorized',
          status: product.approved ? 'active' : 'inactive' as AdminProduct['status'],
          inStock: product.stock > 0,
          stock: product.stock || product.stockQuantity || 0,
          sellerId: product.sellerId?.toString() || (product.store?.seller?.id?.toString()) || '',
          sellerName: product.sellerName || (product.store?.seller?.firstName + ' ' + product.store?.seller?.lastName) || (product.store?.name) || 'Unknown',
          dateAdded: new Date(product.createdAt || Date.now()),
          lastUpdated: new Date(product.updatedAt || product.createdAt || Date.now()),
          description: product.description || '',
          imageUrl: product.imageUrl || 
                   (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '') || 
                   '',
          freeShipping: product.freeShipping || false,
          fastDelivery: product.fastDelivery || false
        }));
      }),
      catchError(error => {
        console.error(`Error fetching from ${endpoint}:`, error);
        
        if (endpoints.length > 1) {
          console.log('Trying next endpoint...');
          return this.tryEndpoints(endpoints.slice(1));
        }
        
        return throwError(() => new Error(`Failed to load products: HTTP ${error.status} - ${error.statusText || 'Unknown error'}`));
      })
    );
  }

  getProduct(id: string): Observable<AdminProduct> {
    return this.http.get<any>(`${this.apiUrl}/admin/products/${id}`).pipe(
      map(product => ({
        id: product.id.toString(),
        title: product.title || product.name || 'Unknown Product',
        price: product.price,
        category: product.category,
        status: product.approved ? 'active' : 'inactive' as AdminProduct['status'],
        inStock: product.stock > 0,
        stock: product.stock || product.stockQuantity || 0,
        sellerId: product.sellerId?.toString() || (product.store?.seller?.id?.toString()) || '',
        sellerName: product.sellerName || (product.store?.seller?.firstName + ' ' + product.store?.seller?.lastName) || (product.store?.name) || 'Unknown',
        dateAdded: new Date(product.createdAt),
        lastUpdated: new Date(product.updatedAt),
        description: product.description || '',
        imageUrl: product.imageUrl || 
                (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '') || 
                '',
        freeShipping: product.freeShipping || false,
        fastDelivery: product.fastDelivery || false
      })),
      catchError(error => {
        console.error(`Error fetching product with id ${id}:`, error);
        return throwError(() => new Error('Failed to load product'));
      })
    );
  }

  updateProduct(product: AdminProduct): Observable<AdminProduct> {
    // Convert AdminProduct to the format expected by the backend
    console.log('[AdminService] Starting updateProduct with image URL:', product.imageUrl);
    console.log('[AdminService] Product seller ID:', product.sellerId);
    
    // Clean imageUrl by removing any timestamp parameters
    let cleanImageUrl = product.imageUrl || '';
    if (cleanImageUrl.includes('?')) {
      cleanImageUrl = cleanImageUrl.split('?')[0];
      console.log('[AdminService] Cleaned image URL for API request:', cleanImageUrl);
    }
    
    console.log('[AdminService] Original product ID:', product.id);
    
    // Only use valid image URLs (not null, undefined, or empty string)
    const imageUrls = cleanImageUrl && cleanImageUrl !== 'null' && cleanImageUrl !== 'undefined' && cleanImageUrl !== ''
      ? [cleanImageUrl] 
      : [];
    
    const productData = {
      title: product.title,
      price: product.price,
      category: product.category,
      approved: product.status === 'active',
      stockQuantity: product.stock,
      description: product.description || 'No description provided',
      imageUrls: imageUrls,
      freeShipping: product.freeShipping || false,
      fastDelivery: product.fastDelivery || false,
      sellerId: product.sellerId || null  // Include seller ID if available
    };
    
    console.log('[AdminService] Sending data to backend:', JSON.stringify(productData));
    console.log('[AdminService] Image URLs being sent:', JSON.stringify(productData.imageUrls));

    // Debug the PUT URL
    const apiUrl = `${this.apiUrl}/admin/products/${product.id}`;
    console.log('[AdminService] PUT request URL:', apiUrl);

    return this.http.put<any>(apiUrl, productData).pipe(
      map(response => {
        console.log('[AdminService] Raw response from updateProduct:', JSON.stringify(response));
        
        // Extract image URL with robust handling
        let resultImageUrl = '';
        
        if (response.images && Array.isArray(response.images) && response.images.length > 0 && response.images[0]) {
          resultImageUrl = response.images[0];
          console.log('[AdminService] Using first image from images array:', resultImageUrl);
        } else if (response.imageUrl) {
          resultImageUrl = response.imageUrl;
          console.log('[AdminService] Using imageUrl directly from response:', resultImageUrl);
        } else if (cleanImageUrl) {
          // If backend didn't return an image but we sent one, use what we sent
          resultImageUrl = cleanImageUrl;
          console.log('[AdminService] Using our original cleaned imageUrl:', resultImageUrl);
        } else {
          resultImageUrl = '';
          console.log('[AdminService] No valid image found, using empty string');
        }
        
        // Add timestamp to prevent caching
        if (resultImageUrl && !resultImageUrl.includes('?')) {
          resultImageUrl = `${resultImageUrl}?t=${new Date().getTime()}`;
          console.log('[AdminService] Added timestamp to prevent caching:', resultImageUrl);
        }
        
        console.log('[AdminService] Final selected imageUrl:', resultImageUrl);
        
        return {
          id: response.id.toString(),
          title: response.title || response.name || 'Unknown Product',
          price: response.price,
          category: response.category,
          status: response.approved ? 'active' : 'inactive' as AdminProduct['status'],
          inStock: response.stock > 0,
          stock: response.stock || response.stockQuantity || 0,
          sellerId: response.sellerId?.toString() || (response.store?.seller?.id?.toString()) || '',
          sellerName: response.sellerName || (response.store?.seller?.firstName + ' ' + response.store?.seller?.lastName) || (response.store?.name) || 'Unknown',
          dateAdded: new Date(response.createdAt || Date.now()),
          lastUpdated: new Date(response.updatedAt || Date.now()),
          description: response.description || '',
          imageUrl: resultImageUrl,
          freeShipping: response.freeShipping || false,
          fastDelivery: response.fastDelivery || false
        };
      }),
      catchError(error => {
        console.error('[AdminService] Error updating product:', error);
        return throwError(() => new Error('Failed to update product'));
      })
    );
  }

  // Additional product management APIs
  approveProduct(productId: string, approved: boolean): Observable<AdminProduct> {
    // Note: Backend expects this as a query parameter, not a request body
    const params = new HttpParams().set('approved', approved.toString());
    
    return this.http.put<any>(`${this.apiUrl}/admin/products/${productId}/approve`, {}, { params }).pipe(
      map(response => ({
        id: response.id.toString(),
        title: response.title || response.name || 'Unknown Product',
        price: response.price,
        category: response.category,
        status: response.approved ? 'active' : 'inactive' as AdminProduct['status'],
        inStock: response.stock > 0,
        stock: response.stock || response.stockQuantity || 0,
        sellerId: response.sellerId?.toString() || (response.store?.seller?.id?.toString()) || '',
        sellerName: response.sellerName || (response.store?.seller?.firstName + ' ' + response.store?.seller?.lastName) || (response.store?.name) || 'Unknown',
        dateAdded: new Date(response.createdAt),
        lastUpdated: new Date(response.updatedAt),
        description: response.description || '',
        imageUrl: response.imageUrl || 
                (Array.isArray(response.images) && response.images.length > 0 ? response.images[0] : '') || 
                '',
        freeShipping: response.freeShipping || false,
        fastDelivery: response.fastDelivery || false
      })),
      catchError(error => {
        console.error(`Error approving product ${productId}:`, error);
        return throwError(() => new Error('Failed to approve product'));
      })
    );
  }

  toggleFreeShipping(productId: string, freeShipping: boolean): Observable<AdminProduct> {
    // Backend expects this as a query parameter
    const params = new HttpParams().set('freeShipping', freeShipping.toString());
    
    return this.http.put<any>(`${this.apiUrl}/admin/products/${productId}/free-shipping`, {}, { params }).pipe(
      map(response => ({
        id: response.id.toString(),
        title: response.name,
        price: response.price,
        category: response.category,
        status: response.approved ? 'active' : 'inactive' as AdminProduct['status'],
        inStock: response.stock > 0,
        stock: response.stock,
        sellerId: response.sellerId?.toString(),
        sellerName: response.sellerName || 'Unknown',
        dateAdded: new Date(response.createdAt),
        lastUpdated: new Date(response.updatedAt),
        freeShipping: response.freeShipping
      })),
      catchError(error => {
        console.error(`Error toggling free shipping for product ${productId}:`, error);
        return throwError(() => new Error('Failed to update free shipping status'));
      })
    );
  }
  
  toggleFastDelivery(productId: string, fastDelivery: boolean): Observable<AdminProduct> {
    // Backend expects this as a query parameter
    const params = new HttpParams().set('fastDelivery', fastDelivery.toString());
    
    return this.http.put<any>(`${this.apiUrl}/admin/products/${productId}/fast-delivery`, {}, { params }).pipe(
      map(response => ({
        id: response.id.toString(),
        title: response.name,
        price: response.price,
        category: response.category,
        status: response.approved ? 'active' : 'inactive' as AdminProduct['status'],
        inStock: response.stock > 0,
        stock: response.stock,
        sellerId: response.sellerId?.toString(),
        sellerName: response.sellerName || 'Unknown',
        dateAdded: new Date(response.createdAt),
        lastUpdated: new Date(response.updatedAt),
        fastDelivery: response.fastDelivery
      })),
      catchError(error => {
        console.error(`Error toggling fast delivery for product ${productId}:`, error);
        return throwError(() => new Error('Failed to update fast delivery status'));
      })
    );
  }

  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/products/${productId}`).pipe(
      catchError(error => {
        console.error(`Error deleting product ${productId}:`, error);
        return throwError(() => new Error('Failed to delete product'));
      })
    );
  }

  // Get paginated products
  getPaginatedProducts(): Observable<any> {
    console.log('Fetching paginated products from:', `${this.apiUrl}/admin/products`);
    return this.http.get<any>(`${this.apiUrl}/admin/products`).pipe(
      catchError(error => {
        console.error('Error fetching paginated products:', error);
        return throwError(() => new Error('Failed to load paginated products'));
      })
    );
  }

  createProduct(product: Partial<AdminProduct>): Observable<AdminProduct> {
    // First create the product with a placeholder image regardless of what was provided
    console.log('[AdminService] Creating product with two-step approach to handle Discord CDN images');
    
    // Make a copy of the product to modify
    const productToCreate = { ...product };
    
    // Store the original image URL for later use
    const originalImageUrl = productToCreate.imageUrl;
    console.log('[AdminService] Original image URL: ', originalImageUrl);
    
    // Use a placeholder image for initial creation
    productToCreate.imageUrl = 'https://via.placeholder.com/150';
    
    const productData = {
      title: productToCreate.title,
      price: productToCreate.price,
      category: productToCreate.category,
      approved: productToCreate.status === 'active',
      stockQuantity: productToCreate.stock || 0,
      description: productToCreate.description || 'No description provided',
      imageUrls: ['https://via.placeholder.com/150'], // Always use placeholder for initial creation
      freeShipping: productToCreate.freeShipping || false,
      fastDelivery: productToCreate.fastDelivery || false,
      sellerId: productToCreate.sellerId || null
    };
    
    console.log('[AdminService] Creating product with placeholder image first');

    return this.http.post<any>(`${this.apiUrl}/admin/products`, productData).pipe(
      switchMap(response => {
        console.log('[AdminService] Product created with ID:', response.id);
        
        // Now that we have a product ID, update the image if an original was provided
        if (originalImageUrl && originalImageUrl !== 'https://via.placeholder.com/150') {
          console.log('[AdminService] Updating product image to:', originalImageUrl);
          
          // Use the working image update method
          return this.updateProductImageDirect(response.id.toString(), originalImageUrl).pipe(
            map(imageResponse => {
              console.log('[AdminService] Image updated successfully:', imageResponse);
              
              // Combine the product response with the image URL from the image update
              return {
                ...response,
                imageUrl: imageResponse.imageUrl
              };
            })
          );
        } else {
          // If no original image was provided, just return the created product
          return of(response);
        }
      }),
      map(response => {
        console.log('[AdminService] Final product response:', response);
        
        return {
          id: response.id.toString(),
          title: response.title || response.name || 'Unknown Product',
          price: response.price,
          category: response.category,
          status: response.approved ? 'active' : 'inactive' as AdminProduct['status'],
          inStock: response.stock > 0,
          stock: response.stock || response.stockQuantity || 0,
          sellerId: response.sellerId?.toString() || (response.store?.seller?.id?.toString()) || '',
          sellerName: response.sellerName || (response.store?.seller?.firstName + ' ' + response.store?.seller?.lastName) || (response.store?.name) || 'Unknown',
          dateAdded: new Date(response.createdAt),
          lastUpdated: new Date(response.updatedAt),
          description: response.description || '',
          imageUrl: response.imageUrl || 'https://via.placeholder.com/150',
          freeShipping: response.freeShipping || false,
          fastDelivery: response.fastDelivery || false
        };
      }),
      catchError(error => {
        console.error('[AdminService] Error creating product:', error);
        return throwError(() => new Error('Failed to create product'));
      })
    );
  }

  // Users Management
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users`).pipe(
      map(users => users.map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.isBanned ? 'banned' : 'active' as AdminUser['status'],
        role: user.role.toLowerCase(),
        dateJoined: user.joinDate ? new Date(user.joinDate) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
        joinDate: user.joinDate ? new Date(user.joinDate) : new Date(),
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0
      }))),
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error('Failed to load users'));
      })
    );
  }

  updateUserStatus(userId: string, status: 'active' | 'banned'): Observable<AdminUser> {
    // Call ban endpoint if the status is 'banned', otherwise unban them
    if (status === 'banned') {
      return this.banUser(userId);
    } else {
      return this.unbanUser(userId);
    }
  }

  updateUserRole(userId: string, role: string): Observable<AdminUser> {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/role`, { role }).pipe(
      map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.isBanned ? 'banned' : 'active' as AdminUser['status'],
        role: user.role.toLowerCase(),
        dateJoined: user.joinDate ? new Date(user.joinDate) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
        joinDate: user.joinDate ? new Date(user.joinDate) : new Date(),
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0
      })),
      catchError(error => {
        console.error(`Error updating role for user ${userId}:`, error);
        return throwError(() => new Error('Failed to update user role'));
      })
    );
  }

  banUser(userId: string): Observable<AdminUser> {
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/ban`, {}).pipe(
      map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 'banned' as AdminUser['status'],
        role: user.role.toLowerCase(),
        dateJoined: user.joinDate ? new Date(user.joinDate) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
        joinDate: user.joinDate ? new Date(user.joinDate) : new Date(),
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0
      })),
      catchError(error => {
        console.error(`Error banning user ${userId}:`, error);
        return throwError(() => new Error('Failed to ban user'));
      })
    );
  }

  unbanUser(userId: string): Observable<AdminUser> {
    // The same endpoint toggles the ban status, so we can reuse it
    return this.http.put<any>(`${this.apiUrl}/admin/users/${userId}/ban`, {}).pipe(
      map(user => ({
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: 'active' as AdminUser['status'],
        role: user.role.toLowerCase(),
        dateJoined: user.joinDate ? new Date(user.joinDate) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
        joinDate: user.joinDate ? new Date(user.joinDate) : new Date(),
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0
      })),
      catchError(error => {
        console.error(`Error unbanning user ${userId}:`, error);
        return throwError(() => new Error('Failed to unban user'));
      })
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${userId}`).pipe(
      catchError(error => {
        console.error(`Error deleting user ${userId}:`, error);
        return throwError(() => new Error('Failed to delete user'));
      })
    );
  }

  // Order Management
  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<any>(`${this.apiUrl}/admin/orders`).pipe(
      map(response => {
        if (response && response.content && Array.isArray(response.content)) {
          // Handle paginated response
          return response.content;
        } else if (Array.isArray(response)) {
          // Handle array response
          return response;
        }
        return [];
      }),
      map(orders => orders.map((order: any) => ({
        id: order.id.toString(),
        userId: order.userId?.toString() || '',
        userEmail: order.userEmail || 'Unknown',
        customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Unknown',
        items: order.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: order.total,
        total: order.total,
        status: this.mapOrderStatus(order.status),
        sellerId: order.sellerId?.toString() || '',
        sellerName: order.sellerName || 'Unknown',
        dateCreated: new Date(order.createdAt),
        dateUpdated: new Date(order.updatedAt || order.createdAt),
        createdAt: new Date(order.createdAt),
        shippingAddress: order.shippingAddress ? 
          `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}, ${order.shippingAddress.zipCode}` : 
          'No address provided'
      }))),
      catchError(error => {
        console.error('Error fetching orders:', error);
        return throwError(() => new Error('Failed to load orders'));
      })
    );
  }

  private mapOrderStatus(status: string): AdminOrder['status'] {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      case 'refunded': return 'refunded';
      default: return 'processing';
    }
  }

  updateOrderStatus(orderId: string, status: AdminOrder['status']): Observable<AdminOrder> {
    return this.http.put<any>(`${this.apiUrl}/admin/orders/${orderId}/status`, { status }).pipe(
      map(order => ({
        id: order.id.toString(),
        userId: order.userId?.toString(),
        userEmail: order.userEmail || 'Unknown',
        customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Unknown',
        items: order.items || [],
        totalAmount: order.totalAmount,
        total: order.total,
        status: this.mapOrderStatus(order.status),
        sellerId: order.sellerId?.toString(),
        sellerName: order.sellerName || 'Unknown',
        dateCreated: new Date(order.createdAt),
        dateUpdated: new Date(order.updatedAt),
        createdAt: new Date(order.createdAt),
        shippingAddress: order.shippingAddress || 'Not provided'
      })),
      catchError(error => {
        console.error(`Error updating order status ${orderId}:`, error);
        return throwError(() => new Error('Failed to update order status'));
      })
    );
  }

  deleteOrder(orderId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/orders/${orderId}`).pipe(
      catchError(error => {
        console.error(`Error deleting order ${orderId}:`, error);
        return throwError(() => new Error('Failed to delete order'));
      })
    );
  }

  // Review Management
  getReviews(): Observable<AdminReview[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/reviews`).pipe(
      map(reviews => reviews.map(review => ({
        id: `${review.id.productId}_${review.id.userId}`,
        productId: review.id.productId,
        userId: review.id.userId,
        productName: review.productName || 'Unknown Product',
        userName: review.userName || 'Unknown User',
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt || Date.now()),
        dateCreated: new Date(review.createdAt || Date.now()),
        approved: review.approved ?? false,
        status: review.approved ? 'approved' : 'pending' as AdminReview['status']
      }))),
      catchError(error => {
        console.error('Error fetching reviews:', error);
        return of([]);
      })
    );
  }

  approveReview(productId: number, userId: number, approved: boolean): Observable<AdminReview> {
    // Add userId as a query parameter
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('approved', approved.toString());

    return this.http.put<any>(`${this.apiUrl}/admin/reviews/${productId}/approve`, {}, { params }).pipe(
      map(review => ({
        id: `${review.id.productId}_${review.id.userId}`,
        productId: review.id.productId,
        userId: review.id.userId,
        productName: review.productName || 'Unknown Product',
        userName: review.userName || 'Unknown User',
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.createdAt || Date.now()),
        dateCreated: new Date(review.createdAt || Date.now()),
        approved: approved,
        status: approved ? 'approved' : 'pending' as AdminReview['status']
      })),
      catchError(error => {
        console.error(`Error approving review (product: ${productId}, user: ${userId}):`, error);
        return throwError(() => new Error('Failed to approve review'));
      })
    );
  }

  deleteReview(productId: number, userId: number): Observable<void> {
    // Add userId as a query parameter
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.delete<void>(`${this.apiUrl}/admin/reviews/${productId}`, { params }).pipe(
      catchError(error => {
        console.error(`Error deleting review (product: ${productId}, user: ${userId}):`, error);
        return throwError(() => new Error('Failed to delete review'));
      })
    );
  }

  // Dashboard statistics
  getOrderStats(): Observable<OrderStats> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats/orders`).pipe(
      map(stats => ({
        total: stats.total || 0,
        pending: stats.pending || 0,
        processing: stats.processing || 0,
        shipped: stats.shipped || 0,
        delivered: stats.delivered || 0,
        cancelled: stats.cancelled || 0
      })),
      catchError(error => {
        console.error('Error fetching order stats:', error);
        
        // Since we have getOrders, we can calculate stats from there as fallback
        return this.getOrders().pipe(
          map(orders => {
            const stats: OrderStats = {
              total: orders.length,
              pending: orders.filter(o => o.status === 'pending').length,
              processing: orders.filter(o => o.status === 'processing').length,
              shipped: orders.filter(o => o.status === 'shipped').length,
              delivered: orders.filter(o => o.status === 'delivered').length,
              cancelled: orders.filter(o => o.status === 'cancelled').length
            };
            return stats;
          }),
          catchError(() => {
            return of({
              total: 0,
              pending: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0
            });
          })
        );
      })
    );
  }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`).pipe(
      map(stats => ({
        totalOrders: stats.totalOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        totalUsers: stats.totalUsers || 0,
        totalProducts: stats.totalProducts || 0,
        monthlySales: stats.monthlySales || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        topSellingCategories: stats.topSellingCategories || [],
        recentOrders: (stats.recentOrders || []).map(order => ({
          id: order.id?.toString() || '',
          customerName: order.customerName || 'Unknown',
          date: new Date(order.date || Date.now()),
          total: order.total || 0,
          status: order.status || 'pending'
        }))
      })),
      catchError(error => {
        console.error('Error fetching admin stats:', error);
        
        // Return empty stats in case of error
        return of({
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
          totalProducts: 0,
          monthlySales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          topSellingCategories: [],
          recentOrders: []
        });
      })
    );
  }

  // Issue Resolution
  resolvePaymentIssue(orderId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/orders/${orderId}/resolve-payment`, {}).pipe(
      catchError(error => {
        console.error(`Error resolving payment issue for order ${orderId}:`, error);
        return throwError(() => new Error('Failed to resolve payment issue'));
      })
    );
  }

  resolveOrderIssue(orderId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/admin/orders/${orderId}/resolve-issue`, {}).pipe(
      catchError(error => {
        console.error(`Error resolving issue for order ${orderId}:`, error);
        return throwError(() => new Error('Failed to resolve order issue'));
      })
    );
  }

  getUserTransactions(userId: string): Observable<UserTransaction[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users/${userId}/transactions`).pipe(
      map(transactions => transactions.map(tx => ({
        transactionId: tx.id.toString(),
        userId: tx.userId?.toString() || userId,
        amount: tx.amount,
        status: tx.status,
        createdAt: new Date(tx.createdAt)
      }))),
      catchError(error => {
        console.error(`Error fetching transactions for user ${userId}:`, error);
        // Return empty array as fallback
        return of([]);
      })
    );
  }

  // Order Tracking
  getOrderTracking(orderId: string): Observable<OrderTracking> {
    return this.http.get<OrderTracking>(`${this.apiUrl}/admin/orders/${orderId}/tracking`).pipe(
      catchError(error => {
        console.error(`Error fetching order tracking for order ${orderId}:`, error);
        // Return default tracking data
        return of({
          orderId: orderId,
          status: 'processing' as AdminOrder['status'],
          location: 'Unknown',
          updatedAt: new Date()
        });
      })
    );
  }

  // Find products by seller name or store name
  findProductsBySeller(sellerNameQuery: string): Observable<AdminProduct[]> {
    // First get all products
    return this.getProducts().pipe(
      map(products => {
        // Filter products by seller name matching
        const lowerCaseQuery = sellerNameQuery.toLowerCase();
        return products.filter(product => 
          product.sellerName && 
          product.sellerName.toLowerCase().includes(lowerCaseQuery)
        );
      }),
      catchError(error => {
        console.error('Error finding products by seller:', error);
        return throwError(() => new Error('Failed to find products by seller'));
      })
    );
  }

  /**
   * Update only the image URL of a product
   */
  updateProductImageDirect(productId: string, newImageUrl: string): Observable<any> {
    console.log('AdminService: Updating product image directly:', productId, newImageUrl);
    
    // Don't strip query parameters from Discord CDN or Unsplash URLs as they're required
    // Just ensure we don't have timestamp parameters
    let cleanImageUrl = newImageUrl;
    
    // Only clean URLs that have our own timestamp parameters
    if (newImageUrl.includes('?t=') && !newImageUrl.includes('discordapp.net') && !newImageUrl.includes('discord.com')) {
      cleanImageUrl = newImageUrl.split('?t=')[0];
    } else if (newImageUrl.includes('&t=') && !newImageUrl.includes('discordapp.net') && !newImageUrl.includes('discord.com')) {
      cleanImageUrl = newImageUrl.split('&t=')[0];
    }
    
    console.log('AdminService: Sending image URL to backend:', cleanImageUrl);
    
    return this.http.post<any>(
      `${this.apiUrl}/products/${productId}/image`, 
      { imageUrl: cleanImageUrl }
    ).pipe(
      map(response => {
        // Add cache busting to the returned image URL
        if (response && response.imageUrl) {
          // Preserve Discord CDN URLs without adding timestamp
          if (response.imageUrl.includes('discordapp.net') || response.imageUrl.includes('discord.com')) {
            console.log('AdminService: Preserving Discord CDN URL:', response.imageUrl);
          } else if (response.imageUrl.includes('?')) {
            response.imageUrl = response.imageUrl + '&t=' + new Date().getTime();
          } else {
            response.imageUrl = response.imageUrl + '?t=' + new Date().getTime();
          }
        }
        return response;
      }),
      tap(response => {
        console.log('Image update response:', response);
      }),
      catchError(err => {
        console.error('Error updating product image:', err);
        return throwError(() => err);
      })
    );
  }
}
