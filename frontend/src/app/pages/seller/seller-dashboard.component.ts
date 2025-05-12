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
  newOrderStatus: string = '';

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
  pageSizes: number[] = [5, 10, 25, 50];
  visibleOrderPages: number[] = [];
  visibleProductPages: number[] = [];

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
  }

  private closeAllModals(): void {
    this.showProductForm = false;
    this.selectedOrder = null;
    this.showStatusUpdate = false;
  }

  ngOnInit(): void {
    this.checkIfMobile();

    // Check if user is a seller
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.role === 'seller') {
      this.sellerId = currentUser.id;
      this.loadDashboardData();
      this.loadProducts();
      this.loadOrders();
    } else {
      this.router.navigate(['/login'], { queryParams: { redirect: '/seller/dashboard' } });
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    // Initialize after view is loaded
    setTimeout(() => {
      this.visibleOrderPages = this.calculateVisiblePages(this.orderPagination.currentPage,
        Math.ceil(this.orderPagination.totalItems / this.orderPagination.pageSize));
    }, 0);
  }

  private loadDashboardData(): void {
    this.loadSellerProfile();
    this.loadStats();

    this.todayOrders = 12;
    this.todayRevenue = 4500;
    this.orderChange = 15;
    this.revenueChange = 8;
    this.rating = 4.8;
    this.totalReviews = 128;
  }

  private loadSellerProfile(): void {
    // TODO: Implement seller profile loading
    this.storeName = "My Store"; // Placeholder
  }

  // Products management methods
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.productsError = null;

    const productsSub = this.sellerService.getSellerProducts(this.sellerId).pipe(
      finalize(() => this.isLoadingProducts = false),
      catchError(error => {
        this.productsError = 'Failed to load products';
        this.errorService.showError('Failed to load products');
        return of([]);
      })
    ).subscribe((products: any) => {
      this.products = products;
      this.filterProducts();

      this.lowStockItems = products
        .filter((p: AdminProduct) => p.stock && p.stock < 5)
        .sort((a: AdminProduct, b: AdminProduct) => (a.stock || 0) - (b.stock || 0))
        .slice(0, 5);

      this.activeProducts = products.filter((p: AdminProduct) => p.status === 'active').length;
      this.lowStockProducts = products.filter((p: AdminProduct) => p.stock < 10).length;
    });
    this.subscriptions.push(productsSub);
  }

  filterProducts(): void {
    this.filteredProducts = this.products;

    if (this.productSearchQuery) {
      const query = this.productSearchQuery.toLowerCase();
      this.filteredProducts = this.filteredProducts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (this.productStatusFilter !== 'all') {
      this.filteredProducts = this.filteredProducts.filter(p =>
        p.status === this.productStatusFilter
      );
    }

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
      sellerId: this.sellerId,
      sellerName: this.storeName,
      dateAdded: new Date(),
      lastUpdated: new Date(),
      description: '',
      imageUrl: '/assets/images/placeholder-product.svg'
    };
    this.showProductForm = true;
  }

  editProduct(product: AdminProduct): void {
    this.editingProduct = true;
    this.currentProduct = {...product};
    this.showProductForm = true;
  }

  closeProductForm(): void {
    this.showProductForm = false;
  }

  saveProduct(): void {
    if (!this.currentProduct.title) {
      this.errorService.showError('Product title is required');
      return;
    }

    this.isSavingProduct = true;
    const action = this.editingProduct ? 'update' : 'create';

    const saveObs = this.editingProduct
      ? this.sellerService.updateProduct(Number(this.currentProduct.id), {
          ...this.currentProduct,
          id: Number(this.currentProduct.id)
        } as unknown as Partial<Product>)
      : this.sellerService.createProduct(this.currentProduct);

    saveObs.pipe(
      finalize(() => this.isSavingProduct = false),
      catchError(error => {
        this.errorService.showError(`Failed to ${action} product`);
        return of(null);
      })
    ).subscribe((product: any) => {
      if (product) {
        if (this.editingProduct) {
          const index = this.products.findIndex(p => p.id === product.id);
          if (index !== -1) {
            this.products[index] = {...product};
          }
        } else {
          this.products.push({...product});
        }
        this.filterProducts();
        this.showProductForm = false;
        this.errorService.showSuccess(`Product ${action}d successfully`);

        // Reload products to ensure all data is up to date
        setTimeout(() => {
          this.loadProducts();
        }, 500);
      }
    });
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.sellerService.deleteProduct(Number(productId)).pipe(
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

    const ordersSub = this.sellerService.getSellerOrders(this.sellerId).pipe(
      finalize(() => this.isLoadingOrders = false),
      catchError(error => {
        this.ordersError = 'Failed to load orders';
        this.errorService.showError('Failed to load orders');
        return of([]);
      })
    ).subscribe((orders: any) => {
      this.orders = orders;
      this.filterByOrderStatus(this.selectedOrderStatus);

      // Get recent orders for dashboard
      this.recentOrders = [...orders]
        .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
        .slice(0, 5);
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

  openStatusUpdate(order: AdminOrder): void {
    this.selectedOrder = order;
    this.newOrderStatus = order.status;
    this.showStatusUpdate = true;
  }

  closeStatusUpdate(): void {
    this.showStatusUpdate = false;
  }

  selectStatus(status: string): void {
    this.selectedOrderStatus = status;
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder || this.newOrderStatus === 'all') return;

    const previousStatus = this.selectedOrder.status;

    this.sellerService.updateOrderStatus(
      this.selectedOrder.id,
      this.newOrderStatus as AdminOrder['status']
    ).pipe(
      catchError(error => {
        this.errorService.showError('Failed to update order status');
        return of(null);
      })
    ).subscribe((result: any) => {
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

  changeOrderPageSize(): void {
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

    // Update visible pages
    const totalPages = Math.ceil(this.orderPagination.totalItems / this.orderPagination.pageSize);
    this.visibleOrderPages = calculateVisiblePages(this.orderPagination.currentPage, totalPages);
  }

  // Helper method for templates to access Math
  get Math() {
    return Math;
  }

  // Navigation methods
  private navigateToNextSection(): void {
    if (this.currentSectionIndex < this.sections.length - 1) {
      this.currentSectionIndex++;
      this.scrollToSection(this.sections.get(this.currentSectionIndex)?.nativeElement.id);
    }
  }

  private navigateToPreviousSection(): void {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
      this.scrollToSection(this.sections.get(this.currentSectionIndex)?.nativeElement.id);
    }
  }

  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private loadStats(): void {
    this.isLoadingStats = true;
    this.statsError = null;

    // Placeholder method - in a real app this would call a service
    setTimeout(() => {
      this.isLoadingStats = false;
      // Populate with dummy data for now
    }, 500);
  }

  private calculateVisiblePages(currentPage: number, totalPages: number): number[] {
    return calculateVisiblePages(currentPage, totalPages);
  }

  // Add the missing methods
  quickEditImage(product: AdminProduct): void {
    this.currentProduct = { ...product };
    // Open a simplified form or modal for quick image edit
    this.showProductForm = true;
  }

  toggleFreeShipping(product: AdminProduct): void {
    // Toggle the free shipping status of the product
    product.freeShipping = !product.freeShipping;
    // Call API to update product
    this.saveProduct();
  }

  toggleFastDelivery(product: AdminProduct): void {
    // Toggle the fast delivery status of the product
    product.fastDelivery = !product.fastDelivery;
    // Call API to update product
    this.saveProduct();
  }

  changeProductPageSize(): void {
    // Reset to first page when changing page size
    this.productPagination.currentPage = 1;
    this.applyProductFilters();
  }

  filterOrders(): void {
    // Filter orders based on the selected status
    if (this.selectedOrderStatus === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.selectedOrderStatus);
    }

    // Reset pagination
    this.orderPagination.currentPage = 1;
    this.orderPagination.totalItems = this.filteredOrders.length;

    // Apply sorting and pagination
    this.applyOrderFilters();
  }
}
