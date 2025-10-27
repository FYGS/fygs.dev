"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Rocket,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Crown,
  CheckCircle,
  GraduationCap,
  Shield,
  Clock
} from "lucide-react";
import Link from "next/link";

const BENEFITS = [
   "Unlimited access to all courses",
   "Practical projects and certificates",
   "24/7 community support",
   "Free lifetime updates",
   "Early access to new courses",
   "Personal mentoring session"
];

const FEATURES = [
  { icon: GraduationCap, label: "Project-based learning", desc: "Practical and effective method" },
  { icon: Shield, label: "Satisfaction guarantee", desc: "Refund if not satisfied" },
  { icon: Clock, label: "24/7 Access", desc: "Learn at your own pace" }
];

export function CallToAction() {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
      
      <div className="container max-w-7xl mx-auto px-4 relative">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-4 w-4" />
              Limited Offer
            </motion.div>
            
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Transform your{" "}
              <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                developer
              </span>
              {" "}career
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Join over 15,000 developers who have already boosted their careers 
              with our premium courses. Start today!
            </motion.p>

            {/* Features */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="text-center p-4 rounded-lg bg-card/50 border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium text-foreground">{feature.label}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Button 
                size="lg" 
                className="group hover:scale-105 transition-transform bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 py-6"
                asChild
              >
                <Link href="/formations">
                  <Rocket className="h-5 w-5 mr-2" />
                  Start now
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="group hover:scale-105 transition-transform text-lg px-8 py-6"
                asChild
              >
                <Link href="/pricing">
                  <Crown className="h-5 w-5 mr-2" />
                  View Pricing
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex items-center gap-8 pt-6 border-t border-border"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">15K+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Elements */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Main Card */}
            <Card className="p-8 bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
              
              <div className="relative space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Personalized Training</h3>
                      <p className="text-sm text-muted-foreground">Adapted to your level and goals</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Quick Results</h3>
                      <p className="text-sm text-muted-foreground">Visible progress in 30 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl">Recognized Expertise</h3>
                      <p className="text-sm text-muted-foreground">By industry professionals</p>
                    </div>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h4 className="font-semibold text-lg">What You Get:</h4>
                  <div className="space-y-3">
                    {BENEFITS.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Elements */}
            <motion.div 
              className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-primary/20"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -bottom-6 -left-6 w-8 h-8 rounded-full bg-secondary/30"
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
