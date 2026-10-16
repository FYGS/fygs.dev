import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Globe2 } from "lucide-react";
import type { CvPage } from "../_data/cv-types";
import type { buildLocalizedLanguages } from "../_data/localized-cv";

export function LanguagesCard({
  cv,
  localizedLanguages,
}: {
  cv: CvPage;
  localizedLanguages: ReturnType<typeof buildLocalizedLanguages>;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-2 mb-4">
        <Globe2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
        <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
          {cv.sections.languages}
        </h2>
      </div>
      <div className="space-y-3">
        {localizedLanguages.map(({ language, level }, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-2.5 rounded-lg hover:bg-accent/50 transition-all duration-300 group/item cursor-default"
          >
            <span className="font-medium group-hover/item:text-primary transition-colors duration-300">
              {language}
            </span>
            <Badge
              variant="secondary"
              className="bg-primary/5 text-primary border-primary/20 group-hover/item:bg-primary/10 transition-all duration-300"
            >
              {level}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
