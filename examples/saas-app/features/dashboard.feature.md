---
platform: web
tags: [saas, dashboard]
---

# Feature: SaaS Application Dashboard

Main dashboard functionality, widgets, and data visualization

## Background
- Given the SaaS application is available
- And I am logged in as "pro.user@example.com"

## Scenario: User views main dashboard
@smoke
- When I navigate to the dashboard
- Then I should see key metrics and statistics
- And I should see data visualizations and charts
- And I should see recent activity feed
- And I should see quick action buttons

## Scenario: User customizes dashboard widgets
@customization @widgets
- Given I am on the dashboard
- When I click "Customize Dashboard"
- And I drag and drop widgets to reorder them
- And I remove a widget I don't need
- And I add a new widget from available options
- And I save my layout
- Then my dashboard should reflect the new layout
- And the layout should persist on next login

## Scenario: User filters dashboard data by date range
@filters @date-range
- Given I am viewing the dashboard
- When I select date range "Last 7 days"
- Then all dashboard metrics should update for that period
- And charts should show data for last 7 days
- When I change to "Last 30 days"
- Then data should update accordingly

## Scenario: User exports dashboard data
@export @reporting
- Given I am viewing dashboard with data
- When I click "Export" button
- And I select "Export as CSV"
- Then a CSV file should be downloaded
- And the file should contain the dashboard data

## Scenario: User views real-time updates
@real-time @websocket
- Given I am on the dashboard with real-time features enabled
- When new data becomes available
- Then the dashboard should update automatically
- And I should see a notification of new data
- And metrics should refresh without page reload

## Scenario: Dashboard shows usage limits
@usage @limits
- Given I am on a Professional plan with usage limits
- When I view the dashboard
- Then I should see my current usage statistics
- And I should see progress bars for limits
- And I should see warnings if approaching limits
