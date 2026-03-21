/**
 * E-Commerce Test Users
 *
 * Fixtures for different user types in the e-commerce application.
 * These can be used across multiple test scenarios.
 */

export interface User {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'guest';
}

/**
 * Standard registered customer with order history
 */
export const registeredCustomer: User = {
  username: 'customer1',
  password: 'Customer@123',
  email: 'customer1@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer',
};

/**
 * Premium customer with loyalty benefits
 */
export const premiumCustomer: User = {
  username: 'premium_user',
  password: 'Premium@456',
  email: 'premium@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'customer',
};

/**
 * New customer without any order history
 */
export const newCustomer: User = {
  username: 'newuser',
  password: 'NewUser@789',
  email: 'newuser@example.com',
  firstName: 'Mike',
  lastName: 'Johnson',
  role: 'customer',
};

/**
 * Admin user with full access
 */
export const adminUser: User = {
  username: 'admin',
  password: 'Admin@999',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
};

/**
 * Guest user (not logged in)
 */
export const guestUser: User = {
  username: 'guest',
  password: '',
  email: '',
  firstName: 'Guest',
  lastName: 'User',
  role: 'guest',
};

/**
 * All available test users
 */
export const allUsers = {
  registeredCustomer,
  premiumCustomer,
  newCustomer,
  adminUser,
  guestUser,
};
