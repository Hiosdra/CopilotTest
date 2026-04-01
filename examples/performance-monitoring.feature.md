---
platform: web
tags: [performance]
---

# Feature: User Login Performance

Monitor login flow performance

## Scenario: Successful login with performance tracking
@performance
- Given I am on the login page
- When I enter username 'admin' and password 'password123'
- And I click the login button
- Then I should see the dashboard within 3 seconds
- And the page should be fully loaded
