"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RecentEnrollment {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    title: string;
    slug: string;
    thumbnail: string | null;
  };
}

interface RecentActivityProps {
  userId: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [enrollments, setEnrollments] = useState<RecentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setEnrollments(data.recentEnrollments || []);
        }
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-16 h-16 bg-muted animate-pulse rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
            <div className="w-20 h-8 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <p className="text-muted-foreground">Aucune formation suivie pour le moment</p>
          <p className="text-sm text-muted-foreground mt-1">
            Explorez notre catalogue pour commencer votre apprentissage
          </p>
        </div>
        <Button asChild>
          <Link href="/formations">
            Découvrir les formations
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => (
        <div key={enrollment.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
            {enrollment.course.thumbnail ? (
              <Image
                src={enrollment.course.thumbnail}
                alt={enrollment.course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{enrollment.course.title}</h4>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Inscrit le {new Date(enrollment.enrolledAt).toLocaleDateString("fr-FR")}
              </span>
              {enrollment.completedAt && (
                <>
                  <span>•</span>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Terminé</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {enrollment.completedAt ? (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Terminé
              </Badge>
            ) : (
              <Badge variant="outline">
                En cours
              </Badge>
            )}
            
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/formations/${enrollment.course.slug}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {enrollments.length >= 5 && (
        <div className="text-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              Voir toutes mes formations
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
