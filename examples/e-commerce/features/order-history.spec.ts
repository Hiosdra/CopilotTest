/**
 * E-Commerce Order History Tests
 *
 * Tests for viewing past orders, order details, reordering, and order tracking.
 * Demonstrates testing of historical data and order management features.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { registeredCustomer, premiumCustomer } from '../fixtures/users.js';
import { completedOrder, pendingOrder } from '../fixtures/orders.js';

/**
 * Order History Feature
 *
 * Best Practices Demonstrated:
 * - Testing user account features
 * - Order status tracking
 * - Historical data display
 * - Filtering and sorting orders
 * - Reordering functionality
 * - Return and refund flows
 */
const orderHistoryFeature = feature('E-Commerce Order History')
  .description('Order history, tracking, and management features')
  .tag('@orders', '@e-commerce', '@account')

  .background()
  .given('the e-commerce website is available')
  .and(`I am logged in as "${registeredCustomer.username}"`)

  // Scenario 1: View order history
  .scenario('Customer views all past orders')
  .tag('@smoke', '@order-list')
  .given('I have placed orders in the past')
  .when('I navigate to "My Orders" or "Order History"')
  .then('I should see a list of all my orders')
  .and('each order should show order number, date, status, and total')
  .and('orders should be sorted by date (most recent first)')
  .and('I should see pagination if I have many orders')

  // Scenario 2: View specific order details
  .scenario('Customer views detailed information for a specific order')
  .tag('@smoke', '@order-details')
  .given('I am on my order history page')
  .when(`I click on order "${completedOrder.orderId}"`)
  .then('I should see the complete order details page')
  .and('I should see all items in the order with quantities and prices')
  .and('I should see the shipping address')
  .and('I should see the payment method used')
  .and('I should see the order date and delivery date')
  .and('I should see the order status')
  .and('I should see the total amount paid')

  // Scenario 3: Track order status
  .scenario('Customer tracks order delivery status')
  .tag('@tracking', '@shipping')
  .given(`I have a pending order "${pendingOrder.orderId}"`)
  .when('I view this order in my order history')
  .and('I click "Track Order" or "View Tracking"')
  .then('I should see the current order status')
  .and('I should see tracking information if available')
  .and('I should see estimated delivery date')
  .and('I should see order progress (e.g., Processing → Shipped → Out for Delivery → Delivered)')

  // Scenario 4: Filter orders by status
  .scenario('Customer filters orders by status')
  .tag('@filter', '@status')
  .given('I am on the order history page')
  .and('I have orders with different statuses')
  .when('I select "Delivered" from the status filter')
  .then('I should see only orders with "Delivered" status')
  .and('orders with other statuses should not be visible')
  .and('the filter should be clearly indicated')

  // Scenario 5: Filter orders by date range
  .scenario('Customer filters orders by date range')
  .tag('@filter', '@date')
  .given('I am on the order history page')
  .when('I select date range "Last 30 days"')
  .then('I should see only orders from the last 30 days')
  .and('older orders should not be shown')
  .when('I select "Last 6 months"')
  .then('I should see orders from the last 6 months')

  // Scenario 6: Search orders
  .scenario('Customer searches for specific order')
  .tag('@search')
  .given('I am on the order history page')
  .when(`I enter order number "${completedOrder.orderId}" in the search box`)
  .and('I submit the search')
  .then(`I should see order "${completedOrder.orderId}" in the results`)
  .and('other orders should not be visible')

  // Scenario 7: Reorder from past order
  .scenario('Customer reorders items from previous order')
  .tag('@reorder', '@convenience')
  .given(`I am viewing order details for "${completedOrder.orderId}"`)
  .when('I click the "Reorder" button')
  .then('all items from that order should be added to my cart')
  .and('I should be redirected to my cart or see a confirmation')
  .and('I should be able to modify quantities before checkout')

  // Scenario 8: Download invoice
  .scenario('Customer downloads order invoice')
  .tag('@invoice', '@documents')
  .given(`I am viewing order "${completedOrder.orderId}"`)
  .when('I click "Download Invoice" or "Print Invoice"')
  .then('an invoice PDF should be generated and downloaded')
  .and('the invoice should contain all order details')
  .and('the invoice should include billing information')

  // Scenario 9: Initiate return request
  .scenario('Customer initiates return for delivered order')
  .tag('@returns', '@customer-service')
  .given('I have a delivered order within the return window')
  .when('I view the order details')
  .and('I click "Return Items"')
  .then('I should see a return request form')
  .when('I select items to return')
  .and('I provide reason for return')
  .and('I submit the return request')
  .then('I should see a confirmation of my return request')
  .and('I should see a return authorization number')
  .and('I should receive return shipping instructions')

  // Scenario 10: Cancel pending order
  .scenario('Customer cancels order before shipment')
  .tag('@cancel', '@order-management')
  .given(`I have a pending order "${pendingOrder.orderId}" that has not shipped`)
  .when('I view the order details')
  .and('I click "Cancel Order"')
  .then('I should see a cancellation confirmation dialog')
  .when('I confirm the cancellation')
  .then('the order status should change to "Cancelled"')
  .and('I should receive a cancellation confirmation')
  .and('any payment should be refunded')

  // Scenario 11: View order without items (cancelled)
  .scenario('Customer views cancelled order')
  .tag('@cancelled', '@status')
  .given('I have a cancelled order in my history')
  .when('I view this cancelled order')
  .then('I should see the order with "Cancelled" status')
  .and('I should see the cancellation date')
  .and('I should see the reason for cancellation if available')
  .and('I should still see what items were in the order')

  // Scenario 12: Leave product review from order history
  .scenario('Customer writes review for purchased product')
  .tag('@reviews', '@feedback')
  .given('I have a delivered order with products')
  .when('I view the order details')
  .and('I click "Write Review" for a product')
  .then('I should be taken to the review form')
  .when('I rate the product and write a review')
  .and('I submit the review')
  .then('I should see confirmation that my review was submitted')
  .and('the product should show I have reviewed it')

  // Scenario 13: Empty order history
  .scenario('New customer with no orders views order history')
  .tag('@empty-state')
  .given('I am a new customer who has never placed an order')
  .when('I navigate to my order history')
  .then('I should see a message indicating no orders yet')
  .and('I should see a call-to-action to start shopping')
  .and('I should not see any order list or filters')

  // Scenario 14: Contact customer service about order
  .scenario('Customer contacts support about an order')
  .tag('@customer-service', '@support')
  .given('I am viewing an order with an issue')
  .when('I click "Contact Support" or "Get Help"')
  .then('I should see customer service contact options')
  .and('the order number should be pre-filled in support form')
  .and('I should be able to describe my issue')
  .and('I should be able to submit the support request')

  // Scenario 15: Order confirmation email link
  .scenario('Customer accesses order from confirmation email')
  .tag('@email', '@access')
  .given('I received an order confirmation email')
  .when('I click the "View Order" link in the email')
  .then('I should be taken directly to that order\'s detail page')
  .and('I should be able to view all order information')
  .and('I should not need to search for the order manually')

  .done()
  ._build();

// Register the test
test(orderHistoryFeature, 'web');

// Export for use in test suites
export { orderHistoryFeature };
