"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SessionConcurrencyControl() {
  const [loading, setLoading] = useState(false);
  const handleRevoke = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sessions/revoke-others', { method: 'POST' });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Autres sessions révoquées');
    } catch (e:any) {
      toast.error(e.message || 'Impossible de révoquer');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Déconnecter toutes les autres sessions actives pour sécuriser votre compte.</p>
      <Button variant="outline" onClick={handleRevoke} disabled={loading}>
        {loading ? 'Révocation...' : 'Révoquer autres sessions'}
      </Button>
    </div>
  );
}