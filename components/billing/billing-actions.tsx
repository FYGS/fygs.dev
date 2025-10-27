// TODO: tous les commentaires devront être correctement
// implementés plus tard de manière robuste et entièrement aligné avec stripe
// Pour l'heure juste garder 'Gérer l\'abonnement' qui dirige vers stripe qui gère cela bien
"use client";
import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
// import { SubscriptionStatus } from '@prisma/client';

interface BillingActionsProps {
  currentPriceId?: string | null; // raw Stripe price id (server provided)
  availablePrices: { id: string; label: string; amount?: number }[]; // semantic ids: 'monthly' | 'yearly'
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentCycle?: 'monthly' | 'yearly' | 'unknown';
}

export function BillingActions({ currentPriceId, currentCycle, /* availablePrices, subscriptionStatus, cancelAtPeriodEnd */ }: BillingActionsProps) {
  const [priceId, setPriceId] = useState<string | undefined>(undefined);
  const [/*pending*/, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Map the raw current price id to semantic cycle for initial select
  useEffect(() => {
    if (!priceId && currentCycle && (currentCycle === 'monthly' || currentCycle === 'yearly')) {
      setPriceId(currentCycle);
    }
    // Log current price information for debugging
    if (currentPriceId) {
      console.log('Current Stripe price ID:', currentPriceId);
    }
  }, [currentCycle, priceId, currentPriceId]);

  const callManage = async (payload: any) => {
    try {
      setLoadingAction(payload.action);

      // Handle portal navigation separately
      if (payload.action === 'manage_subscription') {
        const response = await fetch('/api/stripe/portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create portal session');
        }

        const data = await response.json();
        window.location.href = data.url;
        return;
      }

      // Import server actions dynamically to avoid SSR issues
      let action;
      switch (payload.action) {
        case 'switch_plan':
          action = (await import('@/app/(main)/dashboard/actions/switchSubscriptionPlan')).switchSubscriptionPlan;
          break;
        case 'cancel_at_period_end':
          action = (await import('@/app/(main)/dashboard/actions/cancelSubscription')).cancelSubscription;
          payload = { ...payload, immediate: false };
          break;
        case 'cancel_immediately':
          action = (await import('@/app/(main)/dashboard/actions/cancelSubscription')).cancelSubscription;
          payload = { ...payload, immediate: true };
          break;
        default:
          throw new Error('Unknown action');
      }

      const result = await action(payload);
      if (!result.success) throw new Error(result.error || result.message || 'Action failed');

      toast.success('Action appliquée');
      startTransition(() => {
        window.location.reload();
      });
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Changer de cycle</p>
          <Select value={priceId} onValueChange={(v) => setPriceId(v)}>
            <SelectTrigger className="w-56 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {availablePrices.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-gray-900 dark:text-gray-100">
                  {p.label}{p.amount ? ` - ${p.amount}€` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          disabled={!priceId || pending || loadingAction==='switch_plan'} 
          onClick={() => callManage({ action: 'switch_plan', newPriceId: priceId })}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loadingAction==='switch_plan' ? 'Changement...' : 'Appliquer'}
        </Button>
      </div> */}

      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          disabled={loadingAction==='manage_subscription'}
          onClick={() => callManage({ action: 'manage_subscription' })}
          className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-950"
        >
          {loadingAction==='manage_subscription' ? 'Redirection...' : 'Gérer l\'abonnement'}
        </Button>
        {/* {!cancelAtPeriodEnd && subscriptionStatus === SubscriptionStatus.ACTIVE && (
          <Button 
            variant="outline" 
            disabled={loadingAction==='cancel_at_period_end'} 
            onClick={() => callManage({ action: 'cancel_at_period_end' })}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950"
          >
            {loadingAction==='cancel_at_period_end' ? 'Annulation...' : 'Annuler en fin de période'}
          </Button>
        )}
        {subscriptionStatus !== SubscriptionStatus.CANCELED && (
          <Button 
            variant="destructive" 
            disabled={loadingAction==='cancel_immediately'} 
            onClick={() => {
              if (confirm('Confirmer la résiliation immédiate ? Cette action ne peut pas être annulée.')) 
                callManage({ action: 'cancel_immediately' });
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loadingAction==='cancel_immediately' ? 'Résiliation...' : 'Résiliation immédiate'}
          </Button>
        )} */}
      </div>
    </div>
  );
}
