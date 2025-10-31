"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Section } from "./Section";
import { LinkedInIcon } from "./icons/LinkedInIcon";
import { GithubIcon } from "./icons/GithubIcon";
import { Mail, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntlayer } from "next-intlayer";

export const Hero = () => {
  const content = useIntlayer("hero");
  return (
    <Section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30 animate-pulse delay-1000" />

      <div className="relative container max-w-7xl mx-auto px-4 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <motion.div
            className="flex-1 w-full text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="font-caption text-5xl lg:text-6xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {content.title}
            </motion.h2>
            <motion.h3
              className="font-caption font-bold text-3xl lg:text-4xl mb-6 text-foreground/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {content.subtitle}
            </motion.h3>
            <motion.p
              className="text-lg lg:text-xl leading-relaxed text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {content.description}
            </motion.p>

            {/* Tech Stack Badges */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {content.techStack.map((tech, index) => (
                <span
                  key={tech.value}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tech.value}
                </span>
              ))}
            </motion.div>

            {/* Contact Links */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                href="https://www.linkedin.com/in/fernandsoualo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 group"
                >
                  <LinkedInIcon
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  LinkedIn
                  <ExternalLink className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link
                href="https://github.com/fygs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="flex items-center gap-2 group"
                >
                  <GithubIcon
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  GitHub
                  <ExternalLink className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="mailto:fygs.dev@gmail.com" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 group"
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {content.contact}
                  <ExternalLink className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </motion.div>

            {/* Location */}
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <MapPin className="h-4 w-4" />
              {content.location}
            </motion.div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                <Image
                  src="/linkedin_profile_photo.jpeg"
                  alt="Fernand Soualo"
                  width={300}
                  height={300}
                  className="w-64 h-64 lg:w-72 lg:h-72 object-cover rounded-full transition-transform group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};
