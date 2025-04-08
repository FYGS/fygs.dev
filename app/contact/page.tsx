import { Section } from "@/app/_components/Section";
import { Card } from "@/components/ui/card";
import { Calendar, Mail, MapPin, MessageSquare } from "lucide-react";
import { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact - Fernand SOUALO | Let's Work Together",
  description:
    "Get in touch with Fernand SOUALO for your next project. Available for freelance work and technical consulting.",
};

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: "Location",
    description: "France, Remote Worldwide",
  },
  {
    icon: Mail,
    title: "Email",
    description: "fygs.dev@gmail.com",
  },
  {
    icon: Calendar,
    title: "Availability",
    description: "Open for projects",
  },
  {
    icon: MessageSquare,
    title: "Response Time",
    description: "Within 24 hours",
  },
];

export default function ContactPage() {
  return (
    <Section className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Let&apos;s Work Together</h1>
        <p className="text-muted-foreground max-w-2xl">
          I&apos;m always interested in hearing about new projects and
          opportunities. Whether you have a question or just want to say hi,
          I&apos;ll try my best to get back to you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTACT_INFO.map((info) => (
              <Card key={info.title} className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <info.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{info.title}</h3>
                </div>
                <p className="text-muted-foreground">{info.description}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Why Work With Me?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ 5+ years of professional experience</li>
              <li>✓ Expertise in modern web technologies</li>
              <li>✓ Strong focus on code quality and best practices</li>
              <li>✓ Clear communication and regular updates</li>
              <li>✓ Scalable and maintainable solutions</li>
            </ul>
          </Card>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
