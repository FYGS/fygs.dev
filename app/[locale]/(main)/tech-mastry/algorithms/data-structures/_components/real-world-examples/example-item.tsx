import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { RealWorldExample } from "./types";

interface ExampleItemProps {
  example: RealWorldExample;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ExampleItem({ example, isExpanded, onToggle }: ExampleItemProps) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggle()}
      className="border rounded-lg overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between bg-muted/30 cursor-pointer">
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <h3 className="font-medium">{example.title}</h3>
        </div>
        <Badge variant="outline">{example.category}</Badge>
      </div>

      <CollapsibleContent>
        <div className="p-4 space-y-4 border-t">
          {/* Description de l'exemple */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description:</h4>
            <p className="text-sm text-muted-foreground">
              {example.description}
            </p>
          </div>

          {/* Cas d'utilisation */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Cas d&apos;utilisation:
            </h4>
            <ul className="space-y-2">
              {example.useCases.map((useCase, index) => (
                <li key={index} className="space-y-1">
                  <h5 className="text-sm font-medium">
                    {useCase.title}
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Exemple de code */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Exemple de code:</h4>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">
                <code>{example.codeExample.code}</code>
              </pre>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {example.codeExample.explanation}
            </p>
          </div>

          {/* Références */}
          {example.references && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Références:</h4>
              <ul className="space-y-1">
                {example.references.map((reference, index) => (
                  <li
                    key={index}
                    className="text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {reference.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
