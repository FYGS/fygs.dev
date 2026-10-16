import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CvData, CvPage } from "../_data/cv-types";
import type { buildPreferenceSections } from "../_data/preference-sections";

export function PreferencesCard({
  cv,
  cvData,
  preferenceSections,
}: {
  cv: CvPage;
  cvData: CvData;
  preferenceSections: ReturnType<typeof buildPreferenceSections>;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {cvData.preferences.title}
          </h2>
        </div>

        <div className="space-y-4">
          {preferenceSections.map((section, index) => (
            <div
              key={String(section.title) + index}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-primary">
                <section.icon className="h-4 w-4" />
                <h3 className="text-sm font-medium">{section.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.options.map((option: string) => (
                  <Tooltip key={option}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "text-sm px-3 py-1 rounded-full border transition-all duration-300",
                          "hover:scale-105 hover:shadow-md cursor-pointer",
                          "transform-gpu hover:-translate-y-0.5",
                          option === section.current
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30",
                        )}
                      >
                        {option}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>
                        {
                          section.details[
                            option as keyof typeof section.details
                          ]
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="pt-4 border-t opacity-0 translate-y-4 transition-all duration-500"
          style={{
            animation: "fadeInSlideUp 0.5s ease-out 0.2s forwards",
          }}
        >
          <p className="text-sm text-muted-foreground">
            {cv.preferences.flexNote}
          </p>
        </div>
      </div>
    </Card>
  );
}
