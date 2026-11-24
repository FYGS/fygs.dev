import { Timeline, type TimelineItemProps } from "@/app/_components/Timeline";
import { Card } from "@/components/ui/card";
import { Briefcase, GraduationCap } from "lucide-react";
import type { CvPage } from "../_data/cv-types";

export function ExperienceEducation({
  cv,
  localizedExperiences,
  localizedEducation,
}: {
  cv: CvPage;
  localizedExperiences: TimelineItemProps[];
  localizedEducation: TimelineItemProps[];
}) {
  return (
    <div className="md:col-span-2 space-y-6">
      {/* Professional Experience */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            {cv.sections.experience}
          </h2>
        </div>
        <Timeline items={localizedExperiences} />
      </Card>

      {/* Education */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">
            {cv.sections.education}
          </h2>
        </div>
        <Timeline items={localizedEducation} variant="education" />
      </Card>
    </div>
  );
}
