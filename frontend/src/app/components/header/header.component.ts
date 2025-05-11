import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header [class.scrolled]="isScrolled">
      <div class="top-bar">
        <div class="container flex-between">
          <div class="top-links hidden-sm">
            <a routerLink="/seller/register">Sell on Trendway</a>
          </div>
          <div class="top-links">
            <a routerLink="/admin" *ngIf="isAdmin">
              <span class="material-symbols-outlined">admin_panel_settings</span>
              <span class="hidden-sm">Admin</span>
            </a>
            <a routerLink="/seller" *ngIf="isSeller">
              <span class="material-symbols-outlined">store</span>
              <span class="hidden-sm">Seller Dashboard</span>
            </a>
            <a routerLink="/account">
              <span class="material-symbols-outlined">person</span>
              <span class="hidden-sm">Account</span>
            </a>
            <a routerLink="/cart" class="cart-link">
              <span class="material-symbols-outlined">shopping_cart</span>
              <span class="hidden-sm">Cart</span>
              <span class="cart-count" *ngIf="cartCount > 0">{{cartCount}}</span>
            </a>
          </div>
        </div>
      </div>
      
      <div class="main-header container">
        <div class="logo">
          <a routerLink="/">
            <h1>Trendway</h1>
          </a>
        </div>

        <div class="all-categories-btn">
          <button class="categories-toggle" (click)="toggleAllCategories($event)">
            <span class="material-symbols-outlined">menu</span>
            <span class="all-categories-link">Tüm Kategoriler</span>
          </button>
          
          <div class="mega-menu all-categories-menu">
            <div class="mega-menu-content">
              <div class="submenu-columns">
                <!-- One column per top-level category -->
                <div class="submenu-column" *ngFor="let category of categories">
                  <h3 class="submenu-title">
                    <a [routerLink]="['/category', getCategorySlug(category)]">{{category.name}}</a>
                  </h3>
                  <ul class="submenu-list" *ngIf="hasSubcategories(category)">
                    <li *ngFor="let subcategory of category.subcategories">
                      <a [routerLink]="['/category', getCategorySlug(subcategory)]">
                        {{subcategory.name}}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="search-bar">
          <input 
            type="text" 
            placeholder="Search products, brands, and categories" 
            [(ngModel)]="searchQuery"
            (focus)="showSearchSuggestions = true"
            (blur)="onSearchBlur()"
          />
          <button class="search-button">
            <span class="material-symbols-outlined">search</span>
          </button>
          
          <div class="search-suggestions" *ngIf="showSearchSuggestions">
            <div class="suggestion-group">
              <h4>Popular Searches</h4>
              <ul>
                <li><a routerLink="/category/summer-dresses">summer dresses</a></li>
                <li><a routerLink="/category/smartphones">smartphones</a></li>
                <li><a routerLink="/category/running-shoes">running shoes</a></li>
                <li><a routerLink="/category/wireless-headphones">wireless headphones</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="mobile-icons hidden-md hidden-lg">
          <button class="menu-toggle" (click)="toggleMobileMenu()">
            <span class="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
      
      <nav class="categories-nav" [class.show]="showMobileMenu" *ngIf="!isSellerRoute && !isAdminRoute">
        <div class="container container-nav">
          <!-- Main horizontal category navigation -->
          <ul class="categories-list">
            <!-- Only show top-level parent categories in the main navigation bar -->
            <li *ngFor="let category of categories" class="category-item">
              <a [routerLink]="['/category', getCategorySlug(category)]" class="category-link">
                {{category.name}}
                <span class="chevron-down" *ngIf="hasSubcategories(category)">▼</span>
              </a>
              
              <!-- Dropdown mega menu for subcategories only -->
              <div class="mega-menu" *ngIf="hasSubcategories(category)">
                <div class="mega-menu-content">
                  <div class="submenu-columns">
                    <div class="submenu-column">
                      <h3 class="submenu-title">
                        <a [routerLink]="['/category', getCategorySlug(category)]">{{category.name}}</a>
                      </h3>
                      <ul class="submenu-list">
                        <li *ngFor="let subcategory of category.subcategories">
                          <a [routerLink]="['/category', getCategorySlug(subcategory)]">
                            {{subcategory.name}}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div class="header-spacer"></div>
  `,
  styles: [`
    /* Global reset for navigation containers to ensure dropdowns can extend beyond limits */
    body {
      overflow-x: hidden;
    }
    
    .main-header, header, nav, .categories-nav, .container, ul, li {
      overflow: visible;
    }
    
    /* Enhanced hover effect for the submenu items */
    .submenu-list li a:hover {
      background-color: rgba(0, 123, 255, 0.08);
      color: var(--primary);
    }
    
    /* Force the dropdown menus to be rendered at the highest level possible */
    .mega-menu, .all-categories-menu, .nested-submenu {
      position: absolute;
      z-index: 9999;
      /* Use transform to create a new stacking context */
      transform: translateZ(0);
      /* Ensure the menu isn't clipped by any parent containers */
      clip-path: none;
      /* Force the browser to create a new rendering layer */
      will-change: transform;
    }

    :host {
      display: block;
    }
    
    header {
      background-color: var(--white);
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
      overflow: visible;
    }
    
    header.scrolled {
      box-shadow: var(--shadow-md);
    }
    
    .header-spacer {
      height: 120px; /* Reduced from 140px */
    }
    
    .top-bar {
      background-color: var(--neutral-800);
      color: var(--white);
      padding: var(--space-2) 0;
    }
    
    .top-bar a {
      color: var(--white);
      font-size: 0.875rem;
      margin-left: var(--space-4);
      display: inline-flex;
      align-items: center;
    }
    
    .top-bar a:hover {
      color: var(--primary-light);
    }
    
    .top-bar .material-symbols-outlined {
      font-size: 1.25rem;
      margin-right: var(--space-1);
    }
    
    .top-links {
      display: flex;
      align-items: center;
    }
    
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      width: 100%;
    }
    
    .container-nav {
      overflow: visible !important;
      position: static !important;
    }
    
    .flex-between {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .main-header {
      display: flex;
      align-items: center;
      padding: var(--space-2) 0; /* Reduced from space-3 */
    }
    
    .logo {
      margin-right: var(--space-4);
    }
    
    .logo h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0;
    }
    
    .search-bar {
      flex: 1;
      position: relative;
      max-width: 600px;
      margin: 0 var(--space-4);
    }
    
    .search-bar input {
      width: 100%;
      padding: var(--space-3);
      padding-right: var(--space-6);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      font-size: 1rem;
    }
    
    .search-bar input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(255, 96, 0, 0.1);
    }
    
    .search-button {
      position: absolute;
      right: var(--space-2);
      top: 50%;
      transform: translateY(-50%);
      background-color: transparent;
      color: var(--neutral-600);
      padding: var(--space-1);
      border-radius: 50%;
    }
    
    .search-button:hover {
      color: var(--primary);
      background-color: rgba(255, 96, 0, 0.1);
    }
    
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background-color: var(--white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      padding: var(--space-3);
      margin-top: var(--space-1);
      z-index: 100;
    }
    
    .suggestion-group h4 {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin-bottom: var(--space-2);
    }
    
    .suggestion-group ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .suggestion-group li {
      margin-bottom: var(--space-2);
    }
    
    .suggestion-group a {
      color: var(--neutral-800);
      font-size: 0.9375rem;
      transition: color var(--transition-fast);
    }
    
    .suggestion-group a:hover {
      color: var (--primary);
    }
    
    .cart-link {
      position: relative;
    }
    
    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: var(--primary);
      color: var(--white);
      font-size: 0.75rem;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .categories-nav {
      background-color: var(--white);
      position: relative;
      z-index: 50;
      border: 1px solid var(--neutral-200);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .sidebar-menu {
      position: relative;
      display: inline-block;
      background-color: var(--white);
      min-width: 240px;
    }
    
    .categories-list {
      list-style: none;
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: white;
    }
    
    .category-item {
      position: relative;
      height: 100%; /* Consistent with later definitions */
      /* text-decoration and font-size are better on the <a> tag or covered by later styles */
    }

    .category-item:hover > .mega-menu {
      display: block;
    }

    /* Styles for the chevron, derived from previously misplaced styles */
    .category-item .category-link .chevron-down {
        font-size: 10px;
        color: var(--neutral-400);
        margin-left: 4px; /* Added for better appearance */
        transition: transform 0.2s ease-in-out;
    }

    .category-item:hover .category-link .chevron-down {
        transform: rotate(180deg); /* Optional: rotate chevron on hover */
    }
    
    .mega-menu {
      display: none;
      position: absolute;
      left: 0;
      top: 100%;
      width: 360px; /* Further increased from 320px */
      background-color: var(--white);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      border: 1px solid var(--neutral-200);
      border-radius: 0 0 4px 4px;
      transform: translateZ(0);
    }
    
    .mega-menu-content {
      padding: 25px;
    }
    
    .submenu-columns {
      display: flex;
      flex-wrap: wrap;
    }
    
    .submenu-column {
      flex: 1 0 100%;
    }
    
    .submenu-title {
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-dark);
      border-bottom: 1px solid var(--neutral-200);
      padding-bottom: 8px;
    }
      

    
    .submenu-title a {
      color: var(--color-text-dark);
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .submenu-title a:hover {
      color: var(--primary);
    }
    
    .submenu-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 10px;
      
      li {
        margin: 0;
        
        a {
          display: block;
          padding: 8px 0;
          color: var(--color-text);
          text-decoration: none;
          font-size: 14px;
        }
        a:hover {
          color: var(--color-primary);
        }
      }
    }
    
    .categories-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: nowrap;
      overflow: visible !important; /* Changed from overflow-x: auto to allow dropdowns to extend beyond */
      max-width: 100%;
      white-space: nowrap;
      height: 100%; /* Take full height of parent */
      align-items: center;
      position: relative !important;
      z-index: 1000 !important;
    }
    
    .categories-list::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
    
    .category-item {
      position: relative;
      height: 100%; /* Take full height of parent */
      display: inline-flex; /* Changed to inline-flex */
      align-items: center;
    }
    
    .category-item > a {
      display: block;
      padding: 0 var(--space-2); /* Reduced horizontal padding even more */
      color: var(--neutral-800);
      font-weight: 500;
      font-size: 0.85rem; /* Reduced from 0.9rem */
      transition: color var(--transition-fast);
    }
    
    .category-item > a:hover {
      color: var(--primary);
    }
    
    .mega-menu-content {
      max-width: 900px; /* reduced from 1200px */
      margin: 0 auto;
    }

    .submenu-columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* reduced from 200px */
      gap: var(--space-3); /* reduced from space-6 */
    }

    .submenu-column {
      min-width: 180px; /* reduced from 200px */
    }

    .submenu-title {
      font-size: 0.9rem; /* reduced from 1rem */
      font-weight: 600;
      margin-bottom: var(--space-2); /* reduced from space-3 */
      color: var(--neutral-900);
    }

    .submenu-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .submenu-list li {
      margin-bottom: var(--space-1); /* reduced from space-2 */
    }

    .submenu-list li a {
      color: var(--neutral-700);
      font-size: 15px;
      text-decoration: none;
      display: block;
      padding: 8px 12px;
      transition: all var(--transition-fast);
      border-radius: 4px;
      margin-left: -12px;
      margin-right: -12px;
    }

    .submenu-list a:hover {
      color: var(--primary);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 992px) {
      .mega-menu {
        display: none;
      }
    }
    
    .subcategories-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      background-color: var(--white);
      box-shadow: var(--shadow-md);
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      min-width: 200px;
      z-index: 100;
      animation: fadeIn 0.2s ease-in-out;
    }
    
    .subcategories-container {
      padding: var(--space-3);
    }
    
    .subcategories-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .subcategories-list li {
      margin-bottom: var(--space-2);
    }
    
    .subcategories-list a {
      color: var(--neutral-700);
      font-size: 0.9375rem;
      transition: color var(--transition-fast);
    }
    
    .subcategories-list a:hover {
      color: var(--primary);
    }
    
    .mobile-icons {
      display: none;
    }
    
    .menu-toggle {
      background: transparent;
      color: var(--neutral-800);
      font-size: 1.5rem;
      padding: var(--space-2);
    }
    
    @media (max-width: 992px) {
      .search-bar {
        max-width: 400px;
      }
    }
    
    @media (max-width: 768px) {
      .header-spacer {
        height: 100px;
      }
      
      .categories-nav {
        display: none;
      }
      
      .categories-nav.show {
        display: block;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        z-index: 1000;
      }
      
      .categories-list {
        flex-direction: column;
      }
      
      .mobile-icons {
        display: flex;
        align-items: center;
      }
      
      .search-bar {
        margin: 0 var(--space-2);
      }
      
      .hidden-sm {
        display: none;
      }
    }
    
    @media (max-width: 576px) {
      .logo h1 {
        font-size: 1.5rem;
      }
      
      .search-bar input {
        padding: var(--space-2);
      }
    }

    .all-categories-btn {
      position: relative;
      margin-right: var(--space-4);
    }

    .all-categories-btn:hover .all-categories-menu {
      display: block !important;
    }
    
    .all-categories-menu {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 99999;
      background-color: var(--white);
      border: 1px solid var(--neutral-200);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 0 0 4px 4px;
      min-width: 800px;
      max-width: 90vw;
      display: none; /* Initially hidden */
    }
    
    /* Mega menu styles */
    .mega-menu-content {
      display: flex;
      padding: 15px 20px;
    }
    
    .submenu-columns {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      width: 100%;
    }
    
    .submenu-column {
      flex: 0 0 calc(20% - 20px);
      min-width: 200px;
      margin-bottom: 15px;
    }
    
    .submenu-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-dark);
      border-bottom: 1px solid var(--neutral-200);
      padding-bottom: 8px;
      

    
    .submenu-list {
      list-style: none;
      margin: 0;
      padding: 0;
      
      li {
        position: relative;
        margin-bottom: 6px;
      }
      li:hover > .nested-submenu {
        display: block;
      }
      li a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--color-text);
        text-decoration: none;
        font-size: 14px;
        padding: 4px 0;
      }
      li a .material-symbols-outlined {
        font-size: 16px;
        color: var(--neutral-400);
      }
      li a:hover {
        color: var(--color-primary);
      }
    }
    
    .nested-submenu {
      display: none;
      position: absolute;
      left: 100%;
      top: -10px;
      width: 240px;
      background-color: var(--white);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border: 1px solid var(--neutral-200);
      border-radius: 4px;
      padding: 10px 0;
      z-index: 2200;
    }
    
    .nested-submenu-list {
      list-style: none;
      margin: 0;
      padding: 0 15px;
    }
    
    .categories-toggle {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      
      .material-symbols-outlined {
        font-size: 1.25rem;
      }
      
      .all-categories-link {
        color: inherit;
        text-decoration: none;
      }
    }

    .categories-toggle:hover {
      background-color: var(--primary-dark);
    }

    /* ... */
    .categories-toggle .material-symbols-outlined {
      font-size: 1.25rem;
    }

    .all-categories-menu {
      width: 900px;
      left: 0;
      padding: var(--space-3);
    }

    .all-categories-menu .submenu-columns {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);
    }

    .submenu-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .submenu-list li {
      position: relative;
      margin-bottom: var(--space-1);
    }

    .submenu-list a {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--neutral-600);
      font-size: 0.875rem;
      text-decoration: none;
      transition: color var(--transition-fast);
      padding: var(--space-1) 0;
    }

    .submenu-list a:hover {
      color: var(--primary);
    }

    .nested-submenu {
      display: none;
      position: absolute;
      left: 100%;
      top: 0;
      min-width: 200px;
      background: var(--white);
      box-shadow: var(--shadow-md);
      border-radius: var(--radius-md);
      padding: var(--space-2);
      z-index: 101;
    }

    .submenu-list li:hover .nested-submenu {
      display: block;
    }

    .nested-submenu-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nested-submenu-list a {
      padding: var(--space-2) var(--space-3);
      display: block;
    }

    .material-symbols-outlined {
      font-size: 1rem;
    }

    @media (max-width: 992px) {
      .all-categories-btn {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  searchQuery: string = '';
  showSearchSuggestions: boolean = false;
  categories: Category[] = [];
  showMobileMenu: boolean = false;
  isScrolled: boolean = false;
  cartCount: number = 0;
  showAllCategories: boolean = false;
  isSellerRoute: boolean = false;
  isAdminRoute: boolean = false;
  isAdmin: boolean = false;
  isSeller: boolean = false;
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    // Check if current route is a seller or admin route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isSellerRoute = event.url.startsWith('/seller');
        this.isAdminRoute = event.url.startsWith('/admin');
      }
    });
  }
  
  ngOnInit(): void {
    // Load all categories but filter to only show top-level parent categories in the main navigation
    this.productService.getCategories().subscribe((categories: Category[]) => {
      // We need to identify which categories are top-level (parent categories)
      // We do this by examining the structure to find categories that aren't subcategories of any other category
      const subcategoryIds = new Set();
      
      // First, collect all IDs of subcategories
      categories.forEach(category => {
        if (category.subcategories && category.subcategories.length > 0) {
          category.subcategories.forEach(sub => subcategoryIds.add(sub.id));
        }
      });
      
      // Then filter to only include categories whose IDs are not in the subcategory set
      this.categories = categories.filter(category => !subcategoryIds.has(category.id));
      console.log('Loaded parent categories for navigation:', this.categories);
    });
    
    this.cartService.cart$.subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });

    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.isSeller = user?.role === 'seller';
    });
  }
  

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }
  
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
  
  toggleAllCategories(event: Event): void {
    event.preventDefault();
    // When clicked, navigate to all categories page
    this.router.navigate(['/category', 'all']);
  }
  
  onSearchBlur(): void {
    // Delay hiding the suggestions to allow for clicking on them
    setTimeout(() => {
      this.showSearchSuggestions = false;
    }, 200);
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Helper method to get category slug
  getCategorySlug(category: any): string {
    if (category.slug) {
      return category.slug;
    }
    if (category.name) {
      return category.name.toLowerCase().replace(/ /g, '-');
    }
    return 'all';
  }
  
  // Helper method to safely check if a category has subcategories
  hasSubcategories(category: any): boolean {
    return category && category.subcategories && category.subcategories.length > 0;
  }
}
