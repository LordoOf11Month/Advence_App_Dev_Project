import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, HostListener, ViewChild, AfterViewInit, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminStats, OrderStats, AdminProduct, AdminOrder, AdminUser, AdminSeller } from '../../models/admin.model';
import { ErrorService } from '../../services/error.service';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { fadeInOut, listAnimation, slideUpDown, modalAnimation, sectionAnimation, tableRowAnimation } from '../../animations';
import { SortConfig, sortData, toggleSort } from '../../utils/table-sort';
import { FilterConfig, filterData, createFilter } from '../../utils/table-filter';
import { PaginationConfig, paginateData, PaginationResult, getPageSizes, calculateVisiblePages } from '../../utils/table-pagination';
import { AuthService } from '../../services/auth.service';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  animations: [fadeInOut, listAnimation, slideUpDown, modalAnimation, sectionAnimation, tableRowAnimation],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // Overview data
  stats: AdminStats | null = null;
  orderStats: OrderStats | null = null;

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

  // User management
  users: AdminUser[] = [];
  showTransactions: boolean = false;
  userTransactions: any[] = [];
  isLoadingTransactions: boolean = false;
  transactionsError: string | null = null;

  // Active section tracking
  activeSection: string = 'overview';

  // Loading states
  isLoadingStats: boolean = false;
  isLoadingProducts: boolean = false;
  isLoadingOrders: boolean = false;
  isLoadingUsers: boolean = false;
  isSavingProduct: boolean = false;

  // Error states
  statsError: string | null = null;
  productsError: string | null = null;
  ordersError: string | null = null;
  usersError: string | null = null;

  // Sorting configurations
  productSort: SortConfig = { column: 'title', direction: 'asc' };
  orderSort: SortConfig = { column: 'createdAt', direction: 'desc' };
  userSort: SortConfig = { column: 'lastName', direction: 'asc' };

  // Pagination configurations
  productPagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };
  orderPagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };
  userPagination: PaginationConfig = { pageSize: 10, currentPage: 1, totalItems: 0 };

  // Pagination results
  paginatedProducts: PaginationResult<AdminProduct> | null = null;
  paginatedOrders: PaginationResult<AdminOrder> | null = null;
  paginatedUsers: PaginationResult<AdminUser> | null = null;

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

  // Mobile view detection - improved
  isMobileView: boolean = false;
  
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
          '.admin-nav a.active');
          
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
  }

  private closeAllModals(): void {
    this.showProductForm = false;
    this.selectedOrder = null;
    this.showStatusUpdate = false;
    this.showTransactions = false;
  }

  // Disable swipe navigation completely
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // Just store position for reference but don't trigger navigation
    this.touchStartY = event.touches[0].clientY;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartTime = Date.now();
    this.isSwiping = false;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    // No action - let native scrolling handle it
    return;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    // No action - disable swipe navigation
    return;
  }

  // Manual navigation only via clicks
  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      // Get the index of the current section
      const sectionIndex = ['overview', 'products', 'orders', 'users'].indexOf(sectionId);
      this.currentSectionIndex = sectionIndex;
      this.activeSection = sectionId;
      
      // Simply use native scroll with an offset
      const yOffset = -100; // Header offset
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
      
      // Also scroll the nav to show active item
      setTimeout(() => {
        const activeNavLink = document.querySelector('.admin-nav a.active');
        if (activeNavLink && this.isMobileView) {
          activeNavLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 100);
    }
  }

  // For keyboard navigation (keep it simple)
  private navigateToNextSection(): void {
    if (this.currentSectionIndex < this.sections.length - 1) {
      const nextIndex = this.currentSectionIndex + 1;
      const sectionId = ['overview', 'products', 'orders', 'users'][nextIndex];
      this.scrollToSection(sectionId);
    }
  }

  private navigateToPreviousSection(): void {
    if (this.currentSectionIndex > 0) {
      const prevIndex = this.currentSectionIndex - 1;
      const sectionId = ['overview', 'products', 'orders', 'users'][prevIndex];
      this.scrollToSection(sectionId);
    }
  }

  // Seller management
  sellers: AdminSeller[] = [];
  isLoadingSellers: boolean = false;
  sellersError: string | null = null;

  constructor(
    private adminService: AdminService,
    private errorService: ErrorService,
    private authService: AuthService,
    private router: Router,
    private sellerService: SellerService
  ) {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    // Verify admin permissions
    console.log('AdminDashboardComponent: Initializing');
    console.log('Is admin:', this.authService.isAdmin());
    
    if (!this.authService.isAdmin()) {
      console.error('Unauthorized access attempt to admin dashboard');
      this.errorService.showError('You do not have permission to access this page');
      this.router.navigate(['/']);
      return;
    }
    
    console.log('Admin access verified, loading dashboard data');
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    // Additional initialization logic after view is initialized
  }

  onScroll(): void {
    const sections = ['overview', 'products', 'orders', 'users'];
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  private loadDashboardData(): void {
    this.loadStats();
    this.loadProducts();
    this.loadOrders();
    this.loadUsers();
    this.loadSellers();
  }

  private loadStats(): void {
    this.isLoadingStats = true;
    this.statsError = null;

    const statsSub = this.adminService.getAdminStats().pipe(
      finalize(() => this.isLoadingStats = false),
      catchError(error => {
        this.statsError = 'Failed to load dashboard statistics';
        this.errorService.showError('Failed to load dashboard statistics');
        return of(null);
      })
    ).subscribe((stats) => {
      if (stats) {
        this.stats = stats;
      }
    });
    this.subscriptions.push(statsSub);

    const orderStatsSub = this.adminService.getOrderStats().pipe(
      catchError(error => {
        this.statsError = 'Failed to load order statistics';
        this.errorService.showError('Failed to load order statistics');
        return of(null);
      })
    ).subscribe((stats) => {
      if (stats) {
        this.orderStats = stats;
      }
    });
    this.subscriptions.push(orderStatsSub);
  }

  // Product management methods
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    console.log('Admin dashboard: Starting to load products');
    const productSub = this.adminService.getProducts().pipe(
      finalize(() => this.isLoadingProducts = false),
      catchError(error => {
        console.error('Admin dashboard: Error loading products:', error);
        if (error.status) {
          console.error(`Status: ${error.status}, Message: ${error.message}`);
        }
        if (error.error) {
          console.error('Server error:', error.error);
        }
        this.productsError = `Failed to load products: ${error.message || 'Unknown error'}`;
        this.errorService.showError('Failed to load products');
        return of([]);
      })
    ).subscribe(products => {
      console.log('Admin dashboard: Products loaded successfully', products);
      this.products = products;
      this.filterProducts();
    });
    this.subscriptions.push(productSub);
  }

  filterProducts(): void {
    let filtered = [...this.products];

    if (this.productSearchQuery) {
      const query = this.productSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query)
      );
    }

    if (this.productStatusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.productStatusFilter);
    }

    filtered.sort((a, b) => {
      switch (this.productSortBy) {
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.stock - b.stock;
        case 'lastUpdated':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        default:
          return a.title.localeCompare(b.title);
      }
    });

    this.filteredProducts = filtered;
    this.applyProductFilters();
  }

  openProductForm(): void {
    this.editingProduct = false;
    this.currentProduct = {
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
    
    // Ensure sellers are loaded for the dropdown
    if (this.sellers.length === 0) {
      this.loadSellers();
    }
    
    this.showProductForm = true;
  }

  editProduct(product: AdminProduct): void {
    this.editingProduct = true;
    this.currentProduct = { ...product };
    
    // Ensure seller data is properly set
    if (product.sellerId) {
      // If sellers aren't loaded yet, load them
      if (this.sellers.length === 0) {
        this.loadSellers();
      }
    }
    
    console.log('[EDIT] Current image URL before opening form:', this.currentProduct.imageUrl);
    console.log('[EDIT] Current seller ID:', this.currentProduct.sellerId);
    console.log('[EDIT] Current seller name:', this.currentProduct.sellerName);
    
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
  }

  saveProduct(): void {
    if (this.isSavingProduct) return;
    
    // Clean the image URL by removing any timestamp parameters
    if (this.currentProduct && this.currentProduct.imageUrl && this.currentProduct.imageUrl.includes('?')) {
      this.currentProduct.imageUrl = this.currentProduct.imageUrl.split('?')[0];
      console.log('[SAVE] Cleaned image URL for saving:', this.currentProduct.imageUrl);
    }
    
    console.log('[SAVE] Before API call - Image URL:', this.currentProduct.imageUrl);
    this.isSavingProduct = true;
    const action = this.editingProduct ? 'update' : 'create';
    
    // Special handling for image updates when editing an existing product
    if (this.editingProduct && this.currentProduct.imageUrl) {
      // Find the original product to check if image changed
      const originalProduct = this.products.find(p => p.id === this.currentProduct.id);
      const originalImageUrl = originalProduct?.imageUrl?.split('?')[0];
      const newImageUrl = this.currentProduct.imageUrl.split('?')[0];
      
      // If image URL changed, handle it separately
      if (originalImageUrl !== newImageUrl) {
        console.log('[SAVE] Image URL changed, handling it separately');
        console.log('[SAVE] Original:', originalImageUrl);
        console.log('[SAVE] New:', newImageUrl);
        
        // First update just the image
        this.adminService.updateProductImageDirect(this.currentProduct.id, newImageUrl)
          .pipe(
            catchError(error => {
              console.error('[SAVE] Error updating image:', error);
              // Continue with normal update even if image update fails
              return of(null);
            })
          )
          .subscribe(imageResult => {
            if (imageResult) {
              console.log('[SAVE] Image updated successfully:', imageResult.imageUrl);
              // Update our current product with the new image URL
              this.currentProduct.imageUrl = imageResult.imageUrl;
            }
            
            // Now proceed with the regular product update
            this.performProductUpdate(action);
          });
      } else {
        // No image change, proceed with normal update
        this.performProductUpdate(action);
      }
    } else {
      // New product or no image, proceed with normal update
      this.performProductUpdate(action);
    }
  }
  
  // Helper method to perform the actual product update/create operation
  private performProductUpdate(action: 'update' | 'create'): void {
    const request$ = action === 'update'
      ? this.adminService.updateProduct(this.currentProduct)
      : this.adminService.createProduct(this.currentProduct);

    request$.pipe(
      finalize(() => this.isSavingProduct = false),
      catchError(error => {
        console.error('[SAVE] API error:', error);
        this.errorService.showError(`Failed to ${action} product`);
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        console.log('[SAVE] API response product:', JSON.stringify(product));
        console.log('[SAVE] API response image URL:', product.imageUrl);
        
        if (action === 'update') {
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            // Update all fields including the imageUrl
            this.products[index] = {...product};
            console.log('[SAVE] Product updated in array', this.products[index].imageUrl);
          }
        } else {
          this.products.push({...product});
        }
        this.filterProducts();
        this.showProductForm = false;
        this.errorService.showSuccess(`Product ${action}d successfully`);
        
        // Add delay and reload products to ensure the image changes are reflected
        setTimeout(() => {
          this.loadProducts();
        }, 500);
      }
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminService.deleteProduct(productId).pipe(
        catchError(error => {
          this.errorService.showError('Failed to delete product');
          return of(null);
        })
      ).subscribe(result => {
        if (result !== null) {
          this.loadProducts();
          this.errorService.showSuccess('Product deleted successfully');
        }
      });
    }
  }

  toggleProductApproval(product: AdminProduct): void {
    const newApprovalStatus = product.status === 'inactive';
    this.adminService.approveProduct(product.id, newApprovalStatus).pipe(
      catchError(error => {
        this.errorService.showError(`Failed to ${newApprovalStatus ? 'approve' : 'disapprove'} product`);
        return of(null);
      })
    ).subscribe(updatedProduct => {
      if (updatedProduct) {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.filterProducts();
        this.errorService.showSuccess(`Product ${newApprovalStatus ? 'approved' : 'disapproved'} successfully`);
      }
    });
  }

  toggleFreeShipping(product: AdminProduct): void {
    const newFreeShipping = !product.freeShipping;
    this.adminService.toggleFreeShipping(product.id, newFreeShipping).pipe(
      catchError(error => {
        this.errorService.showError(`Failed to ${newFreeShipping ? 'enable' : 'disable'} free shipping`);
        return of(null);
      })
    ).subscribe(updatedProduct => {
      if (updatedProduct) {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            freeShipping: updatedProduct.freeShipping
          };
        }
        this.filterProducts();
        this.errorService.showSuccess(`Free shipping ${newFreeShipping ? 'enabled' : 'disabled'} successfully`);
      }
    });
  }

  toggleFastDelivery(product: AdminProduct): void {
    const newFastDelivery = !product.fastDelivery;
    this.adminService.toggleFastDelivery(product.id, newFastDelivery).pipe(
      catchError(error => {
        this.errorService.showError(`Failed to ${newFastDelivery ? 'enable' : 'disable'} fast delivery`);
        return of(null);
      })
    ).subscribe(updatedProduct => {
      if (updatedProduct) {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            fastDelivery: updatedProduct.fastDelivery
          };
        }
        this.filterProducts();
        this.errorService.showSuccess(`Fast delivery ${newFastDelivery ? 'enabled' : 'disabled'} successfully`);
      }
    });
  }

  // Order management methods
  loadOrders(): void {
    this.isLoadingOrders = true;
    this.ordersError = null;

    const ordersSub = this.adminService.getOrders().pipe(
      finalize(() => this.isLoadingOrders = false),
      catchError(error => {
        this.ordersError = 'Failed to load orders';
        this.errorService.showError('Failed to load orders');
        return of([]);
      })
    ).subscribe(orders => {
      this.orders = orders;
      this.filterByOrderStatus(this.selectedOrderStatus);
    });
    this.subscriptions.push(ordersSub);
  }

  filterByOrderStatus(status: string): void {
    this.selectedOrderStatus = status;
    this.filteredOrders = status === 'all' 
      ? this.orders 
      : this.orders.filter(order => order.status === status);
    this.applyOrderFilters();
  }

  viewOrderDetails(order: AdminOrder): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  updateOrderStatus(order: AdminOrder): void {
    this.selectedOrder = order;
    this.showStatusUpdate = true;
  }

  closeStatusUpdate(): void {
    this.showStatusUpdate = false;
  }

  selectStatus(status: string): void {
    this.selectedOrderStatus = status;
  }

  confirmStatusUpdate(): void {
    if (!this.selectedOrder || this.selectedOrderStatus === 'all') return;

    const previousStatus = this.selectedOrder.status;
    
    this.adminService.updateOrderStatus(
      this.selectedOrder.id, 
      this.selectedOrderStatus as AdminOrder['status']
    ).pipe(
      catchError(error => {
        this.errorService.showError('Failed to update order status');
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.loadOrders();
        this.closeStatusUpdate();
        this.selectedOrder = null;
        this.errorService.showSuccess('Order status updated successfully');
      } else {
        this.selectedOrderStatus = previousStatus;
      }
    });
  }

  resolveOrderIssue(order: AdminOrder): void {
    const issueType = order.status === 'pending' ? 'payment' : 'order';
    const method = order.status === 'pending' 
      ? this.adminService.resolvePaymentIssue(order.id)
      : this.adminService.resolveOrderIssue(order.id);

    method.pipe(
      catchError(error => {
        this.errorService.showError(`Failed to resolve ${issueType} issue`);
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        this.loadOrders();
        this.errorService.showSuccess(`${issueType.charAt(0).toUpperCase() + issueType.slice(1)} issue resolved successfully`);
      }
    });
  }

  // User management methods
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersError = null;

    const usersSub = this.adminService.getUsers().pipe(
      finalize(() => this.isLoadingUsers = false),
      catchError(error => {
        this.usersError = 'Failed to load users';
        this.errorService.showError('Failed to load users');
        return of([]);
      })
    ).subscribe(users => {
      this.users = users;
      this.applyUserFilters();
    });
    this.subscriptions.push(usersSub);
  }

  banUser(userId: string): void {
    if (confirm('Are you sure you want to ban this user?')) {
      const banSub = this.adminService.banUser(userId).pipe(
        catchError(error => {
          this.errorService.showError('Failed to ban user');
          return of(null);
        })
      ).subscribe(user => {
        if (user) {
          this.loadUsers(); // Reload data
          this.errorService.showSuccess('User banned successfully');
        }
      });
      this.subscriptions.push(banSub);
    }
  }

  unbanUser(userId: string): void {
    if (confirm('Are you sure you want to unban this user?')) {
      const unbanSub = this.adminService.unbanUser(userId).pipe(
        catchError(error => {
          this.errorService.showError('Failed to unban user');
          return of(null);
        })
      ).subscribe(user => {
        if (user) {
          this.loadUsers(); // Reload data
          this.errorService.showSuccess('User unbanned successfully');
        }
      });
      this.subscriptions.push(unbanSub);
    }
  }

  viewUserTransactions(userId: string): void {
    this.isLoadingTransactions = true;
    this.transactionsError = null;
    this.showTransactions = true;

    const txSub = this.adminService.getUserTransactions(userId).pipe(
      finalize(() => this.isLoadingTransactions = false),
      catchError(error => {
        this.transactionsError = 'Failed to load user transactions';
        this.errorService.showError('Failed to load user transactions');
        return of([]);
      })
    ).subscribe(transactions => {
      this.userTransactions = transactions;
    });
    this.subscriptions.push(txSub);
  }

  closeTransactions(): void {
    this.showTransactions = false;
  }

  updateStatus(order: AdminOrder): void {
    this.selectedOrder = order;
    this.showStatusUpdate = true;
  }

  // Product sorting and pagination methods
  sortProducts(column: string): void {
    this.productSort = toggleSort(this.productSort, column);
    this.applyProductFilters();
  }

  goToProductPage(page: number): void {
    this.productPagination.currentPage = page;
    this.applyProductFilters();
  }

  onProductPageSizeChange(): void {
    this.productPagination.currentPage = 1;
    this.applyProductFilters();
  }

  private applyProductFilters(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.productSearchQuery) {
      const searchFilter = createFilter('title', this.productSearchQuery, 'contains');
      filtered = filterData(filtered, [searchFilter]);
    }

    // Apply status filter
    if (this.productStatusFilter !== 'all') {
      const statusFilter = createFilter('status', this.productStatusFilter);
      filtered = filterData(filtered, [statusFilter]);
    }

    // Apply sorting
    filtered = sortData(filtered, this.productSort);

    // Update pagination config
    this.productPagination.totalItems = filtered.length;

    // Apply pagination
    this.paginatedProducts = paginateData(filtered, this.productPagination);
    this.filteredProducts = this.paginatedProducts.items;
  }

  // Orders sorting and pagination methods
  sortOrders(column: string): void {
    this.orderSort = toggleSort(this.orderSort, column);
    this.applyOrderFilters();
  }

  goToOrderPage(page: number): void {
    this.orderPagination.currentPage = page;
    this.applyOrderFilters();
  }

  onOrderPageSizeChange(): void {
    this.orderPagination.currentPage = 1;
    this.applyOrderFilters();
  }

  private applyOrderFilters(): void {
    let filtered = [...this.orders];

    // Apply status filter
    if (this.selectedOrderStatus !== 'all') {
      const statusFilter = createFilter('status', this.selectedOrderStatus);
      filtered = filterData(filtered, [statusFilter]);
    }

    // Apply sorting
    filtered = sortData(filtered, this.orderSort);

    // Update pagination config
    this.orderPagination.totalItems = filtered.length;

    // Apply pagination
    this.paginatedOrders = paginateData(filtered, this.orderPagination);
    this.filteredOrders = this.paginatedOrders.items;
  }

  // Users sorting and pagination methods
  sortUsers(column: string): void {
    this.userSort = toggleSort(this.userSort, column);
    this.applyUserFilters();
  }

  goToUserPage(page: number): void {
    this.userPagination.currentPage = page;
    this.applyUserFilters();
  }

  onUserPageSizeChange(): void {
    this.userPagination.currentPage = 1;
    this.applyUserFilters();
  }

  private applyUserFilters(): void {
    let filtered = [...this.users];

    // Apply sorting
    filtered = sortData(filtered, this.userSort);

    // Update pagination config
    this.userPagination.totalItems = filtered.length;

    // Apply pagination
    this.paginatedUsers = paginateData(filtered, this.userPagination);
  }

  getPageSizes(totalItems: number): number[] {
    const baseSizes = [10, 25, 50, 100];
    return baseSizes.filter(size => size <= totalItems);
  }

  calculateVisiblePages(currentPage: number, totalPages: number): number[] {
    return calculateVisiblePages(currentPage, totalPages);
  }

  // Preview image URL in the form by adding a timestamp to force refresh
  previewImage(): void {
    if (this.currentProduct && this.currentProduct.imageUrl) {
      // Store the original URL without timestamp
      const originalUrl = this.currentProduct.imageUrl.includes('?') 
        ? this.currentProduct.imageUrl.split('?')[0]
        : this.currentProduct.imageUrl;
      
      // Add timestamp to force image refresh but keep the original URL for saving
      this.currentProduct.imageUrl = originalUrl + '?t=' + new Date().getTime();
      console.log('[PREVIEW] Updated image URL with timestamp:', this.currentProduct.imageUrl);
    }
  }
  
  // Update only the image URL of the product
  updateImageOnly(): void {
    if (!this.currentProduct || !this.currentProduct.id || !this.currentProduct.imageUrl) {
      this.errorService.showError('Product ID or image URL is missing');
      return;
    }
    
    // Store the user-entered image URL directly
    const enteredImageUrl = this.currentProduct.imageUrl;
    
    // Clean the URL by removing only timestamp parameters, preserve other query params
    let cleanImageUrl = enteredImageUrl;
    if (cleanImageUrl.includes('?t=')) {
      cleanImageUrl = cleanImageUrl.split('?t=')[0];
    } else if (cleanImageUrl.includes('&t=')) {
      cleanImageUrl = cleanImageUrl.split('&t=')[0];
    }
    
    console.log('[SAVE] Cleaned image URL for saving:', cleanImageUrl);
    console.log('[SAVE] Before API call - Image URL:', cleanImageUrl);
    
    this.isSavingProduct = true;
    
    this.adminService.updateProductImageDirect(this.currentProduct.id, cleanImageUrl)
      .pipe(
        finalize(() => {
          this.isSavingProduct = false;
        }),
        catchError(error => {
          this.errorService.showError('Failed to update product image');
          console.error('[SAVE] Error updating image:', error);
          return of(null);
        })
      )
      .subscribe(updatedProduct => {
        if (updatedProduct) {
          console.log('[SAVE] API response product:', JSON.stringify(updatedProduct));
          console.log('[SAVE] API response image URL:', updatedProduct.imageUrl);
          
          this.errorService.showSuccess('Product image updated successfully');
          
          // Update the product in our list
          const index = this.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            // Update the product with the response
            this.products[index] = {
              ...this.products[index],
              imageUrl: updatedProduct.imageUrl // Service already adds timestamp 
            };
            
            // Also update current product if we're editing it
            if (this.editingProduct && this.currentProduct.id === updatedProduct.id) {
              this.currentProduct.imageUrl = updatedProduct.imageUrl;
            }
            
            console.log('[SAVE] Product updated in array', updatedProduct.imageUrl);
          }
          
          // Refresh all products after a short delay
          setTimeout(() => {
            this.loadProducts();
          }, 500);
        }
      });
  }
  
  // Quick edit for product images directly from the products table
  quickEditImage(product: AdminProduct): void {
    // Prompt for the new image URL, defaulting to current image if available
    const currentImage = product.imageUrl 
      ? product.imageUrl.includes('?t=') || product.imageUrl.includes('&t=') 
         ? product.imageUrl.split(/[?&]t=/)[0] 
         : product.imageUrl
      : '';
    const newImageUrl = prompt('Enter new image URL:', currentImage);
    
    if (!newImageUrl || newImageUrl.trim() === '') {
      return; // User cancelled or entered empty URL
    }
    
    // Show loading state
    this.isSavingProduct = true;
    
    console.log('[QUICK-EDIT] Updating image for product:', product.id);
    console.log('[QUICK-EDIT] New image URL:', newImageUrl);
    
    this.adminService.updateProductImageDirect(product.id, newImageUrl)
      .pipe(
        finalize(() => {
          this.isSavingProduct = false;
        }),
        catchError(error => {
          this.errorService.showError('Failed to update product image');
          console.error('[QUICK-EDIT] Error updating image:', error);
          return of(null);
        })
      )
      .subscribe(updatedProduct => {
        if (updatedProduct) {
          console.log('[QUICK-EDIT] Image updated successfully:', updatedProduct.imageUrl);
          
          // Update the product in the list
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products[index].imageUrl = updatedProduct.imageUrl;
          }
          
          this.errorService.showSuccess('Product image updated successfully');
          
          // Refresh the product list
          setTimeout(() => {
            this.loadProducts();
          }, 300);
        }
      });
  }

  // Seller management methods
  loadSellers(): void {
    this.isLoadingSellers = true;
    this.sellersError = null;

    const sellersSub = this.sellerService.getAllSellers().pipe(
      finalize(() => this.isLoadingSellers = false),
      catchError(error => {
        console.error('Admin dashboard: Error loading sellers:', error);
        this.sellersError = `Failed to load sellers: ${error.message || 'Unknown error'}`;
        this.errorService.showError('Failed to load sellers');
        return of([]);
      })
    ).subscribe(sellers => {
      console.log('Admin dashboard: Sellers loaded successfully', sellers);
      // Map SellerProfile to AdminSeller
      this.sellers = sellers.map(seller => ({
        id: seller.id,
        userId: seller.userId,
        email: '',
        firstName: '',
        lastName: '',
        storeName: seller.storeName,
        storeDescription: seller.storeDescription || '',
        status: seller.status,
        dateJoined: seller.dateJoined,
        lastActive: new Date(),
        totalProducts: seller.productCount,
        totalOrders: 0,
        totalRevenue: 0,
        productCount: seller.productCount,
        totalSales: seller.totalSales,
        rating: seller.rating,
        reviewCount: 0,
        commissionRate: 0
      }));
    });
    this.subscriptions.push(sellersSub);
  }

  // Helper method to select a seller
  onSellerSelect(sellerId: string): void {
    if (!sellerId) {
      this.currentProduct.sellerId = '';
      this.currentProduct.sellerName = '';
      return;
    }
    
    const selectedSeller = this.sellers.find(s => s.id === sellerId);
    if (selectedSeller) {
      this.currentProduct.sellerId = selectedSeller.id;
      this.currentProduct.sellerName = selectedSeller.storeName;
    }
  }
}
