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
            <a href="#">Download App</a>
            <a routerLink="/seller/register">Sell on Trendyol</a>
            <a href="#">Help & Support</a>
          </div>
          <div class="top-links">
            <a href="#">
              <span class="material-symbols-outlined">notifications</span>
              <span class="hidden-sm">Notifications</span>
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
            <h1>Trendyol</h1>
          </a>
        </div>

        <div class="all-categories-btn" 
             (mouseenter)="showAllCategories = true"
             (mouseleave)="showAllCategories = false">
          <button class="categories-toggle">
            <span class="material-symbols-outlined">menu</span>
            Tüm Kategoriler
          </button>
          
          <div class="mega-menu all-categories-menu" *ngIf="showAllCategories">
            <div class="mega-menu-content">
              <div class="submenu-columns">
                <div class="submenu-column" *ngFor="let category of categories">
                  <h3 class="submenu-title">
                    <a [routerLink]="['/category', category.slug]">{{category.name}}</a>
                  </h3>
                  <ul class="submenu-list" *ngIf="category.subcategories?.length">
                    <li *ngFor="let subcategory of category.subcategories">
                      <a [routerLink]="['/category', subcategory.slug]">
                        {{subcategory.name}}
                        <span class="material-symbols-outlined" *ngIf="subcategory.subcategories?.length">chevron_right</span>
                      </a>
                      <div class="nested-submenu" *ngIf="subcategory.subcategories?.length">
                        <ul class="nested-submenu-list">
                          <li *ngFor="let child of subcategory.subcategories">
                            <a [routerLink]="['/category', child.slug]">{{child.name}}</a>
                          </li>
                        </ul>
                      </div>
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
                <li><a href="#">summer dresses</a></li>
                <li><a href="#">smartphones</a></li>
                <li><a href="#">running shoes</a></li>
                <li><a href="#">wireless headphones</a></li>
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
        <div class="container">
          <ul class="categories-list">
            <li *ngFor="let category of categories" class="category-item">
              <a [routerLink]="['/category', category.slug]">{{category.name}}</a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div class="header-spacer"></div>
  `,
  styles: [`
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
    }
    
    header.scrolled {
      box-shadow: var(--shadow-md);
    }
    
    .header-spacer {
      height: 140px;
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
    
    .main-header {
      display: flex;
      align-items: center;
      padding: var(--space-3) 0;
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
      border-top: 1px solid var(--neutral-200);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .categories-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
    }
    
    .category-item {
      position: relative;
    }
    
    .category-item > a {
      display: block;
      padding: var(--space-3) var(--space-4);
      color: var(--neutral-800);
      font-weight: 500;
      transition: color var(--transition-fast);
    }
    
    .category-item > a:hover {
      color: var(--primary);
    }
    
    .mega-menu {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: var(--white);
      box-shadow: var(--shadow-md);
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      padding: var(--space-3); /* reduced from space-6 */
      z-index: 100;
      animation: fadeIn 0.2s ease-in-out;
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

    .submenu-list a {
      color: var(--neutral-600);
      font-size: 0.875rem; /* reduced from 0.9375rem */
      text-decoration: none;
      transition: color var(--transition-fast);
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

    .categories-toggle {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--primary);
      color: var(--white);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: 500;
      transition: background-color var(--transition-fast);
    }

    .categories-toggle:hover {
      background-color: var(--primary-dark);
    }

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
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    
    this.cartService.cart$.subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });
  }
  
  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }
  
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
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
}
