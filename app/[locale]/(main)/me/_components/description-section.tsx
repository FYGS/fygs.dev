import { Card } from "@/components/ui/card";
import { Briefcase, Code2, Rocket, Target } from "lucide-react";
import type { CvData } from "../_data/cv-types";
import type {
  buildExperienceItems,
  buildExpertiseItems,
  buildServicesItems,
  buildWhyMeItems,
} from "../_data/description-items";

interface DescriptionSectionProps {
  cvData: CvData;
  experienceItems: ReturnType<typeof buildExperienceItems>;
  expertiseItems: ReturnType<typeof buildExpertiseItems>;
  servicesItems: ReturnType<typeof buildServicesItems>;
  whyMeItems: ReturnType<typeof buildWhyMeItems>;
}

export function DescriptionSection({
  cvData,
  experienceItems,
  expertiseItems,
  servicesItems,
  whyMeItems,
}: DescriptionSectionProps) {
  return (
    <Card className="p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group border-t-2 border-t-primary/30">
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary group-hover:scale-[1.01] transition-transform duration-300">
            {cvData.description.intro.title}
          </h2>
          <p className="text-lg text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
            {cvData.description.intro.subtitle}
          </p>
          <p className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
            {cvData.description.intro.mainText}
          </p>
          <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
            {cvData.description.intro.description}
          </p>
        </div>

        {/* Industry Experience */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {cvData.description.experience.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experienceItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card hover:bg-accent/50"
              >
                <item.icon className="h-5 w-5 text-primary mt-1 transition-transform duration-300 group-hover:scale-110" />
                <div>
                  <p className="font-medium hover:text-primary transition-colors duration-300">
                    {item.company}
                  </p>
                  <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Offered */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            {cvData.description.services.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {servicesItems.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-all duration-300 group cursor-default"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform duration-300" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {service}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Me */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {cvData.description.whyMe.title}
          </h3>
          <div className="space-y-2">
            {whyMeItems.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <item.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Expertise */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            {cvData.description.expertise.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertiseItems.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group cursor-default"
              >
                <div className="flex items-start gap-3">
                  <item.icon className="h-5 w-5 text-primary mt-1 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
