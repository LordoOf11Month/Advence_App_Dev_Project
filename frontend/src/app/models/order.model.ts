import { CartItem } from './product.model';
import { Address, AddressFormData } from './address.model';

export interface ShippingAddress extends AddressFormData {
  address: Address;
}

export interface PaymentMethod {
  type: 'credit_card' | 'stripe' | 'cash_on_delivery';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  saveCard?: boolean;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  stripePaymentIntentId?: string;
  clientSecret?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery: Date;
  trackingNumber?: string;
  actualDeliveryDate?: Date;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: Address;
  trackingNumber?: string;
  actualDeliveryDate?: Date;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

export interface CreateOrderRequest {
  items: {
    productId: number;
    quantity: number;
    priceAtPurchase: number;
    stripePaymentIntentId: string | null;
    stripeChargeId: string | null;
  }[];
  shippingAddress: {
    id?: number | null;
    name?: string;
    street?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phone?: string;
    isDefault?: boolean;
  };
}
