import { SharedModule } from './../../shared/shared.module';
// features/catalogue/catalogue.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogueRoutingModule } from './catalogue-routing.module';

import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { CompareDialogComponent } from './components/compare-dialog/compare-dialog.component';
import { ReviewListComponent } from './components/review-list/review-list.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductCardComponent,
    ProductDetailComponent,
    ProductFilterComponent,
    CompareDialogComponent,
    ReviewListComponent,
    ReviewFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CatalogueRoutingModule
  ]
})
export class CatalogueModule { }
