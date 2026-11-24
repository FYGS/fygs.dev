"use client";

import { Section } from "@/app/_components/Section";
import { Card } from "@/components/ui/card";
import { Calendar, Mail, MapPin, MessageSquare } from "lucide-react";
// import { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { useIntlayer } from "next-intlayer";

// export const metadata: Metadata = {
//   title: "Contact - Fernand SOUALO | Let's Work Together",
//   description:
//     "Get in touch with Fernand SOUALO for your next project. Available for freelance work and technical consulting.",
// };

export default function ContactPage() {
  const content = useIntlayer("contact-page");

  return (
    <Section className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gradient-heading">
          {content.page.title.value}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {content.page.description.value}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.contactInfo.map((info, index) => {
              const icons = [MapPin, Mail, Calendar, MessageSquare];
              const Icon = icons[index];
              return (
                <Card key={info.title.value} className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">{info.title.value}</h2>
                  </div>
                  <p className="text-muted-foreground">
                    {info.description.value}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">
              {content.page.whyWorkWithMe.title.value}
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              {content.page.whyWorkWithMe.points.map((point, index) => (
                <li key={index}>{point.value}</li>
              ))}
            </ul>
          </Card>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
