import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, Category, Banner } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Mock data for demonstration purposes
  private products: Product[] = [
    {
      id: 1,
      title: 'Men\'s Casual T-Shirt',
      price: 199.99,
      originalPrice: 299.99,
      discountPercentage: 33,
      description: 'Comfortable cotton t-shirt with a modern design.',
      category: 'men-clothing',
      brand: 'Fashion Brand',
      rating: 4.5,
      reviewCount: 120,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ],
      colors: ['Black', 'White', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      isFavorite: false,
      inStock: true,
      freeShipping: true,
      fastDelivery: true
    },
    {
      id: 2,
      title: 'Women\'s Summer Dress',
      price: 349.99,
      originalPrice: 499.99,
      discountPercentage: 30,
      description: 'Elegant summer dress perfect for casual outings.',
      category: 'women-clothing',
      brand: 'Elegance',
      rating: 4.8,
      reviewCount: 85,
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ],
      colors: ['Red', 'Blue', 'Yellow'],
      sizes: ['XS', 'S', 'M', 'L'],
      isFavorite: true,
      inStock: true,
      freeShipping: true
    },
    {
      id: 3,
      title: 'Sports Running Shoes',
      price: 599.99,
      originalPrice: 799.99,
      discountPercentage: 25,
      description: 'Comfortable running shoes with advanced cushioning.',
      category: 'shoes',
      brand: 'SportEx',
      rating: 4.6,
      reviewCount: 210,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ],
      colors: ['Black', 'White', 'Blue', 'Red'],
      sizes: ['39', '40', '41', '42', '43', '44'],
      isFavorite: false,
      inStock: true,
      fastDelivery: true
    },
    {
      id: 4,
      title: 'Smart Watch Series 5',
      price: 1299.99,
      originalPrice: 1599.99,
      discountPercentage: 19,
      description: 'Advanced smartwatch with health monitoring features.',
      category: 'electronics',
      brand: 'TechGear',
      rating: 4.7,
      reviewCount: 156,
      images: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ],
      colors: ['Black', 'Silver', 'Gold'],
      isFavorite: true,
      inStock: true,
      freeShipping: true,
      fastDelivery: true
    },
    {
      id: 5,
      title: 'Stylish Backpack',
      price: 249.99,
      originalPrice: 349.99,
      discountPercentage: 29,
      description: 'Durable and stylish backpack with multiple compartments.',
      category: 'accessories',
      brand: 'UrbanStyle',
      rating: 4.3,
      reviewCount: 92,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ],
      colors: ['Black', 'Gray', 'Blue'],
      isFavorite: false,
      inStock: true,
      freeShipping: true
    },
    {
      id: 6,
      title: 'Wireless Headphones',
      price: 799.99,
      originalPrice: 999.99,
      discountPercentage: 20,
      description: 'High-quality wireless headphones with noise cancellation.',
      category: 'electronics',
      brand: 'SoundPro',
      rating: 4.9,
      reviewCount: 178,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
      ],
      colors: ['Black', 'White', 'Red'],
      isFavorite: true,
      inStock: true,
      freeShipping: true,
      fastDelivery: true
    }
  ];

  private categories: Category[] = [
    {
      id: 1,
      name: 'Women',
      slug: 'women',
      imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      subcategories: [
        { id: 11, name: 'Clothing', slug: 'women-clothing' },
        { id: 12, name: 'Shoes', slug: 'women-shoes' },
        { id: 13, name: 'Accessories', slug: 'women-accessories' }
      ]
    },
    {
      id: 2,
      name: 'Men',
      slug: 'men',
      imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      subcategories: [
        { id: 21, name: 'Clothing', slug: 'men-clothing' },
        { id: 22, name: 'Shoes', slug: 'men-shoes' },
        { id: 23, name: 'Accessories', slug: 'men-accessories' }
      ]
    },
    {
      id: 3,
      name: 'Electronics',
      slug: 'electronics',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      subcategories: [
        { id: 31, name: 'Smartphones', slug: 'smartphones' },
        { id: 32, name: 'Laptops', slug: 'laptops' },
        { id: 33, name: 'Accessories', slug: 'electronics-accessories' }
      ]
    },
    {
      id: 4,
      name: 'Home & Living',
      slug: 'home-living',
      imageUrl: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      subcategories: [
        { id: 41, name: 'Furniture', slug: 'furniture' },
        { id: 42, name: 'Decor', slug: 'decor' },
        { id: 43, name: 'Kitchen', slug: 'kitchen' }
      ]
    },
    {
      id: 5,
      name: 'Beauty',
      slug: 'beauty',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      subcategories: [
        { id: 51, name: 'Makeup', slug: 'makeup' },
        { id: 52, name: 'Skincare', slug: 'skincare' },
        { id: 53, name: 'Fragrances', slug: 'fragrances' }
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

  constructor() { }

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductById(id: number): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const filteredProducts = this.products.filter(p => p.category === category);
    return of(filteredProducts);
  }

  getFeaturedProducts(): Observable<Product[]> {
    // Return a subset of products as featured
    return of(this.products.slice(0, 4));
  }

  getNewArrivals(): Observable<Product[]> {
    // Return some products as new arrivals
    return of(this.products.slice(2, 6));
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  getBanners(): Observable<Banner[]> {
    return of(this.banners);
  }

  toggleFavorite(productId: number): Observable<boolean> {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      product.isFavorite = !product.isFavorite;
      return of(product.isFavorite);
    }
    return of(false);
  }
}