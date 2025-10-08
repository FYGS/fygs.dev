"use client";
import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface BillingActionsProps {
  currentPriceId?: string | null; // raw Stripe price id (server provided)
  availablePrices: { id: string; label: string }[]; // semantic ids: 'monthly' | 'yearly'
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentCycle?: 'monthly' | 'yearly' | 'unknown';
}

export function BillingActions({ currentPriceId, currentCycle, availablePrices, subscriptionStatus, cancelAtPeriodEnd }: BillingActionsProps) {
  const [priceId, setPriceId] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();
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
      const res = await fetch('/api/stripe/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
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
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium">Changer de cycle</p>
          <Select value={priceId} onValueChange={(v) => setPriceId(v)}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              {availablePrices.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button disabled={!priceId || pending || loadingAction==='switch_plan'} onClick={() => callManage({ action: 'switch_plan', newPriceId: priceId })}>
          {loadingAction==='switch_plan' ? 'Changement...' : 'Appliquer'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {!cancelAtPeriodEnd && subscriptionStatus === 'ACTIVE' && (
          <Button variant="outline" disabled={loadingAction==='cancel_at_period_end'} onClick={() => callManage({ action: 'cancel_at_period_end' })}>
            {loadingAction==='cancel_at_period_end' ? 'Annulation...' : 'Annuler en fin de période'}
          </Button>
        )}
        {subscriptionStatus !== 'CANCELED' && (
          <Button variant="destructive" disabled={loadingAction==='cancel_immediately'} onClick={() => {
            if (confirm('Confirmer la résiliation immédiate ?')) callManage({ action: 'cancel_immediately' });
          }}>
            {loadingAction==='cancel_immediately' ? 'Résiliation...' : 'Résiliation immédiate'}
          </Button>
        )}
      </div>
    </div>
  );
}
