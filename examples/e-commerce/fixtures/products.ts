/**
 * E-Commerce Product Fixtures
 *
 * Sample products for testing catalog, cart, and checkout functionality.
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  inStock: boolean;
  quantity?: number;
  sku: string;
  description?: string;
}

/**
 * Electronics category products
 */
export const laptop: Product = {
  id: 'PROD-001',
  name: 'Professional Laptop 15"',
  category: 'Electronics',
  price: 1299.99,
  currency: 'USD',
  inStock: true,
  sku: 'LAPTOP-15-PRO',
  description: 'High-performance laptop for professionals',
};

export const smartphone: Product = {
  id: 'PROD-002',
  name: 'Smartphone X Pro',
  category: 'Electronics',
  price: 899.99,
  currency: 'USD',
  inStock: true,
  sku: 'PHONE-X-PRO',
  description: 'Latest smartphone with advanced features',
};

export const headphones: Product = {
  id: 'PROD-003',
  name: 'Wireless Headphones',
  category: 'Electronics',
  price: 199.99,
  currency: 'USD',
  inStock: true,
  sku: 'HEADPHONES-WL',
  description: 'Premium wireless headphones with noise cancellation',
};

/**
 * Clothing category products
 */
export const tshirt: Product = {
  id: 'PROD-004',
  name: 'Cotton T-Shirt',
  category: 'Clothing',
  price: 29.99,
  currency: 'USD',
  inStock: true,
  sku: 'TSHIRT-COTTON-M',
  description: 'Comfortable cotton t-shirt',
};

export const jeans: Product = {
  id: 'PROD-005',
  name: 'Denim Jeans',
  category: 'Clothing',
  price: 79.99,
  currency: 'USD',
  inStock: true,
  sku: 'JEANS-DENIM-32',
  description: 'Classic denim jeans',
};

/**
 * Out of stock product
 */
export const outOfStockProduct: Product = {
  id: 'PROD-006',
  name: 'Limited Edition Watch',
  category: 'Accessories',
  price: 499.99,
  currency: 'USD',
  inStock: false,
  sku: 'WATCH-LIMITED',
  description: 'Limited edition luxury watch (currently out of stock)',
};

/**
 * All available products
 */
export const allProducts = {
  laptop,
  smartphone,
  headphones,
  tshirt,
  jeans,
  outOfStockProduct,
};

/**
 * Helper to get products by category
 */
export const productsByCategory = {
  electronics: [laptop, smartphone, headphones],
  clothing: [tshirt, jeans],
  accessories: [outOfStockProduct],
};
