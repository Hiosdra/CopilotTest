/**
 * E-Commerce Product Catalog Tests
 *
 * Tests for browsing, searching, filtering, and viewing products.
 * Demonstrates testing product discovery and navigation flows.
 */

import { configure, feature, test } from '../../../src/index.js';
import { webPlatform } from '../../../src/platforms/web.js';
import { laptop, smartphone, outOfStockProduct, productsByCategory } from '../fixtures/products.js';

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
 * Product Catalog Feature
 *
 * Best Practices Demonstrated:
 * - Testing search and filter functionality
 * - Product detail page validation
 * - Handling out-of-stock products
 * - Category navigation
 * - Sort and filter combinations
 */
const productCatalogFeature = feature('E-Commerce Product Catalog')
  .description('Product browsing, search, and discovery features')
  .tag('@catalog', '@e-commerce')

  .background()
  .given('the e-commerce website is available')
  .and('the product catalog is loaded with test products')

  // Scenario 1: Browse all products
  .scenario('Customer views all available products')
  .tag('@smoke', '@browsing')
  .given('I am on the home page')
  .when('I navigate to the products page or "Shop All" section')
  .then('I should see a list of available products')
  .and('each product should display name, price, and image')
  .and('I should see pagination or load more options if there are many products')

  // Scenario 2: Search for specific product
  .scenario('Customer searches for products by name')
  .tag('@search')
  .given('I am on the products page')
  .when(`I enter "${laptop.name}" in the search box`)
  .and('I submit the search')
  .then(`I should see search results containing "${laptop.name}"`)
  .and('the results should be relevant to my search query')
  .and('I should see the number of results found')

  // Scenario 3: Filter by category
  .scenario('Customer filters products by category')
  .tag('@filter', '@category')
  .given('I am on the products page')
  .when('I select the "Electronics" category filter')
  .then('I should see only electronics products')
  .and('products from other categories should not be visible')
  .and('the page should indicate the active filter')

  // Scenario 4: Filter by price range
  .scenario('Customer filters products by price range')
  .tag('@filter', '@price')
  .given('I am on the products page')
  .when('I set the price range filter to $500 - $1500')
  .and('I apply the filter')
  .then('I should see only products within the $500-$1500 price range')
  .and('products outside this range should not be visible')

  // Scenario 5: Sort products
  .scenario('Customer sorts products by price')
  .tag('@sort')
  .given('I am viewing the product catalog')
  .when('I select "Price: Low to High" from the sort dropdown')
  .then('products should be ordered from lowest to highest price')
  .and('the cheapest product should appear first')

  // Scenario 6: View product details
  .scenario('Customer views detailed product information')
  .tag('@smoke', '@product-details')
  .given('I am on the products page')
  .when(`I click on the product "${laptop.name}"`)
  .then('I should be taken to the product detail page')
  .and(`I should see the product name "${laptop.name}"`)
  .and(`I should see the price "${laptop.price}"`)
  .and('I should see product images')
  .and('I should see a detailed product description')
  .and('I should see an "Add to Cart" button')
  .and('I should see availability status')

  // Scenario 7: Out of stock product
  .scenario('Customer views out-of-stock product')
  .tag('@inventory', '@out-of-stock')
  .given('I am on the product catalog')
  .when(`I navigate to product "${outOfStockProduct.name}"`)
  .then('I should see an "Out of Stock" indicator')
  .and('the "Add to Cart" button should be disabled or not visible')
  .and('I should see an option to notify me when back in stock')

  // Scenario 8: Product quick view
  .scenario('Customer uses quick view feature')
  .tag('@quick-view')
  .given('I am on the products page')
  .when(`I hover over or click quick view for "${smartphone.name}"`)
  .then('a modal or overlay should appear with product details')
  .and(`I should see product name, price, and image for "${smartphone.name}"`)
  .and('I should be able to add to cart from the quick view')
  .and('I should be able to close the quick view')

  // Scenario 9: Multiple filters
  .scenario('Customer applies multiple filters simultaneously')
  .tag('@filter', '@advanced')
  .given('I am on the products page')
  .when('I select the "Electronics" category')
  .and('I set price range to $100 - $1000')
  .and('I select "4+ stars" rating filter')
  .then('I should see only electronics products between $100-$1000 with 4+ star ratings')
  .and('all active filters should be clearly indicated')
  .and('I should be able to clear individual filters')

  // Scenario 10: Empty search results
  .scenario('Customer searches for non-existent product')
  .tag('@search', '@negative')
  .given('I am on the products page')
  .when('I search for "xyznonexistentproduct12345"')
  .then('I should see a "No results found" message')
  .and('I should see suggestions or alternatives')
  .and('I should be able to clear the search and try again')

  // Scenario 11: Product comparison
  .scenario('Customer compares multiple products')
  .tag('@comparison')
  .given('I am viewing the electronics category')
  .when(`I select "${laptop.name}" for comparison`)
  .and(`I select "${smartphone.name}" for comparison`)
  .and('I click the "Compare" button')
  .then('I should see a comparison view with both products')
  .and('I should see side-by-side specifications')
  .and('I should see price comparison')
  .and('I should be able to add either product to cart from comparison')

  // Scenario 12: Product reviews and ratings
  .scenario('Customer views product reviews')
  .tag('@reviews')
  .given(`I am on the product detail page for "${laptop.name}"`)
  .when('I scroll to the reviews section')
  .then('I should see customer reviews and ratings')
  .and('I should see the average rating')
  .and('I should be able to filter reviews by rating')
  .and('I should be able to read full review text')

  .done()
  ._build();

// Register the test
test(productCatalogFeature, 'web');

// Export for use in test suites
export { productCatalogFeature };
