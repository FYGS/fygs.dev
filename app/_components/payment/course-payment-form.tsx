"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Shield, 
  Check, 
  Star, 
  Users, 
  Clock,
  Zap,
  Gift,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { enrollCourse } from "@/app/(dashboard)/actions/enrollCourse";
import { formatPrice as formatPriceCentral } from "@/lib/price-format";
import { logger, createLogger } from "@/lib/structured-logger";
import { Analytics } from "@/lib/analytics";
import { toast } from "sonner";

interface CoursePaymentFormProps {
  course: {
    id: string;
    slug: string;
    title: string;
    price: number;
    level: string;
    duration?: number | null; // minutes aggregated (DTO) optional
    enrollmentCount?: number;
    averageRating?: number;
    firstLessonSlug?: string | null;
    previewEnabled?: boolean;
  };
  isEnrolled?: boolean;
  canPreview?: boolean;
  hasPurchased?: boolean; // user owns entitlement (purchase or subscription) but may not be enrolled
}

export function CoursePaymentForm({ course, isEnrolled = false, canPreview = false, hasPurchased = false }: CoursePaymentFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const correlationId = logger.generateCorrelationId();
  const paymentLogger = createLogger({ 
    operation: 'course-payment',
    correlationId,
    resourceType: 'course',
    resourceId: course.id
  });

  const formatPrice = (price: number) => formatPriceCentral(price, { showFreeLabel: true });

  const totalHours = course.duration ? Math.max(1, Math.round((course.duration * 60) / 3600)) : 0;
  const enrollmentCount = course.enrollmentCount ?? 0;
  const averageRating = course.averageRating ?? 0;

  const handlePayment = async () => {
    if (isEnrolled) {
      const firstLessonSlug = course.firstLessonSlug || null;
      window.location.href = firstLessonSlug
        ? `/formations/${course.slug}/lessons/${firstLessonSlug}`
        : `/formations/${course.slug}`;
      return;
    }

    if (!session) {
      paymentLogger.warn("Unauthenticated payment attempt", {
        userId: undefined,
        metadata: { courseId: course.id, price: course.price }
      });
      toast.warning("Vous devez être connecté",{
        description: "Veuillez vous connecter pour effectuer un achat",
      });
      window.location.href = "/auth/login";
      return;
    }

    // Track CTA click
    await Analytics.courseCardCtaClicked(session.user.id, {
      courseId: course.id,
      courseSlug: course.slug,
      price: course.price,
      correlationId
    });

    if (course.price === 0) {
      // Free course - server action enrollment
      startTransition(async () => {
        try {
          paymentLogger.info("Starting free course enrollment", {
            userId: session.user.id,
            resourceId: course.id
          });
          const result = await enrollCourse({ courseId: course.id });
          if (result.success) {
            paymentLogger.info("Free course enrollment successful", {
              userId: session.user.id,
              resourceId: course.id
            });
            toast.success("Inscription réussie", { description: result.message });
            const firstLesson = course.firstLessonSlug;
            window.location.href = firstLesson ? `/formations/${course.slug}/lessons/${firstLesson}` : `/formations/${course.slug}`;
          } else {
            toast.error("Erreur lors de l'inscription", { description: result.message });
          }
        } catch (enrollError) {
          console.error('Free course enrollment error:', enrollError);
          toast.error("Erreur lors de l'inscription", { description: 'Une erreur est survenue' });
        }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          slug: course.slug,
          type: "course",
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erreur lors de la création du paiement",{
          description: data.error || "Erreur lors de la création du paiement",
        });
      }
    } catch (paymentError) {
      console.error('Payment creation error:', paymentError);
      toast.error("Erreur lors de la création du paiement",{
        description: "Une erreur est survenue lors de la création du paiement",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFree = course.price === 0;
  const showEnrollButton = hasPurchased && !isEnrolled;
  const enrollExplicitly = () => {
    startTransition(async () => {
      try {
        const result = await enrollCourse({ courseId: course.id });
        if (result.success) {
          toast.success('Inscription réussie', { description: result.message });
          const firstLesson = course.firstLessonSlug;
          window.location.href = firstLesson ? `/formations/${course.slug}/lessons/${firstLesson}` : `/formations/${course.slug}`;
        } else {
          toast.error('Erreur lors de l\'inscription', { description: result.message });
        }
      } catch (enrollmentError) {
        console.error('Course enrollment error:', enrollmentError);
        toast.error('Erreur', { description: 'Une erreur est survenue' });
      }
    });
  };


  return (
    <Card className="sticky top-4 shadow-lg border-2">
      {isEnrolled && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-center py-2 px-4 text-sm font-medium">
          ✅ Vous êtes inscrit à cette formation
        </div>
      )}
      {showEnrollButton && !isEnrolled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-center py-2 px-4 text-xs">
          Vous avez accès. Cliquez pour vous inscrire afin d&apos;ajouter la formation à votre tableau de bord.
        </div>
      )}
      <CardHeader className="text-center space-y-4">
        <div className="space-y-2">
          <div className="text-4xl font-bold text-primary">
            {isEnrolled ? (
              <span className="text-green-600 dark:text-green-400 text-3xl">Débloqué</span>
            ) : isFree ? (
              "Gratuit"
            ) : (
              formatPrice(course.price)
            )}
          </div>
          {!isFree && !isEnrolled && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              <span>Accès à vie inclus</span>
            </div>
          )}
        </div>
        
        {/* Course Stats */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{enrollmentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{totalHours}h</span>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Button 
          className="w-full h-12 text-lg font-semibold" 
          size="lg"
          onClick={showEnrollButton ? enrollExplicitly : handlePayment}
          disabled={loading || isPending}
          variant={isEnrolled ? 'outline' : (showEnrollButton ? 'default' : 'default')}
        >
          {loading || isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Traitement...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full">
              {isEnrolled ? (
                <>
                  <PlayCircle className="h-5 w-5" />
                  <span>Continuer la formation</span>
                </>
              ) : showEnrollButton ? (
                <>
                  <PlayCircle className="h-5 w-5" />
                  <span>S&apos;inscrire maintenant</span>
                </>
              ) : isFree ? (
                <>
                  <Zap className="h-5 w-5" />
                  <span>S&apos;inscrire gratuitement</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Acheter maintenant</span>
                </>
              )}
              {!isEnrolled && <ArrowRight className="h-4 w-4" />}
            </div>
          )}
        </Button>

        {!isEnrolled && canPreview && course.firstLessonSlug && (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              window.location.href = `/formations/${course.slug}/lessons/${course.firstLessonSlug}?preview=1`;
            }}
          >
            <PlayCircle className="h-4 w-4 mr-2" /> Prévisualiser la première leçon
          </Button>
        )}

        {!isFree && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Garantie satisfait ou remboursé 30 jours</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Paiement sécurisé par Stripe (cartes, wallets, virements selon éligibilité)
            </p>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-center">Cette formation inclut :</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">{totalHours}h de contenu vidéo HD</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Accès à vie sur tous vos appareils</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Certificat de completion</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Ressources téléchargeables</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Support communautaire</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Mises à jour gratuites</span>
            </div>
          </div>
        </div>

        {/* Stripe Checkout gère plusieurs moyens de paiement automatiquement */}

        <Separator />

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">FS</span>
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Fernand Soualo</p>
              <p className="text-xs text-muted-foreground">Expert Fullstack</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
