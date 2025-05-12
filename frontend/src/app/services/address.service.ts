import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ShippingAddress } from '../models/order.model';

export interface AddressResponse {
  id: number;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/addresses';
  private addressesSubject = new BehaviorSubject<AddressResponse[]>([]);
  addresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Get all addresses for the current user
  getAddresses(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>(this.apiUrl).pipe(
      tap(addresses => this.addressesSubject.next(addresses)),
      catchError(error => {
        console.error('Error fetching addresses:', error);
        return of([]);
      })
    );
  }

  // Get the default address for the current user
  getDefaultAddress(): Observable<AddressResponse | null> {
    return this.http.get<AddressResponse>(`${this.apiUrl}/default`).pipe(
      catchError(error => {
        console.error('Error fetching default address:', error);
        return of(null);
      })
    );
  }

  // Create a new address
  createAddress(address: CreateAddressRequest): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(this.apiUrl, address).pipe(
      tap(newAddress => {
        const currentAddresses = this.addressesSubject.value;
        this.addressesSubject.next([...currentAddresses, newAddress]);
      }),
      catchError(error => {
        console.error('Error creating address:', error);
        throw error;
      })
    );
  }

  // Update an existing address
  updateAddress(id: number, address: UpdateAddressRequest): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(`${this.apiUrl}/${id}`, address).pipe(
      tap(updatedAddress => {
        const currentAddresses = this.addressesSubject.value;
        const index = currentAddresses.findIndex(a => a.id === id);
        if (index !== -1) {
          currentAddresses[index] = updatedAddress;
          this.addressesSubject.next([...currentAddresses]);
        }
      }),
      catchError(error => {
        console.error(`Error updating address ${id}:`, error);
        throw error;
      })
    );
  }

  // Delete an address
  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentAddresses = this.addressesSubject.value;
        this.addressesSubject.next(currentAddresses.filter(a => a.id !== id));
      }),
      catchError(error => {
        console.error(`Error deleting address ${id}:`, error);
        throw error;
      })
    );
  }

  // Convert backend AddressResponse to the frontend ShippingAddress format
  toShippingAddress(address: AddressResponse, firstName: string, lastName: string, phone: string, email: string): ShippingAddress {
    return {
      firstName,
      lastName,
      address1: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.zipCode,
      country: address.country,
      phone,
      email,
      saveAddress: false // Default to false as the address is already saved
    };
  }

  // Convert ShippingAddress to CreateAddressRequest
  fromShippingAddress(address: ShippingAddress, isDefault: boolean = false): CreateAddressRequest {
    return {
      street: address.address1,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.postalCode,
      isDefault
    };
  }
}
