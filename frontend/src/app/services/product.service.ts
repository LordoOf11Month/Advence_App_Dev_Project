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
      id: 1001,
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
      fastDelivery: true,
      sellerId: 'seller1',
      sellerName: 'Fashion Store'
    },
    {
      id: 1002,
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
      freeShipping: true,
      sellerId: 'seller2',
      sellerName: 'Elegance Boutique'
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
      fastDelivery: true,
      sellerId: 'seller3',
      sellerName: 'SportEx Store'
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
      fastDelivery: true,
      sellerId: 'seller4',
      sellerName: 'TechGear Store'
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
      freeShipping: true,
      sellerId: 'seller5',
      sellerName: 'UrbanStyle Store'
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
      fastDelivery: true,
      sellerId: 'seller6',
      sellerName: 'SoundPro Store'
    }
  ];

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
