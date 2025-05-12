import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalOrderListComponent } from './global-order-list.component';

describe('GlobalOrderListComponent', () => {
  let component: GlobalOrderListComponent;
  let fixture: ComponentFixture<GlobalOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalOrderListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
