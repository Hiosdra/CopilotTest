---
platform: web
tags: [orders, e-commerce, account]
---

# Feature: E-Commerce Order History

Order history, tracking, and management features

## Background
- Given the e-commerce website is available
- And I am logged in as "customer1"

## Scenario: Customer views all past orders
@smoke @order-list
- Given I have placed orders in the past
- When I navigate to "My Orders" or "Order History"
- Then I should see a list of all my orders
- And each order should show order number, date, status, and total
- And orders should be sorted by date (most recent first)
- And I should see pagination if I have many orders

## Scenario: Customer views detailed information for a specific order
@smoke @order-details
- Given I am on my order history page
- When I click on order "ORD-2024-001"
- Then I should see the complete order details page
- And I should see all items in the order with quantities and prices
- And I should see the shipping address
- And I should see the payment method used
- And I should see the order date and delivery date
- And I should see the order status
- And I should see the total amount paid

## Scenario: Customer tracks order delivery status
@tracking @shipping
- Given I have a pending order "ORD-2024-002"
- When I view this order in my order history
- And I click "Track Order" or "View Tracking"
- Then I should see the current order status
- And I should see tracking information if available
- And I should see estimated delivery date
- And I should see order progress (e.g., Processing → Shipped → Out for Delivery → Delivered)

## Scenario: Customer filters orders by status
@filter @status
- Given I am on the order history page
- And I have orders with different statuses
- When I select "Delivered" from the status filter
- Then I should see only orders with "Delivered" status
- And orders with other statuses should not be visible
- And the filter should be clearly indicated

## Scenario: Customer filters orders by date range
@filter @date
- Given I am on the order history page
- When I select date range "Last 30 days"
- Then I should see only orders from the last 30 days
- And older orders should not be shown
- When I select "Last 6 months"
- Then I should see orders from the last 6 months

## Scenario: Customer searches for specific order
@search
- Given I am on the order history page
- When I enter order number "ORD-2024-001" in the search box
- And I submit the search
- Then I should see order "ORD-2024-001" in the results
- And other orders should not be visible

## Scenario: Customer reorders items from previous order
@reorder @convenience
- Given I am viewing order details for "ORD-2024-001"
- When I click the "Reorder" button
- Then all items from that order should be added to my cart
- And I should be redirected to my cart or see a confirmation
- And I should be able to modify quantities before checkout

## Scenario: Customer downloads order invoice
@invoice @documents
- Given I am viewing order "ORD-2024-001"
- When I click "Download Invoice" or "Print Invoice"
- Then an invoice PDF should be generated and downloaded
- And the invoice should contain all order details
- And the invoice should include billing information

## Scenario: Customer initiates return for delivered order
@returns @customer-service
- Given I have a delivered order within the return window
- When I view the order details
- And I click "Return Items"
- Then I should see a return request form
- When I select items to return
- And I provide reason for return
- And I submit the return request
- Then I should see a confirmation of my return request
- And I should see a return authorization number
- And I should receive return shipping instructions

## Scenario: Customer cancels order before shipment
@cancel @order-management
- Given I have a pending order "ORD-2024-002" that has not shipped
- When I view the order details
- And I click "Cancel Order"
- Then I should see a cancellation confirmation dialog
- When I confirm the cancellation
- Then the order status should change to "Cancelled"
- And I should receive a cancellation confirmation
- And any payment should be refunded

## Scenario: Customer views cancelled order
@cancelled @status
- Given I have a cancelled order in my history
- When I view this cancelled order
- Then I should see the order with "Cancelled" status
- And I should see the cancellation date
- And I should see the reason for cancellation if available
- And I should still see what items were in the order

## Scenario: Customer writes review for purchased product
@reviews @feedback
- Given I have a delivered order with products
- When I view the order details
- And I click "Write Review" for a product
- Then I should be taken to the review form
- When I rate the product and write a review
- And I submit the review
- Then I should see confirmation that my review was submitted
- And the product should show I have reviewed it

## Scenario: New customer with no orders views order history
@empty-state
- Given I am a new customer who has never placed an order
- When I navigate to my order history
- Then I should see a message indicating no orders yet
- And I should see a call-to-action to start shopping
- And I should not see any order list or filters

## Scenario: Customer contacts support about an order
@customer-service @support
- Given I am viewing an order with an issue
- When I click "Contact Support" or "Get Help"
- Then I should see customer service contact options
- And the order number should be pre-filled in support form
- And I should be able to describe my issue
- And I should be able to submit the support request

## Scenario: Customer accesses order from confirmation email
@email @access
- Given I received an order confirmation email
- When I click the "View Order" link in the email
- Then I should be taken directly to that order's detail page
- And I should be able to view all order information
- And I should not need to search for the order manually
