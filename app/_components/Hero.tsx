"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  const content = useIntlayer("hero");
  return (
    <Section className="relative overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />
      <div className="relative container max-w-7xl mx-auto px-4 z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 w-full text-center lg:text-left">
            <p className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              {content.eyebrow}
            </p>
            <h1 className="font-caption text-4xl lg:text-6xl font-bold text-gradient-primary mb-6 leading-tight">
              {content.title}
            </h1>
            <p className="text-lg lg:text-xl leading-relaxed text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              {content.subtitle}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
              {content.techStack.map((tech) => (
                <span
                  key={tech.value}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm"
                >
                  {tech.value}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
              <Button size="lg" asChild>
                <Link href="#contact">
                  {content.primaryCta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#projects">{content.secondaryCta}</Link>
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              {content.location}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-xl opacity-70" />
              <div className="relative overflow-hidden rounded-3xl border-4 border-primary/20 bg-white">
                <Image
                  src="/images/fernand_photo.webp"
                  alt="Fernand Soualo"
                  width={800}
                  height={960}
                  sizes="(min-width: 1024px) 400px, 288px"
                  className="w-72 lg:w-100 h-auto object-cover"
                  priority
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};
