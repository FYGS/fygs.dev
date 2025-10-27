"use client";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactCard } from "./ContactCard";
import { Section } from "./Section";
import { Mail, MessageCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export const ContactSection = () => {
  return (
    <Section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-br from-muted/30 via-background to-muted/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Mail className="w-4 h-4" />
            Contact Me
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-bold bg-linear-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Let&apos;s Work Together on Your{" "}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Next Project
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether it&apos;s for a custom course, web development, or technical consultation,
            I&apos;m here to help you bring your most ambitious projects to life.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <ContactForm />
          </div>

          {/* Contact Information & Social Links */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-6">
              <motion.h3
                className="text-2xl font-semibold mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                Other ways to reach me
              </motion.h3>
              
              {/* Quick Contact Options */}
              <motion.div
                className="grid gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Direct Email</h4>
                    <p className="text-sm text-muted-foreground">fygs.dev@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Quick Response</h4>
                    <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Free Consultation</h4>
                    <p className="text-sm text-muted-foreground">30 min to discuss your project</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-medium">Find me also on</h4>
              <div className="grid gap-4">
                <ContactCard
                  url="https://www.linkedin.com/in/fernandsoualo/"
                  name="@fernandsoualo"
                  description="Follow me on LinkedIn"
                  image="/linkedin_profile_photo.jpeg"
                  mediumImage="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRokEYt0yyh6uNDKL8uksVLlhZ35laKNQgZ9g&s"
                />
                <ContactCard
                  url="https://github.com/fygs"
                  name="@fygsdev"
                  description="Discover my projects on GitHub"
                  image="https://avatars.githubusercontent.com/u/24303747?v=4"
                  mediumImage="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
                />
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="p-6 rounded-lg bg-linear-to-br from-primary/5 to-primary/10 border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-primary mb-2">Ready to start?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your project in the form and receive a personalized response with a free estimate.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">Web Development</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">Training</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">Consulting</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
