export interface Address {
    id?: number;
    userId?: number;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
}

export interface AddressFormData extends Omit<Address, 'id' | 'userId'> {
    // Additional fields for the form that aren't in the backend model
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    saveAddress?: boolean;
}
