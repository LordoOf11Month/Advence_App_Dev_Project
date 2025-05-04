import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminStats, OrderStats, AdminProduct, AdminOrder, AdminUser } from '../../models/admin.model';
import { ErrorService } from '../../services/error.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { fadeInOut, listAnimation, slideUpDown, modalAnimation, sectionAnimation, tableRowAnimation } from '../../animations';
import { SortConfig, sortData, toggleSort } from '../../utils/table-sort';
import { FilterConfig, filterData, createFilter } from '../../utils/table-filter';
import { PaginationConfig, paginateData, PaginationResult, getPageSizes, calculateVisiblePages } from '../../utils/table-pagination';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  animations: [fadeInOut, listAnimation, slideUpDown, modalAnimation, sectionAnimation, tableRowAnimation],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
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
    lastUpdated: new Date()
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

  constructor(
    private adminService: AdminService,
    private errorService: ErrorService
  ) {
    // Track active section based on scroll position
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadProducts();
    this.loadOrders();
    this.loadUsers();
    this.checkIfMobile();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
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

  // Overview methods
  private loadStats(): void {
    this.isLoadingStats = true;
    this.statsError = null;

    this.adminService.getAdminStats().pipe(
      finalize(() => this.isLoadingStats = false),
      catchError(error => {
        this.statsError = 'Failed to load dashboard statistics';
        this.errorService.showError('Failed to load dashboard statistics');
        return of(null);
      })
    ).subscribe(stats => {
      this.stats = stats;
    });

    this.adminService.getOrderStats().pipe(
      catchError(error => {
        this.statsError = 'Failed to load order statistics';
        this.errorService.showError('Failed to load order statistics');
        return of(null);
      })
    ).subscribe(stats => {
      this.orderStats = stats;
    });
  }

  // Product management methods
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    this.adminService.getProducts().pipe(
      finalize(() => this.isLoadingProducts = false),
      catchError(error => {
        this.productsError = 'Failed to load products';
        this.errorService.showError('Failed to load products');
        return of([]);
      })
    ).subscribe(products => {
      this.products = products;
      this.filterProducts();
    });
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
      lastUpdated: new Date()
    };
    this.showProductForm = true;
  }

  editProduct(product: AdminProduct): void {
    this.editingProduct = true;
    this.currentProduct = { ...product };
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
  }

  saveProduct(): void {
    if (this.isSavingProduct) return;
    
    this.isSavingProduct = true;
    const action = this.editingProduct ? 'update' : 'create';

    const request$ = this.editingProduct 
      ? this.adminService.updateProduct(this.currentProduct)
      : this.adminService.updateProduct({
          ...this.currentProduct,
          id: Math.random().toString(36).substr(2, 9)
        });

    request$.pipe(
      finalize(() => this.isSavingProduct = false),
      catchError(error => {
        this.errorService.showError(`Failed to ${action} product`);
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        if (this.editingProduct) {
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products[index] = product;
          }
        } else {
          this.products.push(product);
        }
        this.filterProducts();
        this.showProductForm = false;
        this.errorService.showSuccess(`Product ${action}d successfully`);
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

  // Order management methods
  loadOrders(): void {
    this.isLoadingOrders = true;
    this.ordersError = null;

    this.adminService.getOrders().pipe(
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

    this.adminService.getUsers().pipe(
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
  }

  banUser(userId: string): void {
    this.adminService.banUser(userId).pipe(
      catchError(error => {
        this.errorService.showError('Failed to ban user');
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        this.loadUsers();
        this.errorService.showSuccess('User banned successfully');
      }
    });
  }

  unbanUser(userId: string): void {
    this.adminService.unbanUser(userId).pipe(
      catchError(error => {
        this.errorService.showError('Failed to unban user');
        return of(null);
      })
    ).subscribe(result => {
      if (result !== null) {
        this.loadUsers();
        this.errorService.showSuccess('User unbanned successfully');
      }
    });
  }

  viewUserTransactions(userId: string): void {
    this.isLoadingTransactions = true;
    this.transactionsError = null;
    
    this.adminService.getUserTransactions(userId).pipe(
      finalize(() => this.isLoadingTransactions = false),
      catchError(error => {
        this.transactionsError = 'Failed to load user transactions';
        this.errorService.showError('Failed to load user transactions');
        return of([]);
      })
    ).subscribe(transactions => {
      this.userTransactions = transactions;
      this.showTransactions = true;
    });
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
}
