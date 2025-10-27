"use client";

import { Button } from "@/components/ui/button";
import { FadeInWhenVisible } from "@/components/ui/fade-in";
import { ArrowRight, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseCardShared } from "@/components/courses/course-card-shared";
import { FeaturedCourseDTO } from "@/types/course";
import { motion } from "framer-motion";

// Types pour les cours sérialisés
interface FeaturedCoursesClientProps { courses: FeaturedCourseDTO[] }

export function FeaturedCoursesClient({ courses }: FeaturedCoursesClientProps) {

  if (courses.length === 0) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">No featured courses available at the moment.</p>
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
              Premium Courses
            </motion.div>
            <motion.h2
              className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Most Popular Courses
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Join thousands of developers transforming their careers with our premium courses.
            </motion.p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <FadeInWhenVisible key={course.id} delay={index * 0.08}>
              <CourseCardShared
                course={course as any}
                accessState={course.price === 0 ? 'FREE' : 'LOCKED'}
                showPreviewCTA
                size="default"
              />
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
                <Link href="/courses">
                <BookOpen className="h-5 w-5 mr-2" />
                View all courses
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </Button>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}
