'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { requestRefund } from '@/app/(main)/dashboard/actions/requestRefund'

interface RefundButtonProps {
  subscriptionId: string
  className?: string
}

export function RefundButton({ subscriptionId, className }: RefundButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRefund = async () => {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir demander un remboursement ? Cette action annulera votre abonnement immédiatement.'
    )
    
    if (!confirmed) return

    setIsProcessing(true)
    
    startTransition(async () => {
      try {
        const result = await requestRefund({
          subscriptionId,
          reason: 'User requested refund via billing page'
        })

        if (result.success) {
          toast.success(result.message)
          // Reload the page to show updated status
          window.location.reload()
        } else {
          toast.error(result.message || 'Échec de la demande de remboursement')
        }
      } catch (error) {
        console.error('Refund request failed:', error)
        toast.error('Une erreur est survenue lors de la demande de remboursement')
      } finally {
        setIsProcessing(false)
      }
    })
  }

  return (
    <Button 
      onClick={handleRefund}
      disabled={isPending || isProcessing}
      variant="outline" 
      size="sm"
      className={className}
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isPending || isProcessing ? 'animate-spin' : ''}`} />
      {isPending || isProcessing ? 'Traitement...' : 'Demander un remboursement'}
    </Button>
  )
}