import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import type { CvPage } from "../_data/cv-types";
import type { buildLocalizedTechnicalSkills } from "../_data/localized-cv";

export function TechnicalSkillsCard({
  cv,
  localizedTechnicalSkills,
}: {
  cv: CvPage;
  localizedTechnicalSkills: ReturnType<typeof buildLocalizedTechnicalSkills>;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold hover:text-primary transition-colors duration-300">
            {cv.sections.technicalSkills}
          </h2>
        </div>

        <div className="space-y-6">
          {localizedTechnicalSkills.map(({ category, skills }) => (
            <div
              key={String(category)}
              className="space-y-2.5 hover:translate-x-0.5 transition-transform duration-300"
            >
              <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">
                {category}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs hover:bg-primary/10 hover:text-primary hover:scale-105 hover:shadow-xs transition-all duration-300"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground hover:text-foreground/80 transition-colors duration-300">
            {cv.skills.learningNote}
          </p>
        </div>
      </div>
    </Card>
  );
}
