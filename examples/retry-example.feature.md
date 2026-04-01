---
platform: web
tags: [api, retry]
---

# Feature: Flaky API Test

Testing retry mechanisms with exponential backoff for flaky endpoints

## Scenario: API call with retries
@api
- Given the API server is running
- When I make a request to the flaky endpoint
- Then I should receive a successful response
