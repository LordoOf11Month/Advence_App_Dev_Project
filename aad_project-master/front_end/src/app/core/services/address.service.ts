import { ApiResponse } from './auth.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AddressDTO {
  id: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  primary: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/profile/addresses`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<ApiResponse<AddressDTO[]>> {
    return this.http.get<ApiResponse<AddressDTO[]>>(this.apiUrl);
  }

  createAddress(address: Omit<AddressDTO, 'id' | 'userId'>): Observable<ApiResponse<AddressDTO>> {
    return this.http.post<ApiResponse<AddressDTO>>(this.apiUrl, address);
  }

  updateAddress(id: number, address: Partial<AddressDTO>): Observable<ApiResponse<AddressDTO>> {
    return this.http.put<ApiResponse<AddressDTO>>(`${this.apiUrl}/${id}`, address);
  }

  deleteAddress(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  setPrimaryAddress(id: number): Observable<ApiResponse<AddressDTO>> {
    return this.http.put<ApiResponse<AddressDTO>>(`${this.apiUrl}/${id}/primary`, {});
  }
}
