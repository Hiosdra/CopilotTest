/**
 * E-Commerce Checkout Tests
 *
 * Complete checkout flow including shipping, payment, and order confirmation.
 * Demonstrates complex multi-step form flows and payment processing.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { laptop, smartphone } from '../fixtures/products.js';
import { registeredCustomer } from '../fixtures/users.js';
import { usShippingAddress, creditCardPayment } from '../fixtures/orders.js';

configure({
  model: 'gpt-4o',
  platforms: {
    web: webPlatform({
      browser: 'chromium',
      headless: true,
    }),
  },
  baseUrl: 'https://demo.example-shop.com',
  stepTimeout: 30000,
  screenshotOnFailure: true,
  outputDir: 'copilot-test-results/e-commerce',
});

/**
 * Checkout Feature
 *
 * Best Practices Demonstrated:
 * - Multi-step form testing
 * - Payment processing validation
 * - Shipping calculation
 * - Order confirmation
 * - Error handling in checkout flow
 * - Guest vs authenticated checkout
 */
const checkoutFeature = feature('E-Commerce Checkout Process')
  .description('Complete checkout flow from cart to order confirmation')
  .tag('@checkout', '@e-commerce', '@critical')

  .background()
  .given('the e-commerce website is available')
  .and(`I have "${laptop.name}" in my cart with price $${laptop.price}`)

  // Scenario 1: Complete checkout as registered user
  .scenario('Registered customer completes checkout successfully')
  .tag('@smoke', '@happy-path', '@registered')
  .given(`I am logged in as "${registeredCustomer.username}"`)
  .and('I have items in my cart')
  .when('I navigate to my cart')
  .and('I click "Proceed to Checkout"')
  .then('I should be on the checkout page')
  .when(`I enter shipping address: ${usShippingAddress.street}, ${usShippingAddress.city}, ${usShippingAddress.state} ${usShippingAddress.zipCode}`)
  .and('I select shipping method "Standard Shipping"')
  .and('I continue to payment')
  .then('I should see the order summary')
  .when('I enter payment details')
  .and('I click "Place Order"')
  .then('I should see an order confirmation page')
  .and('I should see my order number')
  .and('I should see order summary with items and total')
  .and('I should receive a confirmation email')

  // Scenario 2: Guest checkout
  .scenario('Guest customer completes checkout')
  .tag('@guest', '@checkout')
  .given('I am not logged in')
  .and('I have items in my cart')
  .when('I proceed to checkout')
  .then('I should see options to checkout as guest or login')
  .when('I select "Checkout as Guest"')
  .and('I enter my email address')
  .and('I enter shipping information')
  .and('I enter payment information')
  .and('I place the order')
  .then('I should see order confirmation')
  .and('my order should be processed successfully')

  // Scenario 3: Multiple shipping addresses
  .scenario('Customer uses different billing and shipping addresses')
  .tag('@shipping', '@addresses')
  .given(`I am logged in as "${registeredCustomer.username}"`)
  .and('I am on the checkout page')
  .when('I enter a shipping address')
  .and('I select "Use different billing address"')
  .and('I enter a different billing address')
  .and('I complete payment information')
  .and('I place the order')
  .then('both addresses should be saved with the order')
  .and('the order should be confirmed')

  // Scenario 4: Shipping method selection
  .scenario('Customer selects express shipping')
  .tag('@shipping', '@shipping-methods')
  .given('I am on the checkout shipping page')
  .when('I view available shipping methods')
  .then('I should see multiple options: Standard, Express, Overnight')
  .when('I select "Express Shipping"')
  .then('the shipping cost should update accordingly')
  .and('the delivery estimate should be shown')
  .and('the total should include the express shipping fee')

  // Scenario 5: Apply discount at checkout
  .scenario('Customer applies discount code during checkout')
  .tag('@discount', '@coupon')
  .given('I am on the checkout page')
  .and('I have a valid discount code "CHECKOUT10"')
  .when('I enter the promo code "CHECKOUT10"')
  .and('I click "Apply"')
  .then('the discount should be reflected in the order total')
  .and('I should see the discount amount clearly displayed')
  .and('I should be able to remove the discount if needed')

  // Scenario 6: Checkout validation - missing required fields
  .scenario('Checkout prevents submission with missing fields')
  .tag('@validation', '@negative')
  .given('I am on the checkout page')
  .when('I leave required shipping fields empty')
  .and('I try to continue to payment')
  .then('I should see validation errors for required fields')
  .and('I should not be able to proceed until fields are filled')
  .and('the errors should be clearly highlighted')

  // Scenario 7: Invalid payment information
  .scenario('Checkout rejects invalid credit card')
  .tag('@payment', '@validation', '@negative')
  .given('I have completed shipping information')
  .and('I am on the payment step')
  .when('I enter an invalid credit card number "1111111111111111"')
  .and('I try to place the order')
  .then('I should see an error message about invalid payment information')
  .and('the order should not be placed')
  .and('I should remain on the payment page')

  // Scenario 8: Checkout with saved address
  .scenario('Customer uses saved address for checkout')
  .tag('@saved-info', '@convenience')
  .given(`I am logged in as "${registeredCustomer.username}"`)
  .and('I have previously saved shipping addresses')
  .when('I proceed to checkout')
  .then('I should see my saved addresses as options')
  .when('I select a saved address')
  .then('the address fields should be auto-filled')
  .and('I should be able to edit the address if needed')
  .and('I can continue to payment quickly')

  // Scenario 9: Order review before final submission
  .scenario('Customer reviews order before placing')
  .tag('@review', '@order-summary')
  .given('I have completed all checkout steps')
  .when('I am on the final review page')
  .then('I should see a complete order summary')
  .and('I should see all items with quantities and prices')
  .and('I should see shipping address')
  .and('I should see shipping method and cost')
  .and('I should see payment method (last 4 digits)')
  .and('I should see the final total')
  .and('I should have an option to edit each section')

  // Scenario 10: Out of stock during checkout
  .scenario('Product becomes unavailable during checkout')
  .tag('@inventory', '@error-handling')
  .given('I have items in my cart')
  .and('I am proceeding through checkout')
  .when('a product becomes out of stock before I complete checkout')
  .and('I try to place the order')
  .then('I should be notified that an item is no longer available')
  .and('I should be returned to my cart')
  .and('the unavailable item should be highlighted')
  .and('I should have options to remove it or continue with other items')

  // Scenario 11: Save payment method for future use
  .scenario('Customer saves payment method during checkout')
  .tag('@payment', '@saved-info')
  .given(`I am logged in as "${registeredCustomer.username}"`)
  .and('I am on the payment step')
  .when('I enter credit card information')
  .and('I check "Save this payment method for future purchases"')
  .and('I complete the checkout')
  .then('my payment method should be saved securely')
  .and('the order should be placed successfully')
  .and('next time I checkout, this payment method should be available')

  // Scenario 12: Checkout timeout/session expiry
  .scenario('Long checkout time triggers session warning')
  .tag('@session', '@timeout')
  .given('I have started the checkout process')
  .when('I remain inactive for an extended period')
  .then('I should see a warning about session timeout')
  .and('I should be given option to extend my session')
  .and('my cart items should be preserved')

  // Scenario 13: Gift message and special instructions
  .scenario('Customer adds gift message and delivery instructions')
  .tag('@customization', '@gift')
  .given('I am on the checkout page')
  .when('I check "This is a gift"')
  .and('I enter a gift message')
  .and('I add special delivery instructions in the notes field')
  .and('I complete the checkout')
  .then('the gift message should be included with the order')
  .and('the delivery instructions should be saved')
  .and('these details should appear in order confirmation')

  // Scenario 14: Tax calculation based on location
  .scenario('Checkout calculates tax based on shipping address')
  .tag('@tax', '@calculations')
  .given('I am on the checkout page')
  .when('I enter a shipping address in New York')
  .then('the appropriate NY sales tax should be calculated and displayed')
  .when('I change the state to California')
  .then('the tax should recalculate for CA rates')
  .and('the total should update accordingly')

  // Scenario 15: Order confirmation details
  .scenario('Order confirmation page shows complete details')
  .tag('@confirmation', '@smoke')
  .given('I have successfully placed an order')
  .when('I view the order confirmation page')
  .then('I should see a unique order number')
  .and('I should see order date and time')
  .and('I should see estimated delivery date')
  .and('I should see all ordered items')
  .and('I should see shipping address')
  .and('I should see payment method used')
  .and('I should see order total breakdown')
  .and('I should have options to print or download receipt')
  .and('I should see a button to track my order')

  .done()
  ._build();

// Register the test
test(checkoutFeature, 'web');

// Export for use in test suites
export { checkoutFeature };
