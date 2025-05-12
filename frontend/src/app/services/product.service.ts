import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Product, Category, Banner } from '../models/product.model';
import { CategoryService } from './category.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // API URLs
  private apiUrl = `${environment.apiUrl}/public`;
  
  // Categories will be loaded from backend but keeping the mock data for fallback
  private categoriesLoaded = false;
  
  // Mock categories data for fallback
  private categories: Category[] = [
    {
      id: 1,
      name: 'Electronics',
      slug: 'electronics',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 101,
          name: 'Mobile Phones',
          slug: 'mobile-phones',
          subcategories: [
            { id: 1011, name: 'Smartphones', slug: 'smartphones' },
            { id: 1012, name: 'Feature Phones', slug: 'feature-phones' },
            { id: 1013, name: 'Phone Accessories', slug: 'phone-accessories' }
          ]
        },
        {
          id: 102,
          name: 'Computers & Tablets',
          slug: 'computers-tablets',
          subcategories: [
            { id: 1021, name: 'Laptops', slug: 'laptops' },
            { id: 1022, name: 'Desktops', slug: 'desktops' },
            { id: 1023, name: 'Tablets', slug: 'tablets' },
            { id: 1024, name: 'Computer Components', slug: 'computer-components' },
            { id: 1025, name: 'Computer Accessories', slug: 'computer-accessories' }
          ]
        }
        // ... other Electronics subcategories would be here
      ]
    },
    {
      id: 2,
      name: 'Fashion',
      slug: 'fashion',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=60',
      subcategories: []
    },
    {
      id: 3,
      name: 'Home & Living',
      slug: 'home-living',
      imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=60',
      subcategories: []
    }
    // ... other root categories would be here
  ];

  // Banner mock data
  private banners: Banner[] = [
    {
      id: 1,
      imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      title: 'Summer Collection',
      subtitle: 'Up to 50% off',
      linkUrl: '/category/summer-collection'
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      title: 'New Electronics',
      subtitle: 'Latest gadgets',
      linkUrl: '/category/electronics'
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      title: 'Fashion Week',
      subtitle: 'Exclusive deals',
      linkUrl: '/category/fashion'
    }
  ];

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) {
    // Load categories from backend when service is initialized
    this.loadCategoriesFromBackend();
  }

  /**
   * Load categories from backend API
   */
  private loadCategoriesFromBackend(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        if (categories && categories.length > 0) {
          this.categories = categories;
          this.categoriesLoaded = true;
          console.log('Categories loaded from backend successfully');
        } else {
          console.log('No categories returned from backend, using fallback data');
        }
      },
      error: (error) => {
        console.error('Error loading categories from backend:', error);
        console.log('Using fallback category data due to API error');
      }
    });
  }

  /**
   * Get all categories, either from backend or fallback mock data
   */
  getCategories(): Observable<Category[]> {
    // If already loaded from backend, return them
    if (this.categoriesLoaded) {
      return of(this.categories);
    }
    
    // Otherwise try to load from backend
    return this.categoryService.getAllCategories().pipe(
      catchError(error => {
        console.error('Error fetching categories from API:', error);
        console.log('Using fallback category data');
        // Return mock data as fallback
        return of(this.categories);
      })
    );
  }

  /**
   * Get a category by ID, either from backend or fallback mock data
   */
  getCategoryById(id: number): Observable<Category | undefined> {
    // Try to get from backend first
    return this.categoryService.getCategoryById(id).pipe(
      catchError(error => {
        console.error(`Error fetching category with ID ${id} from API:`, error);
        console.log('Using fallback category data');
        // Find in mock data as fallback
        const category = this.findCategoryById(id);
        return of(category);
      })
    );
  }

  // Main method to transform backend response to our frontend Product model
  private transformApiProduct(apiProduct: any): Product {
    // Log the raw API product data to debug category structure
    console.log('Raw API product data for ID ' + apiProduct?.id + ':', JSON.stringify(apiProduct, null, 2));
    
    // Process category data with improved handling
    let category: string | Category | undefined = undefined;
    
    if (apiProduct.category) {
      if (typeof apiProduct.category === 'object') {
        // If category is a full category object
        category = {
          id: apiProduct.category.id,
          name: apiProduct.category.name,
          slug: apiProduct.category.slug,
          imageUrl: apiProduct.category.imageUrl,
          subcategories: apiProduct.category.subcategories,
          parentCategory: apiProduct.category.parentCategory,
          parentCategoryId: apiProduct.category.parentCategoryId
        };
      } else {
        // If category is just a string (slug)
        category = apiProduct.category;
      }
    } else if (apiProduct.categorySlug) {
      // Fallback to categorySlug if available
      category = apiProduct.categorySlug;
    }
    
    return {
      id: apiProduct.id || 0,
      title: apiProduct.title || apiProduct.name || '',
      slug: apiProduct.slug || this.generateSlug(apiProduct.title || apiProduct.name || ''),
      description: apiProduct.description || '',
      price: apiProduct.price || 0,
      discountPercentage: apiProduct.discountPercentage || apiProduct.discount_percentage || 0,
      rating: apiProduct.rating || (apiProduct.totalRating && apiProduct.ratingCount 
                ? apiProduct.totalRating / apiProduct.ratingCount 
                : 4.0),
      reviewCount: apiProduct.reviewCount || apiProduct.rating_count || 0,
      images: this.extractImages(apiProduct),
      colors: apiProduct.colors || apiProduct.variants?.map((v: any) => v.color).filter(Boolean) || [],
      sizes: apiProduct.sizes || apiProduct.variants?.map((v: any) => v.size).filter(Boolean) || [],
      freeShipping: apiProduct.freeShipping || apiProduct.free_shipping || false,
      fastDelivery: apiProduct.fastDelivery || apiProduct.fast_delivery || false,
      inStock: this.determineStockStatus(apiProduct),
      category: category, 
      brand: this.extractBrandData(apiProduct),
      sellerId: this.extractSellerId(apiProduct),
      sellerName: this.extractSellerName(apiProduct),
      variants: apiProduct.variants || [],
      isFavorite: apiProduct.isFavorite || false,
      stockQuantity: apiProduct.stockQuantity !== undefined ? apiProduct.stockQuantity 
                    : (apiProduct.stock_quantity !== undefined ? apiProduct.stock_quantity : undefined),
      storeId: apiProduct.storeId,
      storeName: apiProduct.storeName
    };
  }
  
  // Helper methods to extract data consistently
  private extractBrandData(apiProduct: any): string {
    if (apiProduct.brand) {
      if (typeof apiProduct.brand === 'object') {
        return apiProduct.brand.name || '';
      }
      return apiProduct.brand;
    }
    return apiProduct.brandName || '';
  }
  
  private extractImages(apiProduct: any): string[] {
    if (apiProduct.images && Array.isArray(apiProduct.images)) {
      return apiProduct.images;
    }
    
    if (apiProduct.images && typeof apiProduct.images === 'object' && !Array.isArray(apiProduct.images)) {
      // Handle case where images might be an object with URLs as values
      return Object.values(apiProduct.images);
    }
    
    if (apiProduct.image) {
      return [apiProduct.image];
    }
    
    if (apiProduct.imageUrl) {
      return [apiProduct.imageUrl];
    }
    
    return ['/assets/images/placeholder-product.svg'];
  }
  
  private determineStockStatus(apiProduct: any): boolean {
    if (apiProduct.inStock !== undefined) {
      return apiProduct.inStock;
    }
    
    if (apiProduct.stock_quantity !== undefined) {
      return apiProduct.stock_quantity > 0;
    }
    
    if (apiProduct.stockQuantity !== undefined) {
      return apiProduct.stockQuantity > 0;
    }
    
    return true; // Default to in stock
  }
  
  private extractSellerId(apiProduct: any): string {
    if (apiProduct.seller && apiProduct.seller.id) {
      return apiProduct.seller.id.toString();
    }
    
    if (apiProduct.sellerId) {
      return apiProduct.sellerId.toString();
    }
    
    if (apiProduct.store_id) {
      return apiProduct.store_id.toString();
    }
    
    if (apiProduct.storeId) {
      return apiProduct.storeId.toString();
    }
    
    return '1'; // Default seller ID
  }
  
  private extractSellerName(apiProduct: any): string {
    if (apiProduct.seller && apiProduct.seller.name) {
      return apiProduct.seller.name;
    }
    
    if (apiProduct.sellerName) {
      return apiProduct.sellerName;
    }
    
    if (apiProduct.storeName) {
      return apiProduct.storeName;
    }
    
    return 'Store'; // Default store name
  }
  
  // Helper method to find a category by its ID
  private findCategoryById(categoryId: number): Category | undefined {
    // First check top-level categories
    let result = this.categories.find(cat => cat.id === categoryId);
    if (result) return result;
    
    // Then check subcategories using recursive function
    for (const category of this.categories) {
      result = this.findSubcategoryById(category, categoryId);
      if (result) return result;
    }
    
    return undefined;
  }
  
  // Recursive function to find subcategory by ID
  private findSubcategoryById(category: Category, id: number): Category | undefined {
    if (!category.subcategories) return undefined;
    
    for (const subcat of category.subcategories) {
      if (subcat.id === id) return subcat;
      
      const result = this.findSubcategoryById(subcat, id);
      if (result) return result;
    }
    
    return undefined;
  }

  /**
   * Generate a slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-')    // Replace spaces with hyphens
      .replace(/-+/g, '-')     // Replace multiple hyphens with a single one
      .trim();
  }

  /**
   * Get all products from the API
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products/all`).pipe(
      map(products => products.map(product => this.transformApiProduct(product))),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a product by ID from the API
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`).pipe(
      map(product => this.transformApiProduct(product)),
      catchError(error => {
        console.error(`Error fetching product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get paginated products with optional filters
   */
  getPaginatedProducts(page: number = 0, size: number = 10, filters?: any): Observable<{ content: Product[], totalElements: number, totalPages: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Add any filters if provided
    if (filters) {
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.minPrice) {
        params = params.set('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice) {
        params = params.set('maxPrice', filters.maxPrice.toString());
      }
      if (filters.sort) {
        params = params.set('sort', filters.sort);
      }
    }

    return this.http.get<any>(`${this.apiUrl}/products`, { params }).pipe(
      map(response => ({
        content: response.content.map((product: any) => this.transformApiProduct(product)),
        totalElements: response.totalElements,
        totalPages: response.totalPages
      })),
      catchError(error => {
        console.error('Error fetching paginated products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Search products by keyword (searches in name and description)
   */
  searchProducts(keyword: string): Observable<Product[]> {
    if (!keyword || keyword.trim().length === 0) {
      return of([]);
    }

    const params = new HttpParams().set('search', keyword.trim());
    
    return this.http.get<any>(`${this.apiUrl}/products/search`, { params }).pipe(
      map(response => {
        if (!response) {
          return [];
        }
        return Array.isArray(response) 
          ? response.map(item => this.transformApiProduct(item))
          : [];
      }),
      catchError(error => {
        console.error(`Error searching products with keyword '${keyword}':`, error);
        return of([]); // Return empty array instead of throwing error
      })
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryIdOrSlug: string): Observable<Product[]> {
    console.log(`Fetching products for category: ${categoryIdOrSlug}`);
    
    // Check if it's a numeric ID or a slug
    if (!isNaN(Number(categoryIdOrSlug))) {
      // If it's a numeric ID, use the category ID endpoint
      const categoryId = Number(categoryIdOrSlug);
      return this.http.get<any>(`${this.apiUrl}/products/category/${categoryId}`).pipe(
        map(response => {
          console.log(`Products for category ID ${categoryId}:`, response);
          const products = response.content || response;
          return Array.isArray(products) 
            ? products.map(item => this.transformApiProduct(item))
            : [];
        }),
        catchError(error => {
          console.error(`Error fetching products for category ID ${categoryId}:`, error);
          return throwError(() => error);
        })
      );
    } else {
      // If it's a string slug, use the slug endpoint
      const slug = categoryIdOrSlug.toLowerCase().trim();
      return this.http.get<any>(`${this.apiUrl}/products/category/${slug}`).pipe(
        map(response => {
          console.log(`Products for category slug ${slug}:`, response);
          const products = response.content || response;
          return Array.isArray(products) 
            ? products.map(item => this.transformApiProduct(item))
            : [];
        }),
        catchError(error => {
          console.error(`Error fetching products for category slug ${slug}:`, error);
          return throwError(() => error);
        })
      );
    }
  }

  /**
   * Get products by store from the API
   */
  getProductsByStore(storeId: number): Observable<Product[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stores/${storeId}`).pipe(
      map(products => products.map(product => this.transformApiProduct(product))),
      catchError(error => {
        console.error(`Error fetching products for store ${storeId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get featured products from the API
   */
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/products/featured`).pipe(
      map(response => {
        console.log('API Response for featured products:', response);
        const items = response && response.content ? response.content : response;
        return Array.isArray(items) 
          ? items.map(item => this.transformApiProduct(item))
          : [];
      }),
      catchError(error => {
        console.error('Error fetching featured products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get banners for the home page
   */
  getBanners(): Observable<Banner[]> {
    // In a real application, this would fetch from an API
    return of(this.banners);
  }

  /**
   * Toggle favorite status for a product
   */
  toggleFavorite(productId: number): Observable<boolean> {
    // In a real app, this would make an API call to toggle favorite status
    // For now, we'll simulate the toggle with a mock response
    return of(true).pipe(
      tap(isFavorite => {
        console.log(`Product ${productId} favorite status toggled to ${isFavorite}`);
      }),
      catchError(error => {
        console.error(`Error toggling favorite status for product ${productId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get new arrivals products
   */
  getNewArrivals(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/products/new-arrivals`).pipe(
      tap(response => console.log('Raw API Response for new arrivals:', JSON.stringify(response, null, 2))),
      map(response => {
        console.log('API Response for new arrivals:', response);
        // Transform the API response to match our Product model
        return Array.isArray(response) 
          ? response.map(item => this.transformApiProduct(item))
          : [];
      }),
      catchError(error => {
        console.error('Error fetching new arrivals:', error);
        // Return some mock products as fallback
        return this.getProducts().pipe(
          map(products => products.slice(0, 8))
        );
      })
    );
  }

  /**
   * Get category URL information for a specific product
   */
  getProductCategoryUrl(productId: number): Observable<{url: string, slug: string, name: string}> {
    return this.http.get<{url: string, slug: string, name: string}>(`${this.apiUrl}/products/${productId}/category-url`).pipe(
      map(response => {
        // Ensure URL starts with /category/
        if (!response.url.startsWith('/category/')) {
          response.url = `/category/${response.slug}`;
        }
        return response;
      }),
      catchError(error => {
        console.error('Error getting product category URL:', error);
        // Return a default response that routes to all products
        return of({
          url: '/category/all',
          slug: 'all',
          name: 'All Products'
        });
      })
    );
  }
}
