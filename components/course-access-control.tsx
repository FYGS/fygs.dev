'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/premium-badge";
import { Crown, ShoppingCart, Play, Lock } from "lucide-react";
import Link from "next/link";

interface CourseAccessControlProps {
  course: {
    id: string;
    slug: string;
    title: string;
    price?: number;
  };
  userAccess: {
    hasActiveSubscription: boolean;
    isEnrolledInCourse: boolean;
    canAccessCourse: boolean;
  };
  firstLessonSlug?: string | null;
}

export function CourseAccessControl({ 
  course, 
  userAccess, 
  firstLessonSlug 
}: CourseAccessControlProps) {
  const { hasActiveSubscription, isEnrolledInCourse, canAccessCourse } = userAccess;
  const coursePrice = course.price ? Number(course.price) : 0;
  const isFree = coursePrice === 0;

  // Check comprehensive access before rendering specific states
  if (!canAccessCourse && !hasActiveSubscription && !isEnrolledInCourse && !isFree) {
    console.log('User access restricted for course:', course.slug);
  }

  // User has Premium subscription
  if (hasActiveSubscription) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PremiumBadge />
          <span className="text-sm text-green-600 font-medium">
            Inclus avec Premium
          </span>
        </div>
        <Button asChild className="w-full">
          <Link 
            href={firstLessonSlug ? 
              `/formations/${course.slug}/lessons/${firstLessonSlug}` : 
              `/formations/${course.slug}`
            }
          >
            <Play className="h-4 w-4 mr-2" />
            Commencer la formation
          </Link>
        </Button>
      </div>
    );
  }

  // User is enrolled in this specific course
  if (isEnrolledInCourse) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✓ Acheté
          </Badge>
        </div>
        <Button asChild className="w-full">
          <Link 
            href={firstLessonSlug ? 
              `/formations/${course.slug}/lessons/${firstLessonSlug}` : 
              `/formations/${course.slug}`
            }
          >
            <Play className="h-4 w-4 mr-2" />
            Continuer la formation
          </Link>
        </Button>
      </div>
    );
  }

  // Free course
  if (isFree) {
    return (
      <div className="space-y-4">
        <div className="text-2xl font-bold text-green-600">
          Gratuit
        </div>
        <Button asChild className="w-full">
          <Link href={`/formations/${course.slug}`}>
            <Play className="h-4 w-4 mr-2" />
            Commencer gratuitement
          </Link>
        </Button>
      </div>
    );
  }

  // Paid course - show purchase options
  return (
    <div className="space-y-4">
      {/* Premium Option */}
      <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-5 w-5 text-purple-600" />
          <span className="font-semibold text-purple-900">Recommandé</span>
        </div>
        <div className="text-sm text-purple-700 mb-3">
          <strong>Inclus avec FYGS Premium</strong> + accès à toutes les autres formations
        </div>
        <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Link href="/pricing">
            <Crown className="h-4 w-4 mr-2" />
            Devenir Premium
          </Link>
        </Button>
        <div className="text-xs text-purple-600 mt-2 text-center">
          À partir de 29€/mois - Annulable à tout moment
        </div>
      </div>

      {/* Individual Purchase */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Achat individuel</span>
          <span className="text-2xl font-bold text-primary">
            {coursePrice}€
          </span>
        </div>
        <div className="text-sm text-muted-foreground mb-3">
          Accès à vie à cette formation uniquement
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/formations/${course.slug}?purchase=individual`}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Acheter ce cours
          </Link>
        </Button>
      </div>

      {/* Preview available */}
      <Button asChild variant="ghost" className="w-full">
        <Link href={`/formations/${course.slug}`}>
          <Lock className="h-4 w-4 mr-2" />
          Aperçu gratuit
        </Link>
      </Button>
    </div>
  );
}