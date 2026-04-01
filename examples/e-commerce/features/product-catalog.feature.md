---
platform: web
tags: [catalog, e-commerce]
---

# Feature: E-Commerce Product Catalog

Product browsing, search, and discovery features

## Background
- Given the e-commerce website is available
- And the product catalog is loaded with test products

## Scenario: Customer views all available products
@smoke @browsing
- Given I am on the home page
- When I navigate to the products page or "Shop All" section
- Then I should see a list of available products
- And each product should display name, price, and image
- And I should see pagination or load more options if there are many products

## Scenario: Customer searches for products by name
@search
- Given I am on the products page
- When I enter "Professional Laptop 15"" in the search box
- And I submit the search
- Then I should see search results containing "Professional Laptop 15""
- And the results should be relevant to my search query
- And I should see the number of results found

## Scenario: Customer filters products by category
@filter @category
- Given I am on the products page
- When I select the "Electronics" category filter
- Then I should see only electronics products
- And products from other categories should not be visible
- And the page should indicate the active filter

## Scenario: Customer filters products by price range
@filter @price
- Given I am on the products page
- When I set the price range filter to $500 - $1500
- And I apply the filter
- Then I should see only products within the $500-$1500 price range
- And products outside this range should not be visible

## Scenario: Customer sorts products by price
@sort
- Given I am viewing the product catalog
- When I select "Price: Low to High" from the sort dropdown
- Then products should be ordered from lowest to highest price
- And the cheapest product should appear first

## Scenario: Customer views detailed product information
@smoke @product-details
- Given I am on the products page
- When I click on the product "Professional Laptop 15""
- Then I should be taken to the product detail page
- And I should see the product name "Professional Laptop 15""
- And I should see the price "1299.99"
- And I should see product images
- And I should see a detailed product description
- And I should see an "Add to Cart" button
- And I should see availability status

## Scenario: Customer views out-of-stock product
@inventory @out-of-stock
- Given I am on the product catalog
- When I navigate to product "Limited Edition Watch"
- Then I should see an "Out of Stock" indicator
- And the "Add to Cart" button should be disabled or not visible
- And I should see an option to notify me when back in stock

## Scenario: Customer uses quick view feature
@quick-view
- Given I am on the products page
- When I hover over or click quick view for "Smartphone X Pro"
- Then a modal or overlay should appear with product details
- And I should see product name, price, and image for "Smartphone X Pro"
- And I should be able to add to cart from the quick view
- And I should be able to close the quick view

## Scenario: Customer applies multiple filters simultaneously
@filter @advanced
- Given I am on the products page
- When I select the "Electronics" category
- And I set price range to $100 - $1000
- And I select "4+ stars" rating filter
- Then I should see only electronics products between $100-$1000 with 4+ star ratings
- And all active filters should be clearly indicated
- And I should be able to clear individual filters

## Scenario: Customer searches for non-existent product
@search @negative
- Given I am on the products page
- When I search for "xyznonexistentproduct12345"
- Then I should see a "No results found" message
- And I should see suggestions or alternatives
- And I should be able to clear the search and try again

## Scenario: Customer compares multiple products
@comparison
- Given I am viewing the electronics category
- When I select "Professional Laptop 15"" for comparison
- And I select "Smartphone X Pro" for comparison
- And I click the "Compare" button
- Then I should see a comparison view with both products
- And I should see side-by-side specifications
- And I should see price comparison
- And I should be able to add either product to cart from comparison

## Scenario: Customer views product reviews
@reviews
- Given I am on the product detail page for "Professional Laptop 15""
- When I scroll to the reviews section
- Then I should see customer reviews and ratings
- And I should see the average rating
- And I should be able to filter reviews by rating
- And I should be able to read full review text
