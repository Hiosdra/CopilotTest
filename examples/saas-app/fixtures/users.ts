/**
 * SaaS Application User Fixtures
 */

export interface SaaSUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company: string;
  subscriptionTier: 'free' | 'starter' | 'professional' | 'enterprise';
}

export const freeUser: SaaSUser = {
  email: 'free.user@example.com',
  password: 'FreeUser@123',
  firstName: 'Free',
  lastName: 'User',
  company: 'Startup Inc',
  subscriptionTier: 'free',
};

export const professionalUser: SaaSUser = {
  email: 'pro.user@example.com',
  password: 'ProUser@456',
  firstName: 'Professional',
  lastName: 'User',
  company: 'Tech Corp',
  subscriptionTier: 'professional',
};

export const enterpriseUser: SaaSUser = {
  email: 'enterprise@example.com',
  password: 'EntUser@789',
  firstName: 'Enterprise',
  lastName: 'Admin',
  company: 'Enterprise LLC',
  subscriptionTier: 'enterprise',
};
