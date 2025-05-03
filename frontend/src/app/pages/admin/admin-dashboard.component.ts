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
  private touchThreshold: number = 50;

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

  private navigateToNextSection(): void {
    if (this.currentSectionIndex < this.sections.length - 1) {
      this.currentSectionIndex++;
      this.scrollToCurrentSection();
    }
  }

  private navigateToPreviousSection(): void {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.scrollToCurrentSection();
    }
  }

  private scrollToCurrentSection(): void {
    this.scrolling = true;
    const section = this.sections.toArray()[this.currentSectionIndex];
    section.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.activeSection = section.nativeElement.id;
    
    // Update active section after scrolling finishes
    setTimeout(() => {
      this.scrolling = false;
      this.updateActiveSection();
    }, 1000);
  }

  private updateActiveSection(): void {
    if (this.scrolling) return;
    
    const sections = this.sections.toArray();
    const viewportHeight = window.innerHeight;
    const headerOffset = 100; // Adjust based on your header height
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].nativeElement;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top - headerOffset;
      const sectionBottom = rect.bottom - headerOffset;
      
      // Section is considered active if it takes up most of the viewport
      if (sectionTop <= viewportHeight / 3 && sectionBottom >= viewportHeight / 3) {
        this.activeSection = section.id;
        this.currentSectionIndex = i;
        break;
      }
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const currentY = event.touches[0].clientY;
    const deltaY = this.touchStartY - currentY;
    
    if (Math.abs(deltaY) > this.touchThreshold) {
      if (deltaY > 0) {
        // Swipe up - go to next section
        this.navigateToNextSection();
      } else {
        // Swipe down - go to previous section
        this.navigateToPreviousSection();
      }
      this.touchStartY = currentY;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.scrolling) {
      this.updateActiveSection();
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

  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      this.scrolling = true;
      section.scrollIntoView({ behavior: 'smooth' });
      this.activeSection = sectionId;
      
      // Update active section after scrolling finishes
      setTimeout(() => {
        this.scrolling = false;
        this.currentSectionIndex = ['overview', 'products', 'orders', 'users'].indexOf(sectionId);
      }, 1000);

      // Prevent default anchor behavior
      event?.preventDefault();
    }
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
