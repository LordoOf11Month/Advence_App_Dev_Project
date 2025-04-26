import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
            <a href="#">Sell on Trendyol</a>
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
      
      <nav class="categories-nav" [class.show]="showMobileMenu">
        <div class="container">
          <ul class="categories-list">
            <li *ngFor="let category of categories" 
                class="category-item"
                (mouseenter)="hoveredCategory = category"
                (mouseleave)="hoveredCategory = null">
              <a [routerLink]="['/category', category.slug]">{{category.name}}</a>
              
              <div class="subcategories-dropdown" *ngIf="hoveredCategory === category && category.subcategories?.length">
                <div class="subcategories-container">
                  <ul class="subcategories-list">
                    <li *ngFor="let subcategory of category.subcategories">
                      <a [routerLink]="['/category', subcategory.slug]">{{subcategory.name}}</a>
                    </li>
                  </ul>
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
      color: var(--primary);
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
  `]
})
export class HeaderComponent {
  searchQuery: string = '';
  showSearchSuggestions: boolean = false;
  categories: Category[] = [];
  hoveredCategory: Category | null = null;
  showMobileMenu: boolean = false;
  isScrolled: boolean = false;
  cartCount: number = 0;
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) { }
  
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