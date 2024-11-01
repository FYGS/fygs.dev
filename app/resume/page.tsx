import { Section } from "@/app/_components/Section";
import { Timeline } from "@/app/_components/Timeline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

const EXPERIENCE_ITEMS = [
  {
    date: "2023 - Present",
    title: "Senior Software Engineer",
    company: "Allianz Technology",
    description:
      "Leading the development of cloud-native applications using AWS serverless architecture...",
    technologies: ["NodeJS", "TypeScript", "AWS Lambda", "DynamoDB", "NestJS"],
    current: true,
  },
  {
    date: "2019 - Present",
    title: "Full Stack Software Engineer",
    company: "Ouestech (Freelance)",
    description:
      "Developing and maintaining scalable web applications for various clients...",
    technologies: ["React", "NextJS", "TypeScript", "TailwindCSS", "AWS"],
    current: true,
  },
  // Ajoutez d'autres expériences...
];

export const metadata: Metadata = {
  title: "Fernand SOUALO - Professional Resume | Senior Software Engineer",
  description:
    "View my professional experience, skills, and achievements. Download my resume to learn more about my expertise in NodeJS, TypeScript, React, and AWS.",
};

export default function ResumePage() {
  return (
    <Section className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Professional Resume</h1>
        <Link
          href="/Fernand_SOUALO_Resume.pdf"
          target="_blank"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <Download size={20} />
          Download PDF
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">
            Professional Experience
          </h2>
          <Timeline items={EXPERIENCE_ITEMS} />
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {["NodeJS", "TypeScript", "React", "AWS", "NestJS", "NextJS"].map(
                (skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                )
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Languages</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>French</span>
                <span>Native</span>
              </div>
              <div className="flex justify-between">
                <span>English</span>
                <span>Professional</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
