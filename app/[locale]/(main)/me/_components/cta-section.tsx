import Link from "next/link";
import { AvailabilityIndicator } from "@/components/ui/availability-indicator";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Mail, Phone } from "lucide-react";
import { Linkedin } from "@/components/icons/brand-icons";
import type { CvPage } from "../_data/cv-types";

export function CtaSection({ cv }: { cv: CvPage }) {
  return (
    <Card className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <div className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gradient-accent">
            {cv.cta.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {cv.cta.description}
          </p>

          {/* Indicateur de disponibilité */}
          <div className="flex justify-center">
            <AvailabilityIndicator />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="mailto:fygs.dev@gmail.com"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "group min-w-[200px] bg-primary/90 hover:bg-primary transition-all duration-300",
            )}
          >
            <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
            {cv.cta.emailMe}
          </Link>

          {/* Calendrier de réservation */}
          {/* <BookingCalendar /> */}
          <Link
            href="https://calendly.com/fygs-dev/first-contact"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md transition-colors duration-300",
            )}
          >
            <Calendar className="mr-2 h-5 w-5" />
            {cv.cta.scheduleMeeting}
          </Link>

          <Link
            href="https://www.linkedin.com/in/fernandsoualo"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "group min-w-[200px] hover:bg-primary/10 transition-all duration-300",
            )}
          >
            <Linkedin className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            {cv.cta.connectLinkedin}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
            <Mail className="h-4 w-4" />
            fygs.dev@gmail.com
          </div>
          <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
            <Phone className="h-4 w-4" />
            +33 6 44 80 85 30
          </div>
          <div className="flex items-center gap-2 hover:text-primary transition-colors duration-300">
            <Linkedin className="h-4 w-4" />
            @fernandsoualo
          </div>
        </div>

        <div
          className="text-center pt-4 text-sm text-muted-foreground opacity-0 animate-fadeIn"
          style={{
            animation: "fadeIn 0.5s ease-in-out 0.5s forwards",
          }}
        >
          {cv.cta.availability}
        </div>
      </div>
    </Card>
  );
}
