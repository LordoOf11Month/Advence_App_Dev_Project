import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { sellerAdminGuard } from './seller-admin.guard';

describe('sellerAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => sellerAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
