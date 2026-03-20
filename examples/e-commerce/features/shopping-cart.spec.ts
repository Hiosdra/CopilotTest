/**
 * E-Commerce Shopping Cart Tests
 *
 * Tests for adding, removing, and managing items in the shopping cart.
 * Covers cart operations, quantity updates, and cart persistence.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { laptop, smartphone, tshirt } from '../fixtures/products.js';
import { registeredCustomer } from '../fixtures/users.js';

/**
 * Shopping Cart Feature
 *
 * Best Practices Demonstrated:
 * - Testing cart operations (add, remove, update)
 * - Quantity validation
 * - Cart calculations and totals
 * - Cart persistence across sessions
 * - Guest vs. authenticated cart handling
 */
const shoppingCartFeature = feature('E-Commerce Shopping Cart')
  .description('Shopping cart management and operations')
  .tag('@cart', '@e-commerce')

  .background()
  .given('the e-commerce website is available')
  .and('the shopping cart is empty initially')

  // Scenario 1: Add product to cart
  .scenario('Customer adds a product to cart')
  .tag('@smoke', '@add-to-cart')
  .given(`I am viewing the product "${laptop.name}"`)
  .and('the product is in stock')
  .when('I click the "Add to Cart" button')
  .then('I should see a confirmation message or notification')
  .and('the cart icon should show 1 item')
  .and('I should be able to continue shopping or go to cart')

  // Scenario 2: Add multiple products
  .scenario('Customer adds multiple different products to cart')
  .tag('@add-to-cart', '@multiple-items')
  .given('I have an empty cart')
  .when(`I add "${laptop.name}" to the cart`)
  .and(`I add "${smartphone.name}" to the cart`)
  .and(`I add "${tshirt.name}" to the cart`)
  .then('my cart should contain 3 items')
  .and('the cart icon should show 3 items')

  // Scenario 3: Update quantity in cart
  .scenario('Customer updates product quantity in cart')
  .tag('@quantity', '@update')
  .given(`I have "${laptop.name}" in my cart with quantity 1`)
  .when('I navigate to my shopping cart')
  .and('I change the quantity to 2')
  .and('I click update or the quantity is updated automatically')
  .then('the quantity should be updated to 2')
  .and('the item subtotal should be doubled')
  .and('the cart total should be recalculated')

  // Scenario 4: Remove item from cart
  .scenario('Customer removes a product from cart')
  .tag('@remove', '@cart-management')
  .given(`I have "${smartphone.name}" in my cart`)
  .when('I navigate to my shopping cart')
  .and(`I click the remove or delete button for "${smartphone.name}"`)
  .then(`"${smartphone.name}" should be removed from the cart`)
  .and('the cart item count should decrease by 1')
  .and('the cart total should be recalculated')

  // Scenario 5: Empty cart
  .scenario('Customer empties entire cart')
  .tag('@clear-cart')
  .given('I have multiple items in my cart')
  .when('I navigate to my shopping cart')
  .and('I click "Clear cart" or "Remove all items"')
  .then('all items should be removed from the cart')
  .and('I should see an "Empty cart" message')
  .and('the cart icon should show 0 items')

  // Scenario 6: Cart persistence for logged-in users
  .scenario('Logged-in customer cart persists across sessions')
  .tag('@persistence', '@session')
  .given(`I am logged in as "${registeredCustomer.username}"`)
  .and(`I have added "${laptop.name}" to my cart`)
  .when('I log out')
  .and('I close the browser')
  .and('I reopen the browser and log back in')
  .then('my cart should still contain the items I added previously')
  .and(`"${laptop.name}" should still be in my cart`)

  // Scenario 7: Cart total calculation
  .scenario('Cart correctly calculates totals')
  .tag('@calculations', '@totals')
  .given('I have an empty cart')
  .when(`I add "${laptop.name}" with price $${laptop.price}`)
  .and(`I add "${tshirt.name}" with price $${tshirt.price}`)
  .and('I navigate to the cart')
  .then(`the subtotal should be $${laptop.price + tshirt.price}`)
  .and('tax should be calculated and displayed')
  .and('shipping cost should be displayed if applicable')
  .and('the final total should include all charges')

  // Scenario 8: Quantity validation
  .scenario('Cart validates maximum quantity')
  .tag('@validation', '@quantity')
  .given(`I have "${smartphone.name}" in my cart`)
  .when('I navigate to the cart')
  .and('I try to update the quantity to 999')
  .then('I should see a validation message about maximum quantity')
  .and('the quantity should not exceed the available stock')
  .and('I should be notified of the maximum allowed quantity')

  // Scenario 9: Out of stock in cart
  .scenario('Product becomes out of stock while in cart')
  .tag('@inventory', '@stock-validation')
  .given('I have a product in my cart')
  .when('the product becomes out of stock')
  .and('I navigate to my cart')
  .then('I should see a notification that the product is no longer available')
  .and('I should be given options to remove it or save for later')
  .and('I should not be able to proceed to checkout with unavailable items')

  // Scenario 10: Apply coupon code
  .scenario('Customer applies a discount coupon')
  .tag('@coupon', '@discount')
  .given('I have items in my cart totaling $1000')
  .and('I have a valid coupon code "SAVE10" for 10% off')
  .when('I navigate to the cart')
  .and('I enter the coupon code "SAVE10"')
  .and('I click "Apply"')
  .then('I should see a success message')
  .and('the discount should be applied to the subtotal')
  .and('the total should reflect the discounted amount')
  .and('the coupon should be visible in the cart summary')

  // Scenario 11: Invalid coupon code
  .scenario('Customer enters invalid coupon code')
  .tag('@coupon', '@negative')
  .given('I have items in my cart')
  .when('I navigate to the cart')
  .and('I enter an invalid coupon code "INVALIDCODE"')
  .and('I click "Apply"')
  .then('I should see an error message about invalid coupon')
  .and('no discount should be applied')
  .and('the total should remain unchanged')

  // Scenario 12: Save for later
  .scenario('Customer saves item for later')
  .tag('@save-for-later')
  .given(`I am logged in and have "${laptop.name}" in my cart`)
  .when('I click "Save for later" for this item')
  .then('the item should be moved to a "Saved for later" section')
  .and('the item should be removed from the active cart')
  .and('the cart total should be updated')
  .and('I should be able to move it back to cart later')

  // Scenario 13: Guest checkout cart
  .scenario('Guest user adds items to cart without logging in')
  .tag('@guest', '@cart')
  .given('I am not logged in (guest user)')
  .when('I add products to the cart')
  .and('I navigate to the cart')
  .then('I should see my cart items')
  .and('I should have options to checkout as guest or login')
  .and('the cart should be stored in browser session')

  // Scenario 14: Cart item availability check
  .scenario('Cart checks item availability before checkout')
  .tag('@availability-check')
  .given('I have multiple items in my cart')
  .when('I click "Proceed to Checkout"')
  .then('the system should verify all items are still in stock')
  .and('if any item is unavailable, I should be notified')
  .and('I should be able to continue with available items only')

  .done()
  ._build();

// Register the test
test(shoppingCartFeature, 'web');

// Export for use in test suites
export { shoppingCartFeature };
