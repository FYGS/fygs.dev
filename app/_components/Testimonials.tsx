"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  ArrowUp,
  Award,
} from "lucide-react";
import { useIntlayer } from "next-intlayer";

const STAT_ICONS = [Users, TrendingUp, ArrowUp];

export function Testimonials() {
  const content = useIntlayer("testimonials");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotation of testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, content.testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % content.testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + content.testimonials.length) % content.testimonials.length
    );
    setIsAutoPlaying(false);
  };

  const currentTestimonial = content.testimonials[currentIndex];

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-muted/30 via-background to-muted/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container max-w-7xl mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            {content.badge.value}
          </div>
          <motion.h2
            className="text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {content.title.value}
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {content.description.value}
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          {content.stats.map((stat, index) => {
            const IconComponent = STAT_ICONS[index];
            return (
              <motion.div
                key={stat.label.value}
                className="text-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label.value}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-2xl bg-linear-to-br from-card via-card to-muted/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-xl" />

            <CardContent className="p-8 lg:p-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Avatar & Info */}
                <motion.div
                  className="text-center lg:text-left space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Avatar className="w-24 h-24 mx-auto lg:mx-0 ring-4 ring-primary/20">
                    <AvatarImage
                      src={
                        currentTestimonial.avatar.value
                      }
                      alt={
                        currentTestimonial.name.value
                      }
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {(currentTestimonial.name.value
                      )
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-xl font-bold">
                      {currentTestimonial.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentTestimonial.role.value}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      {currentTestimonial.company}
                    </p>
                  </div>

                  {/* Course Badge */}
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {currentTestimonial.course.value}
                  </Badge>
                </motion.div>

                {/* Testimonial Content */}
                <motion.div
                  className="lg:col-span-2 space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {/* Quote */}
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                    <blockquote className="text-lg lg:text-xl leading-relaxed pl-6">
                      &ldquo;{currentTestimonial.content.value}&rdquo;
                    </blockquote>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i <
                          (typeof currentTestimonial.rating === "number"
                            ? currentTestimonial.rating
                            : 5)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Career Evolution */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="text-center flex-1">
                      <div className="text-sm text-muted-foreground">
                        {content.careerEvolution.before.value}
                      </div>
                      <div className="font-medium">
                        {currentTestimonial.beforeRole.value}
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-linear-to-r from-muted-foreground/50 to-primary/50 flex items-center justify-center">
                      <div className="bg-background px-2">
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-sm text-muted-foreground">
                        {content.careerEvolution.after.value}
                      </div>
                      <div className="font-medium text-primary">
                        {currentTestimonial.afterRole.value}
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-sm text-muted-foreground">
                        {content.careerEvolution.salary.value}
                      </div>
                      <div className="font-bold text-green-600">
                        {currentTestimonial.salaryIncrease}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors shadow-lg"
              aria-label={content.navigation.previous.value}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {content.testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-primary scale-125"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`${content.navigation.goTo.value} ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors shadow-lg"
              aria-label={content.navigation.next.value}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
