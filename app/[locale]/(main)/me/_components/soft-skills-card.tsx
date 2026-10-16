import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { CvPage } from "../_data/cv-types";
import type { buildLocalizedSoftSkills } from "../_data/localized-cv";

export function SoftSkillsCard({
  cv,
  localizedSoftSkills,
}: {
  cv: CvPage;
  localizedSoftSkills: ReturnType<typeof buildLocalizedSoftSkills>;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
        <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
          {cv.sections.softSkills}
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {localizedSoftSkills.map((skill, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="bg-primary/5 text-primary/90 hover:bg-primary/15 hover:scale-105 transition-all duration-300 cursor-default"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
