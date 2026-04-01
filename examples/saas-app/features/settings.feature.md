---
platform: web
tags: [saas, settings]
---

# Feature: SaaS Application Settings

User settings, profile, team management, and integrations

## Background
- Given the SaaS application is available

## Scenario: User updates profile information
@smoke @profile
- Given I am logged in as "pro.user@example.com"
- When I navigate to profile settings
- And I update my first name to "NewFirstName"
- And I update my company name
- And I save changes
- Then I should see a success message
- And my profile should be updated
- And the new name should appear in the navigation

## Scenario: User changes password
@security @password
- Given I am logged in
- When I navigate to security settings
- And I click "Change Password"
- And I enter current password
- And I enter new password "NewSecure@456"
- And I confirm new password
- And I save changes
- Then my password should be updated
- And I should receive a password change confirmation email

## Scenario: User enables two-factor authentication
@security @2fa
- Given I am in security settings
- And 2FA is not enabled
- When I click "Enable Two-Factor Authentication"
- And I scan the QR code with authenticator app
- And I enter the verification code
- And I save backup codes
- Then 2FA should be enabled on my account
- And I should need 2FA for next login

## Scenario: Enterprise user invites team member
@team @collaboration
- Given I am logged in as enterprise user "enterprise@example.com"
- When I navigate to team settings
- And I click "Invite Team Member"
- And I enter email "newmember@example.com"
- And I select role "Member"
- And I send invitation
- Then an invitation email should be sent
- And the user should appear as pending in team list

## Scenario: User removes team member
@team @user-management
- Given I am an admin with team members
- When I navigate to team settings
- And I click "Remove" for a team member
- And I confirm the removal
- Then the member should be removed from the team
- And they should lose access to the account

## Scenario: User configures notification preferences
@notifications @preferences
- Given I am in settings
- When I navigate to notification preferences
- And I disable email notifications for "Weekly Reports"
- And I enable notifications for "Security Alerts"
- And I save preferences
- Then my notification settings should be updated
- And I should only receive configured notifications

## Scenario: User connects third-party integration
@integrations @api
- Given I am in integrations settings
- When I click "Connect" for Slack integration
- And I authorize the integration
- And I select which notifications to send to Slack
- And I save integration settings
- Then Slack should be connected
- And notifications should be sent to Slack

## Scenario: User generates API key
@api @developer
- Given I am in API settings
- When I click "Generate New API Key"
- And I enter a name for the key
- And I select permissions
- And I create the key
- Then I should see the new API key
- And I should be able to copy it
- And I should see a warning to save it securely

## Scenario: User deletes account
@account-deletion @danger
- Given I am in account settings
- When I click "Delete Account"
- Then I should see a confirmation dialog with warnings
- When I confirm I want to delete
- And I enter my password to confirm
- And I click final confirmation
- Then my account should be scheduled for deletion
- And I should receive a confirmation email
- And I should be logged out
