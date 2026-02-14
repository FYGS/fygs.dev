"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Section } from "./Section";
import { LinkedInIcon } from "./icons/LinkedInIcon";
import { GithubIcon } from "./icons/GithubIcon";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIntlayer } from "next-intlayer";

export const Hero = () => {
  const content = useIntlayer("hero");
  return (
    <Section className="relative overflow-hidden py-20 lg:py-28">
      {/* Minimal background — single subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03]" />

      <div className="relative container max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Text Content */}
          <motion.div
            className="flex-1 w-full text-center lg:text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="font-caption text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">
              {content.title}
            </h2>
            <h3 className="font-caption font-semibold text-2xl lg:text-3xl mb-5 text-muted-foreground">
              {content.subtitle}
            </h3>
            <p className="text-base lg:text-lg leading-relaxed text-muted-foreground/80 mb-8 max-w-xl mx-auto lg:mx-0">
              {content.description}
            </p>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
              {content.techStack.map((tech) => (
                <span
                  key={tech.value}
                  className="px-3 py-1.5 rounded-full bg-primary/8 text-primary font-medium text-xs tracking-wide hover:bg-primary/15 transition-colors"
                >
                  {tech.value}
                </span>
              ))}
            </div>

            {/* Contact Links */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              <Link
                href="https://www.linkedin.com/in/fernandsoualo"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 group border-border/50 hover:border-primary/30"
                >
                  <LinkedInIcon
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  LinkedIn
                  <ArrowUpRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link
                href="https://github.com/fygs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 group border-border/50 hover:border-primary/30"
                >
                  <GithubIcon
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  GitHub
                  <ArrowUpRight className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
              <Link href="mailto:fygs.dev@gmail.com" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 group border-border/50 hover:border-primary/30"
                >
                  <Mail className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                  {content.contact}
                </Button>
              </Link>
            </div>

            {/* Location */}
            <div className="flex items-center justify-center lg:justify-start gap-1.5 text-muted-foreground/60 text-xs tracking-wide">
              <MapPin className="h-3 w-3" />
              {content.location}
            </div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative rounded-full overflow-hidden border-2 border-border/30 group-hover:border-primary/30 transition-colors duration-500">
                <Image
                  src="/linkedin_profile_photo.jpeg"
                  alt="Fernand Soualo"
                  width={280}
                  height={280}
                  className="w-56 h-56 lg:w-64 lg:h-64 object-cover rounded-full"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};
