import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Product, Category, Banner } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // API URL
  private apiUrl = 'http://localhost:8080/api/public/products';
  
  // Keep categories and banners as mock data for now
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
        },
        {
          id: 103,
          name: 'TV, Audio & Video',
          slug: 'tv-audio-video',
          subcategories: [
            { id: 1031, name: 'Televisions', slug: 'televisions' },
            { id: 1032, name: 'Headphones & Earphones', slug: 'headphones-earphones' },
            { id: 1033, name: 'Speakers', slug: 'speakers' },
            { id: 1034, name: 'Soundbars', slug: 'soundbars' },
            { id: 1035, name: 'Projectors', slug: 'projectors' }
          ]
        },
        {
          id: 104,
          name: 'Cameras & Photography',
          slug: 'cameras-photography',
          subcategories: [
            { id: 1041, name: 'Digital Cameras', slug: 'digital-cameras' },
            { id: 1042, name: 'Lenses', slug: 'camera-lenses' },
            { id: 1043, name: 'Drones', slug: 'drones' },
            { id: 1044, name: 'Camera Accessories', slug: 'camera-accessories' }
          ]
        },
        {
          id: 105,
          name: 'Gaming',
          slug: 'gaming',
          subcategories: [
            { id: 1051, name: 'Gaming Consoles', slug: 'gaming-consoles' },
            { id: 1052, name: 'Games', slug: 'games' },
            { id: 1053, name: 'Gaming Accessories', slug: 'gaming-accessories' }
          ]
        },
        {
          id: 106,
          name: 'Smart Home',
          slug: 'smart-home',
          subcategories: [
            { id: 1061, name: 'Smart Lights', slug: 'smart-lights' },
            { id: 1062, name: 'Smart Assistants', slug: 'smart-assistants' },
            { id: 1063, name: 'Smart Security', slug: 'smart-security' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Fashion',
      slug: 'fashion',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 201,
          name: 'Women',
          slug: 'women',
          subcategories: [
            { id: 2011, name: 'Clothing', slug: 'women-clothing' },
            { id: 2012, name: 'Shoes', slug: 'women-shoes' },
            { id: 2013, name: 'Bags & Wallets', slug: 'women-bags-wallets' },
            { id: 2014, name: 'Accessories', slug: 'women-accessories' }
          ]
        },
        {
          id: 202,
          name: 'Men',
          slug: 'men',
          subcategories: [
            { id: 2021, name: 'Clothing', slug: 'men-clothing' },
            { id: 2022, name: 'Shoes', slug: 'men-shoes' },
            { id: 2023, name: 'Bags & Wallets', slug: 'men-bags-wallets' },
            { id: 2024, name: 'Accessories', slug: 'men-accessories' }
          ]
        },
        {
          id: 203,
          name: 'Kids',
          slug: 'kids',
          subcategories: [
            { id: 2031, name: 'Clothing', slug: 'kids-clothing' },
            { id: 2032, name: 'Shoes', slug: 'kids-shoes' },
            { id: 2033, name: 'Accessories', slug: 'kids-accessories' }
          ]
        }
      ]
    },
    {
      id: 3,
      name: 'Home & Living',
      slug: 'home-living',
      imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 301,
          name: 'Furniture',
          slug: 'furniture',
          subcategories: [
            { id: 3011, name: 'Living Room', slug: 'living-room-furniture' },
            { id: 3012, name: 'Bedroom', slug: 'bedroom-furniture' },
            { id: 3013, name: 'Office', slug: 'office-furniture' }
          ]
        },
        {
          id: 302,
          name: 'Home Decor',
          slug: 'home-decor',
          subcategories: [
            { id: 3021, name: 'Lighting', slug: 'lighting' },
            { id: 3022, name: 'Wall Art', slug: 'wall-art' },
            { id: 3023, name: 'Rugs & Carpets', slug: 'rugs-carpets' },
            { id: 3024, name: 'Curtains', slug: 'curtains' }
          ]
        },
        {
          id: 303,
          name: 'Kitchen & Dining',
          slug: 'kitchen-dining',
          subcategories: [
            { id: 3031, name: 'Cookware', slug: 'cookware' },
            { id: 3032, name: 'Tableware', slug: 'tableware' },
            { id: 3033, name: 'Kitchen Appliances', slug: 'kitchen-appliances' }
          ]
        },
        {
          id: 304,
          name: 'Bedding',
          slug: 'bedding',
          subcategories: [
            { id: 3041, name: 'Bed Sheets', slug: 'bed-sheets' },
            { id: 3042, name: 'Pillows', slug: 'pillows' },
            { id: 3043, name: 'Comforters', slug: 'comforters' }
          ]
        },
        {
          id: 305,
          name: 'Storage & Organization',
          slug: 'storage-organization',
          subcategories: [
            { id: 3051, name: 'Wardrobes', slug: 'wardrobes' },
            { id: 3052, name: 'Shelves', slug: 'shelves' },
            { id: 3053, name: 'Organizers', slug: 'organizers' }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 401, name: 'Makeup', slug: 'makeup' },
        { id: 402, name: 'Skincare', slug: 'skincare' },
        { id: 403, name: 'Hair Care', slug: 'hair-care' },
        { id: 404, name: 'Fragrances', slug: 'fragrances' },
        { id: 405, name: 'Tools & Accessories', slug: 'beauty-tools-accessories' },
        { id: 406, name: "Men's Grooming", slug: 'mens-grooming' }
      ]
    },
    {
      id: 5,
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 501,
          name: 'Exercise & Fitness',
          slug: 'exercise-fitness',
          subcategories: [
            { id: 5011, name: 'Treadmills', slug: 'treadmills' },
            { id: 5012, name: 'Dumbbells', slug: 'dumbbells' },
            { id: 5013, name: 'Yoga Mats', slug: 'yoga-mats' }
          ]
        },
        {
          id: 502,
          name: 'Outdoor Recreation',
          slug: 'outdoor-recreation',
          subcategories: [
            { id: 5021, name: 'Camping & Hiking', slug: 'camping-hiking' },
            { id: 5022, name: 'Bicycles', slug: 'bicycles' }
          ]
        },
        {
          id: 503,
          name: 'Sportswear',
          slug: 'sportswear',
          subcategories: [
            { id: 5031, name: 'Clothing', slug: 'sports-clothing' },
            { id: 5032, name: 'Footwear', slug: 'sports-footwear' }
          ]
        },
        {
          id: 504,
          name: 'Team Sports',
          slug: 'team-sports',
          subcategories: [
            { id: 5041, name: 'Football', slug: 'football' },
            { id: 5042, name: 'Basketball', slug: 'basketball' },
            { id: 5043, name: 'Tennis', slug: 'tennis' }
          ]
        }
      ]
    },
    {
      id: 6,
      name: 'Baby & Kids',
      slug: 'baby-kids',
      imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 601,
          name: 'Baby Products',
          slug: 'baby-products',
          subcategories: [
            { id: 6011, name: 'Strollers', slug: 'strollers' },
            { id: 6012, name: 'Car Seats', slug: 'car-seats' },
            { id: 6013, name: 'Baby Care', slug: 'baby-care' }
          ]
        },
        {
          id: 602,
          name: 'Toys',
          slug: 'toys',
          subcategories: [
            { id: 6021, name: 'Educational Toys', slug: 'educational-toys' },
            { id: 6022, name: 'Action Figures', slug: 'action-figures' },
            { id: 6023, name: 'Dolls', slug: 'dolls' },
            { id: 6024, name: 'Board Games', slug: 'board-games' },
            { id: 6025, name: 'Puzzles', slug: 'puzzles' }
          ]
        },
        { id: 603, name: "Kids' Furniture", slug: 'kids-furniture' }
      ]
    },
    {
      id: 7,
      name: 'Health & Wellness',
      slug: 'health-wellness',
      imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 701, name: 'Vitamins & Supplements', slug: 'vitamins-supplements' },
        { id: 702, name: 'Medical Supplies', slug: 'medical-supplies' },
        { id: 703, name: 'Personal Care', slug: 'personal-care' },
        { id: 704, name: 'Sexual Wellness', slug: 'sexual-wellness' },
        { id: 705, name: 'First Aid', slug: 'first-aid' }
      ]
    },
    {
      id: 8,
      name: 'Automotive',
      slug: 'automotive',
      imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 801,
          name: 'Car Accessories',
          slug: 'car-accessories',
          subcategories: [
            { id: 8011, name: 'Seat Covers', slug: 'seat-covers' },
            { id: 8012, name: 'Dash Cams', slug: 'dash-cams' }
          ]
        },
        { id: 802, name: 'Motorcycle Accessories', slug: 'motorcycle-accessories' },
        { id: 803, name: 'Car Electronics', slug: 'car-electronics' },
        { id: 804, name: 'Tires & Wheels', slug: 'tires-wheels' },
        { id: 805, name: 'Tools & Equipment', slug: 'automotive-tools' }
      ]
    },
    {
      id: 9,
      name: 'Grocery & Food',
      slug: 'grocery-food',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 901, name: 'Fresh Produce', slug: 'fresh-produce' },
        { id: 902, name: 'Packaged Foods', slug: 'packaged-foods' },
        { id: 903, name: 'Beverages', slug: 'beverages' },
        { id: 904, name: 'Snacks', slug: 'snacks' },
        { id: 905, name: 'Organic & Health Foods', slug: 'organic-health-foods' },
        { id: 906, name: 'Household Essentials', slug: 'household-essentials' }
      ]
    },
    {
      id: 10,
      name: 'Books & Entertainment',
      slug: 'books-entertainment',
      imageUrl: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 1001,
          name: 'Books',
          slug: 'books',
          subcategories: [
            { id: 10011, name: 'Fiction', slug: 'fiction' },
            { id: 10012, name: 'Non-Fiction', slug: 'non-fiction' },
            { id: 10013, name: 'Educational', slug: 'educational-books' }
          ]
        },
        { id: 1002, name: 'Movies & TV Shows', slug: 'movies-tv' },
        { id: 1003, name: 'Music', slug: 'music' }
      ]
    },
    {
      id: 11,
      name: 'Office Products',
      slug: 'office-products',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=60',
      subcategories: [
        {
          id: 1101,
          name: 'Office Supplies',
          slug: 'office-supplies',
          subcategories: [
            { id: 11011, name: 'Stationery', slug: 'stationery' },
            { id: 11012, name: 'Printers & Ink', slug: 'printers-ink' }
          ]
        },
        { id: 1102, name: 'Office Furniture', slug: 'office-furniture' },
        {
          id: 1103,
          name: 'Business Technology',
          slug: 'business-technology',
          subcategories: [
            { id: 11031, name: 'Projectors', slug: 'projectors' },
            { id: 11032, name: 'Office Phones', slug: 'office-phones' }
          ]
        }
      ]
    },
    {
      id: 12,
      name: 'Pet Supplies',
      slug: 'pet-supplies',
      imageUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 1201, name: 'Dog Supplies', slug: 'dog-supplies' },
        { id: 1202, name: 'Cat Supplies', slug: 'cat-supplies' },
        { id: 1203, name: 'Bird Supplies', slug: 'bird-supplies' },
        { id: 1204, name: 'Fish & Aquatic Pets', slug: 'fish-aquatic' },
        { id: 1205, name: 'Pet Food', slug: 'pet-food' },
        { id: 1206, name: 'Pet Toys & Accessories', slug: 'pet-toys-accessories' }
      ]
    },
    {
      id: 13,
      name: 'Jewelry & Watches',
      slug: 'jewelry-watches',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 1301, name: "Women's Jewelry", slug: 'womens-jewelry' },
        { id: 1302, name: "Men's Jewelry", slug: 'mens-jewelry' },
        {
          id: 1303,
          name: 'Watches',
          slug: 'watches',
          subcategories: [
            { id: 13031, name: "Men's Watches", slug: 'mens-watches' },
            { id: 13032, name: "Women's Watches", slug: 'womens-watches' }
          ]
        },
        { id: 1304, name: 'Fine Jewelry', slug: 'fine-jewelry' },
        { id: 1305, name: 'Fashion Jewelry', slug: 'fashion-jewelry' }
      ]
    },
    {
      id: 14,
      name: 'Industrial & Scientific',
      slug: 'industrial-scientific',
      imageUrl: 'https://images.unsplash.com/photo-1576153192396-180ecef2a715?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 1401, name: 'Lab & Scientific Products', slug: 'lab-scientific' },
        { id: 1402, name: 'Industrial Supplies', slug: 'industrial-supplies' },
        { id: 1403, name: 'Safety Supplies', slug: 'safety-supplies' },
        { id: 1404, name: 'Tools & Instruments', slug: 'industrial-tools' }
      ]
    },
    {
      id: 15,
      name: 'Travel & Luggage',
      slug: 'travel-luggage',
      imageUrl: 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?auto=format&fit=crop&q=60',
      subcategories: [
        { id: 1501, name: 'Suitcases', slug: 'suitcases' },
        { id: 1502, name: 'Backpacks', slug: 'backpacks' },
        { id: 1503, name: 'Travel Accessories', slug: 'travel-accessories' },
        { id: 1504, name: 'Travel-sized Essentials', slug: 'travel-essentials' }
      ]
    }
  ];

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

  constructor(private http: HttpClient) { }

  // Main method to transform backend response to our frontend Product model
  private transformApiProduct(apiProduct: any): Product {
    // Log the raw API product data to debug category structure
    console.log('Raw API product data:', JSON.stringify(apiProduct, null, 2));
    
    // Process category data with improved handling of nested structures
    let categoryData = '';
    
    if (apiProduct.category) {
      if (typeof apiProduct.category === 'object') {
        // If category is an object with name property
        categoryData = apiProduct.category.name || '';
        
        // If we have a slug use that instead as it's more consistent for routing
        if (apiProduct.category.slug) {
          categoryData = apiProduct.category.slug;
        }
      } else if (typeof apiProduct.category === 'string') {
        // If category is directly a string
        categoryData = apiProduct.category;
      }
    } else if (apiProduct.categoryName) {
      // Fallback to categoryName if available
      categoryData = apiProduct.categoryName;
    } else if (apiProduct.categoryId) {
      // If we have categoryId but no name, try to find the category from our list
      const foundCategory = this.findCategoryById(apiProduct.categoryId);
      if (foundCategory) {
        categoryData = foundCategory.slug || foundCategory.name;
      }
    }
    
    // Default values for required fields if they don't exist in API response
    return {
      id: apiProduct.id,
      title: apiProduct.name || apiProduct.title || 'Untitled Product',
      description: apiProduct.description || '',
      price: apiProduct.price || 0,
      originalPrice: apiProduct.originalPrice || apiProduct.original_price,
      discountPercentage: apiProduct.discountPercentage || apiProduct.discount_percentage,
      category: categoryData,
      brand: this.extractBrandData(apiProduct),
      rating: apiProduct.rating || (apiProduct.totalRating && apiProduct.ratingCount 
                ? apiProduct.totalRating / apiProduct.ratingCount 
                : 4.0), // Calculate rating from total and count if available
      reviewCount: apiProduct.reviewCount || apiProduct.rating_count || 0,
      images: this.extractImages(apiProduct),
      colors: apiProduct.colors || apiProduct.variants?.map((v: any) => v.color).filter(Boolean) || [],
      sizes: apiProduct.sizes || apiProduct.variants?.map((v: any) => v.size).filter(Boolean) || [],
      freeShipping: apiProduct.freeShipping || apiProduct.free_shipping || false,
      fastDelivery: apiProduct.fastDelivery || apiProduct.fast_delivery || false,
      inStock: this.determineStockStatus(apiProduct),
      sellerId: this.extractSellerId(apiProduct),
      sellerName: this.extractSellerName(apiProduct),
      variants: apiProduct.variants || [],
      isFavorite: apiProduct.isFavorite || false
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

  getProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      tap(response => console.log('Raw API Response:', JSON.stringify(response, null, 2))),
      map(response => {
        console.log('API Response for products:', response);
        // Transform the API response to match our Product model
        return Array.isArray(response) 
          ? response.map(item => this.transformApiProduct(item))
          : [];
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log(`Raw API Response for product ${id}:`, JSON.stringify(response, null, 2))),
      map(response => {
        console.log(`API Response for product ${id}:`, response);
        return this.transformApiProduct(response);
      }),
      catchError(error => {
        console.error(`Error fetching product with ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const params = new HttpParams().set('category', category);
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      tap(response => console.log(`Raw API Response for category ${category}:`, JSON.stringify(response, null, 2))),
      map(response => {
        console.log(`API Response for category ${category}:`, response);
        // Handle both array responses and paginated responses
        const items = response && response.content ? response.content : response;
        return Array.isArray(items) 
          ? items.map(item => this.transformApiProduct(item))
          : [];
      }),
      catchError(error => {
        console.error(`Error fetching products for category ${category}:`, error);
        return throwError(() => error);
      })
    );
  }

  getProductsByStore(storeId: number): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/stores/${storeId}`).pipe(
      map(response => {
        console.log(`API Response for store ${storeId}:`, response);
        return Array.isArray(response) 
          ? response.map(item => this.transformApiProduct(item))
          : [];
      }),
      catchError(error => {
        console.error(`Error fetching products for store ${storeId}:`, error);
        return throwError(() => error);
      })
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    // Use the main products endpoint and get the first 4 products
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('API Response for featured products:', response);
        // Handle both array responses and paginated responses
        const items = response && response.content ? response.content : response;
        const products = Array.isArray(items) 
          ? items.map(item => this.transformApiProduct(item))
          : [];
        return products.slice(0, 4);
      }),
      catchError(error => {
        console.error('Error fetching featured products:', error);
        return throwError(() => error);
      })
    );
  }

  getNewArrivals(): Observable<Product[]> {
    // Use the main products endpoint and select a different slice for "new arrivals"
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('API Response for new arrivals:', response);
        // Handle both array responses and paginated responses
        const items = response && response.content ? response.content : response;
        const products = Array.isArray(items) 
          ? items.map(item => this.transformApiProduct(item))
          : [];
        return products.slice(0, 4);
      }),
      catchError(error => {
        console.error('Error fetching new arrivals:', error);
        return throwError(() => error);
      })
    );
  }

  getCategories(): Observable<Category[]> {
    // This should be replaced with an API call in the future
    return of(this.categories);
  }

  getBanners(): Observable<Banner[]> {
    // This should be replaced with an API call in the future
    return of(this.banners);
  }

  toggleFavorite(productId: number): Observable<boolean> {
    // In a real implementation, this would call a backend API
    // For now, let's simulate a successful API call
    return of(true);
  }
}
