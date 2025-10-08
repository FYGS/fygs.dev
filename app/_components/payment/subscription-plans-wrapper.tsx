import { SubscriptionPlans } from './subscription-plans';
import { getSubscriptionPrices, classifyBillingCycle } from '../../../lib/subscription-pricing';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';

interface WrapperProps { 
  currentPlan?: 'free' | 'premium' 
}

export async function SubscriptionPlansWrapper({ currentPlan = 'free' }: WrapperProps) {
  const { monthly, yearly } = getSubscriptionPrices();
  let defaultCycle: 'monthly' | 'yearly' = 'monthly';
  let previousCycleDerived = false;
  let currentCycle: 'monthly' | 'yearly' | 'unknown' = 'unknown';
  
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) {
      const sub = await db.subscription.findUnique({ 
        where: { userId: session.user.id }, 
        select: { priceId: true } 
      });
      if (sub?.priceId) {
        const c = classifyBillingCycle(sub.priceId);
        currentCycle = c;
        if (c === 'yearly') { 
          defaultCycle = 'yearly'; 
          previousCycleDerived = true; 
        }
      }
    }
  } catch (error) {
    // Silently handle errors - user will see default state
    console.error('Error fetching subscription details:', error);
  }
  
  return (
    <SubscriptionPlans 
      currentPlan={currentPlan} 
      hasMonthly={!!monthly} 
      hasYearly={!!yearly} 
      defaultCycle={defaultCycle} 
      currentCycle={currentCycle} 
      previousCycleDerived={previousCycleDerived} 
    />
  );
}
