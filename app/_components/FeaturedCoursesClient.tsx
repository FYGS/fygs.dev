"use client";

import { Button } from "@/components/ui/button";
import { FadeInWhenVisible } from "@/components/ui/fade-in";
import { ArrowRight, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseCardShared } from "@/components/courses/course-card-shared";
import type { CourseCardData } from "@/lib/access/course-cards";
import { motion } from "framer-motion";
import { useIntlayer } from "next-intlayer";

// Types pour les cours sérialisés
interface FeaturedCoursesClientProps {
  courses: CourseCardData[];
}

export function FeaturedCoursesClient({ courses }: FeaturedCoursesClientProps) {
  const content = useIntlayer("featured-courses-client");

  if (courses.length === 0) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">{content.noFeaturedCourses}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        <FadeInWhenVisible>
          <div className="text-center space-y-4 mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="h-4 w-4" />
              {content.premiumCoursesLabel}
            </motion.div>
            <motion.h2
              className="text-4xl lg:text-5xl font-bold mb-4 text-gradient-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {content.mostPopularCoursesTitle}
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {content.mostPopularCoursesDescription}
            </motion.p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <FadeInWhenVisible key={course.id} delay={index * 0.08}>
              <CourseCardShared course={course} />
            </FadeInWhenVisible>
          ))}
        </div>

        {/* CTA Section */}
        <FadeInWhenVisible delay={0.4}>
          <div className="text-center mt-12">
            <Button
              size="lg"
              asChild
              className="group hover:scale-105 transition-transform"
            >
              <Link href="/formations">
                <BookOpen className="h-5 w-5 mr-2" />
                {content.viewAllCoursesButton}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
