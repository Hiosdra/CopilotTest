/**
 * SaaS Subscription Plan Fixtures
 */

export interface SubscriptionPlan {
  name: string;
  tier: 'free' | 'starter' | 'professional' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    users?: number;
    storage?: string;
    apiCalls?: number;
  };
}

export const freePlan: SubscriptionPlan = {
  name: 'Free',
  tier: 'free',
  monthlyPrice: 0,
  yearlyPrice: 0,
  features: ['Basic features', '1 user', '100 MB storage'],
  limits: {
    users: 1,
    storage: '100MB',
    apiCalls: 1000,
  },
};

export const professionalPlan: SubscriptionPlan = {
  name: 'Professional',
  tier: 'professional',
  monthlyPrice: 49,
  yearlyPrice: 490,
  features: ['All basic features', 'Up to 10 users', '10 GB storage', 'Priority support'],
  limits: {
    users: 10,
    storage: '10GB',
    apiCalls: 100000,
  },
};

export const enterprisePlan: SubscriptionPlan = {
  name: 'Enterprise',
  tier: 'enterprise',
  monthlyPrice: 199,
  yearlyPrice: 1990,
  features: ['All features', 'Unlimited users', 'Unlimited storage', '24/7 support', 'Custom integrations'],
  limits: {
    users: -1, // unlimited
    storage: 'unlimited',
    apiCalls: -1,
  },
};
