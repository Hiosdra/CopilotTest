---
platform: web
tags: [checkout, e-commerce, critical]
---

# Feature: E-Commerce Checkout Process

Complete checkout flow from cart to order confirmation

## Background
- Given the e-commerce website is available
- And I have "Professional Laptop 15"" in my cart with price $1299.99

## Scenario: Registered customer completes checkout successfully
@smoke @happy-path @registered
- Given I am logged in as "customer1"
- And I have items in my cart
- When I navigate to my cart
- And I click "Proceed to Checkout"
- Then I should be on the checkout page
- When I enter shipping address: 123 Main Street, New York, NY 10001
- And I select shipping method "Standard Shipping"
- And I continue to payment
- Then I should see the order summary
- When I enter payment details
- And I click "Place Order"
- Then I should see an order confirmation page
- And I should see my order number
- And I should see order summary with items and total
- And I should receive a confirmation email

## Scenario: Guest customer completes checkout
@guest @checkout
- Given I am not logged in
- And I have items in my cart
- When I proceed to checkout
- Then I should see options to checkout as guest or login
- When I select "Checkout as Guest"
- And I enter my email address
- And I enter shipping information
- And I enter payment information
- And I place the order
- Then I should see order confirmation
- And my order should be processed successfully

## Scenario: Customer uses different billing and shipping addresses
@shipping @addresses
- Given I am logged in as "customer1"
- And I am on the checkout page
- When I enter a shipping address
- And I select "Use different billing address"
- And I enter a different billing address
- And I complete payment information
- And I place the order
- Then both addresses should be saved with the order
- And the order should be confirmed

## Scenario: Customer selects express shipping
@shipping @shipping-methods
- Given I am on the checkout shipping page
- When I view available shipping methods
- Then I should see multiple options: Standard, Express, Overnight
- When I select "Express Shipping"
- Then the shipping cost should update accordingly
- And the delivery estimate should be shown
- And the total should include the express shipping fee

## Scenario: Customer applies discount code during checkout
@discount @coupon
- Given I am on the checkout page
- And I have a valid discount code "CHECKOUT10"
- When I enter the promo code "CHECKOUT10"
- And I click "Apply"
- Then the discount should be reflected in the order total
- And I should see the discount amount clearly displayed
- And I should be able to remove the discount if needed

## Scenario: Checkout prevents submission with missing fields
@validation @negative
- Given I am on the checkout page
- When I leave required shipping fields empty
- And I try to continue to payment
- Then I should see validation errors for required fields
- And I should not be able to proceed until fields are filled
- And the errors should be clearly highlighted

## Scenario: Checkout rejects invalid credit card
@payment @validation @negative
- Given I have completed shipping information
- And I am on the payment step
- When I enter an invalid credit card number "1111111111111111"
- And I try to place the order
- Then I should see an error message about invalid payment information
- And the order should not be placed
- And I should remain on the payment page

## Scenario: Customer uses saved address for checkout
@saved-info @convenience
- Given I am logged in as "customer1"
- And I have previously saved shipping addresses
- When I proceed to checkout
- Then I should see my saved addresses as options
- When I select a saved address
- Then the address fields should be auto-filled
- And I should be able to edit the address if needed
- And I can continue to payment quickly

## Scenario: Customer reviews order before placing
@review @order-summary
- Given I have completed all checkout steps
- When I am on the final review page
- Then I should see a complete order summary
- And I should see all items with quantities and prices
- And I should see shipping address
- And I should see shipping method and cost
- And I should see payment method (last 4 digits)
- And I should see the final total
- And I should have an option to edit each section

## Scenario: Product becomes unavailable during checkout
@inventory @error-handling
- Given I have items in my cart
- And I am proceeding through checkout
- When a product becomes out of stock before I complete checkout
- And I try to place the order
- Then I should be notified that an item is no longer available
- And I should be returned to my cart
- And the unavailable item should be highlighted
- And I should have options to remove it or continue with other items

## Scenario: Customer saves payment method during checkout
@payment @saved-info
- Given I am logged in as "customer1"
- And I am on the payment step
- When I enter credit card information
- And I check "Save this payment method for future purchases"
- And I complete the checkout
- Then my payment method should be saved securely
- And the order should be placed successfully
- And next time I checkout, this payment method should be available

## Scenario: Long checkout time triggers session warning
@session @timeout
- Given I have started the checkout process
- When I remain inactive for an extended period
- Then I should see a warning about session timeout
- And I should be given option to extend my session
- And my cart items should be preserved

## Scenario: Customer adds gift message and delivery instructions
@customization @gift
- Given I am on the checkout page
- When I check "This is a gift"
- And I enter a gift message
- And I add special delivery instructions in the notes field
- And I complete the checkout
- Then the gift message should be included with the order
- And the delivery instructions should be saved
- And these details should appear in order confirmation

## Scenario: Checkout calculates tax based on shipping address
@tax @calculations
- Given I am on the checkout page
- When I enter a shipping address in New York
- Then the appropriate NY sales tax should be calculated and displayed
- When I change the state to California
- Then the tax should recalculate for CA rates
- And the total should update accordingly

## Scenario: Order confirmation page shows complete details
@confirmation @smoke
- Given I have successfully placed an order
- When I view the order confirmation page
- Then I should see a unique order number
- And I should see order date and time
- And I should see estimated delivery date
- And I should see all ordered items
- And I should see shipping address
- And I should see payment method used
- And I should see order total breakdown
- And I should have options to print or download receipt
- And I should see a button to track my order
