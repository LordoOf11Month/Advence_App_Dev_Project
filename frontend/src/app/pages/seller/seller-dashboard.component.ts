import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SellerService } from '../../services/seller.service';
import { Product } from '../../models/product.model';
import { AdminOrder, AdminProduct, AdminStats, OrderStats } from '../../models/admin.model';
import { ErrorService } from '../../services/error.service';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { fadeInOut, listAnimation, slideUpDown, modalAnimation, sectionAnimation, tableRowAnimation } from '../../animations';
import { SortConfig, sortData, toggleSort } from '../../utils/table-sort';
import { FilterConfig, filterData, createFilter } from '../../utils/table-filter';
import { PaginationConfig, paginateData, PaginationResult, getPageSizes, calculateVisiblePages } from '../../utils/table-pagination';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  animations: [fadeInOut, listAnimation, slideUpDown, modalAnimation, sectionAnimation, tableRowAnimation],
  templateUrl: './seller-dashboard.component.html',
  styleUrls: ['./seller-dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // Overview data
  stats: AdminStats | null = null;
  orderStats: OrderStats | null = null;
  sellerId: string = '';
  storeName: string = '';
  todayOrders: number = 0;
  todayRevenue: number = 0;
  orderChange: number = 0;
  revenueChange: number = 0;
  activeProducts: number = 0;
  lowStockProducts: number = 0;
  rating: number = 0;
  totalReviews: number = 0;
  lowStockItems: AdminProduct[] = [];
  recentOrders: AdminOrder[] = [];

  // Product management
  products: AdminProduct[] = [];
  filteredProducts: AdminProduct[] = [];
  productSearchQuery: string = '';
  productStatusFilter: string = 'all';
  productSortBy: string = 'title';
  showProductForm: boolean = false;
  editingProduct: boolean = false;
  saving: boolean = false;
  currentProduct: AdminProduct = {
    id: '',
    title: '',
    price: 0,
    category: '',
    status: 'active',
    inStock: true,
    stock: 0,
    sellerId: '',
    sellerName: '',
    dateAdded: new Date(),
    lastUpdated: new Date(),
    description: '',
    imageUrl: '/assets/images/placeholder-product.svg'
  };

  // Order management
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  selectedOrder: AdminOrder | null = null;
  showStatusUpdate: boolean = false;
  allOrderStatuses: string[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  orderStatuses: string[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  selectedOrderStatus: string = 'all';

  // Active section tracking
  activeSection: string = 'overview';

  // Loading states
  isLoadingStats: boolean = false;
  isLoadingProducts: boolean = false;
  isLoadingOrders: boolean = false;
  isSavingProduct: boolean = false;

  // Error states
  statsError: string | null = null;
  productsError: string | null = null;
  ordersError: string | null = null;

  // Sorting configurations
  productSort: SortConfig = { column: 'title', direction: 'asc' };
  orderSort: SortConfig = { column: 'createdAt', direction: 'desc' };

  // Pagination configurations
  productPagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };
  orderPagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };

  // Pagination results
  paginatedProducts: PaginationResult<AdminProduct> | null = null;
  paginatedOrders: PaginationResult<AdminOrder> | null = null;

  // Subscription cleanup
  private subscriptions: Subscription[] = [];

  @ViewChildren('section') sections!: QueryList<ElementRef>;
  @ViewChild('mainContent') mainContent!: ElementRef;
  private currentSectionIndex = 0;
  private scrolling = false;
  private touchStartY: number = 0;
  private touchStartX: number = 0;
  private touchEndY: number = 0;
  private touchEndX: number = 0;
  private touchThreshold: number = 50;
  private touchStartTime: number = 0;
  private isSwiping: boolean = false;
  private swipeCooldown: boolean = false;

  // Mobile view detection
  isMobileView: boolean = false;
  
  constructor(
    private sellerService: SellerService,
    private errorService: ErrorService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkIfMobile();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }
  
  private checkIfMobile(): void {
    const prevMobileState = this.isMobileView;
    this.isMobileView = window.innerWidth <= 768; // Same breakpoint as CSS
    
    // If state changed, update UI accordingly
    if (prevMobileState !== this.isMobileView) {
      // Allow time for DOM to update
      setTimeout(() => {
        // Update active section in nav
        const activeNavLink = document.querySelector(this.isMobileView ? 
          '.mobile-nav a.active' : 
          '.seller-nav a.active');
          
        if (activeNavLink) {
          activeNavLink.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          });
        }
      }, 100);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ignore keyboard shortcuts when user is typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateToNextSection();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateToPreviousSection();
        break;
      case 'Escape':
        event.preventDefault();
        this.closeAllModals();
        break;
      case 'n':
        if (event.ctrlKey) {
          event.preventDefault();
          this.openProductForm();
        }
        break;
      case 's':
        if (event.ctrlKey && this.showProductForm) {
          event.preventDefault();
          this.saveProduct();
        }
        break;
    }
  }  .status-badge.delivered {
      background-color: var(--success-light);
      color: var(--success);
    }

    .status-badge.cancelled {
      background-color: var(--error-light);
      color: var(--error);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-4);
    }

    .product-card {
      background-color: var(--white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .product-card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
    }

    .product-info {
      padding: var(--space-3);
    }

    .product-info h3 {
      font-size: 0.9375rem;
      margin: 0;
      color: var(--neutral-900);
    }

    .price {
      font-weight: 600;
      color: var (--primary);
      margin: var(--space-1) 0;
    }

    .stock {
      font-size: 0.875rem;
      margin: 0;
    }

    .stock.warning {
      color: var(--warning);
    }

    .update-stock-btn {
      width: 100%;
      padding: var(--space-2);
      background-color: var(--neutral-100);
      color: var(--neutral-900);
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .update-stock-btn:hover {
      background-color: var(--neutral-200);
    }

    @media (max-width: 992px) {
      .dashboard-sections {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .seller-container {
        flex-direction: column;
      }

      .seller-sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid var(--neutral-200);
      }

      .seller-nav {
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }

      .seller-nav a {
  }
}

ngOnInit(): void {
  this.checkIfMobile();
  
  // Get current seller ID from auth service
  const currentUser = this.authService.getCurrentUser();
  
  if (currentUser && currentUser.role === 'seller') {
    this.sellerId = currentUser.id;
    this.loadDashboardData();
    this.loadProducts();
    this.loadOrders();
  } else {
    this.router.navigate(['/login'], { queryParams: { redirect: 'seller' } });
  }
}

private loadDashboardData(): void {
  // In a real application, these would be separate API calls
  // For now, we'll use mock data
  this.todayOrders = 12;
  this.todayRevenue = 4500;
  this.orderChange = 15;
  this.revenueChange = 8;
  this.rating = 4.8;
  this.totalReviews = 128;
}

private loadProducts(): void {
  // Load products
  this.products = [
    {
      id: 1,
      title: 'Wireless Earbuds',
      price: 299.99,
      category: 'Electronics',
      status: 'active',
      inStock: true,
      stock: 2,
      sellerId: this.sellerId,
      sellerName: this.storeName,
      dateAdded: new Date(),
      lastUpdated: new Date(),
      description: 'Wireless earbuds with long battery life',
      imageUrl: '/assets/images/placeholder-product.svg'
    },
    // Add more mock products as needed
  ];
}

private loadOrders(): void {
  // Load orders
  this.orders = [
    {
      id: '1',
      userId: 'user1',
      userEmail: 'customer@example.com',
      customerName: 'John Customer',
      items: [
        { productId: 1, productName: 'Wireless Earbuds', quantity: 1, price: 299.99 }
      ],
      totalAmount: 299.99,
      total: 299.99, // Set total equal to totalAmount
      status: 'pending',
      sellerId: this.sellerId,
      sellerName: this.storeName,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      createdAt: new Date(),
      shippingAddress: '123 Main St, Anytown, USA'
    },
    // Add more mock orders as needed
  ];
}