---
platform: web
tags: [cart, e-commerce]
---

# Feature: E-Commerce Shopping Cart

Shopping cart management and operations

## Background
- Given the e-commerce website is available
- And the shopping cart is empty initially

## Scenario: Customer adds a product to cart
@smoke @add-to-cart
- Given I am viewing the product "Professional Laptop 15""
- And the product is in stock
- When I click the "Add to Cart" button
- Then I should see a confirmation message or notification
- And the cart icon should show 1 item
- And I should be able to continue shopping or go to cart

## Scenario: Customer adds multiple different products to cart
@add-to-cart @multiple-items
- Given I have an empty cart
- When I add "Professional Laptop 15"" to the cart
- And I add "Smartphone X Pro" to the cart
- And I add "Cotton T-Shirt" to the cart
- Then my cart should contain 3 items
- And the cart icon should show 3 items

## Scenario: Customer updates product quantity in cart
@quantity @update
- Given I have "Professional Laptop 15"" in my cart with quantity 1
- When I navigate to my shopping cart
- And I change the quantity to 2
- And I click update or the quantity is updated automatically
- Then the quantity should be updated to 2
- And the item subtotal should be doubled
- And the cart total should be recalculated

## Scenario: Customer removes a product from cart
@remove @cart-management
- Given I have "Smartphone X Pro" in my cart
- When I navigate to my shopping cart
- And I click the remove or delete button for "Smartphone X Pro"
- Then "Smartphone X Pro" should be removed from the cart
- And the cart item count should decrease by 1
- And the cart total should be recalculated

## Scenario: Customer empties entire cart
@clear-cart
- Given I have multiple items in my cart
- When I navigate to my shopping cart
- And I click "Clear cart" or "Remove all items"
- Then all items should be removed from the cart
- And I should see an "Empty cart" message
- And the cart icon should show 0 items

## Scenario: Logged-in customer cart persists across sessions
@persistence @session
- Given I am logged in as "customer1"
- And I have added "Professional Laptop 15"" to my cart
- When I log out
- And I close the browser
- And I reopen the browser and log back in
- Then my cart should still contain the items I added previously
- And "Professional Laptop 15"" should still be in my cart

## Scenario: Cart correctly calculates totals
@calculations @totals
- Given I have an empty cart
- When I add "Professional Laptop 15"" with price $1299.99
- And I add "Cotton T-Shirt" with price $29.99
- And I navigate to the cart
- Then the subtotal should be $1329.98
- And tax should be calculated and displayed
- And shipping cost should be displayed if applicable
- And the final total should include all charges

## Scenario: Cart validates maximum quantity
@validation @quantity
- Given I have "Smartphone X Pro" in my cart
- When I navigate to the cart
- And I try to update the quantity to 999
- Then I should see a validation message about maximum quantity
- And the quantity should not exceed the available stock
- And I should be notified of the maximum allowed quantity

## Scenario: Product becomes out of stock while in cart
@inventory @stock-validation
- Given I have a product in my cart
- When the product becomes out of stock
- And I navigate to my cart
- Then I should see a notification that the product is no longer available
- And I should be given options to remove it or save for later
- And I should not be able to proceed to checkout with unavailable items

## Scenario: Customer applies a discount coupon
@coupon @discount
- Given I have items in my cart totaling $1000
- And I have a valid coupon code "SAVE10" for 10% off
- When I navigate to the cart
- And I enter the coupon code "SAVE10"
- And I click "Apply"
- Then I should see a success message
- And the discount should be applied to the subtotal
- And the total should reflect the discounted amount
- And the coupon should be visible in the cart summary

## Scenario: Customer enters invalid coupon code
@coupon @negative
- Given I have items in my cart
- When I navigate to the cart
- And I enter an invalid coupon code "INVALIDCODE"
- And I click "Apply"
- Then I should see an error message about invalid coupon
- And no discount should be applied
- And the total should remain unchanged

## Scenario: Customer saves item for later
@save-for-later
- Given I am logged in and have "Professional Laptop 15"" in my cart
- When I click "Save for later" for this item
- Then the item should be moved to a "Saved for later" section
- And the item should be removed from the active cart
- And the cart total should be updated
- And I should be able to move it back to cart later

## Scenario: Guest user adds items to cart without logging in
@guest @cart
- Given I am not logged in (guest user)
- When I add products to the cart
- And I navigate to the cart
- Then I should see my cart items
- And I should have options to checkout as guest or login
- And the cart should be stored in browser session

## Scenario: Cart checks item availability before checkout
@availability-check
- Given I have multiple items in my cart
- When I click "Proceed to Checkout"
- Then the system should verify all items are still in stock
- And if any item is unavailable, I should be notified
- And I should be able to continue with available items only
