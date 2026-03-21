/**
 * E-Commerce Order Fixtures
 *
 * Sample order data for testing order history and checkout flows.
 */

import { Product } from './products.js';
import { User } from './users.js';

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  last4?: string;
}

export interface Order {
  orderId: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  orderDate: string;
}

/**
 * Sample shipping addresses
 */
export const usShippingAddress: ShippingAddress = {
  street: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  country: 'USA',
};

export const internationalShippingAddress: ShippingAddress = {
  street: '456 High Street',
  city: 'London',
  state: 'Greater London',
  zipCode: 'SW1A 1AA',
  country: 'United Kingdom',
};

/**
 * Sample payment methods
 */
export const creditCardPayment: PaymentInfo = {
  method: 'credit_card',
  last4: '4242',
};

export const paypalPayment: PaymentInfo = {
  method: 'paypal',
};

/**
 * Sample completed order
 */
export const completedOrder: Partial<Order> = {
  orderId: 'ORD-2024-001',
  status: 'delivered',
  subtotal: 1299.99,
  tax: 130.00,
  shipping: 15.00,
  total: 1444.99,
  shippingAddress: usShippingAddress,
  paymentInfo: creditCardPayment,
  orderDate: '2024-01-15T10:30:00Z',
};

/**
 * Sample pending order
 */
export const pendingOrder: Partial<Order> = {
  orderId: 'ORD-2024-002',
  status: 'pending',
  subtotal: 899.99,
  tax: 90.00,
  shipping: 10.00,
  total: 999.99,
  shippingAddress: usShippingAddress,
  paymentInfo: paypalPayment,
  orderDate: '2024-01-20T14:20:00Z',
};

/**
 * All available fixtures
 */
export const allFixtures = {
  addresses: {
    usShippingAddress,
    internationalShippingAddress,
  },
  payments: {
    creditCardPayment,
    paypalPayment,
  },
  orders: {
    completedOrder,
    pendingOrder,
  },
};
