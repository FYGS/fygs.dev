import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LessonsErrorBoundaryProps {
  error: Error;
  retry?: () => void;
}

export function LessonsErrorBoundary({
  error,
  retry,
}: LessonsErrorBoundaryProps) {
  // For now, using French text directly - can be internationalized if needed
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <CardTitle className="text-xl">
          Erreur lors du chargement des leçons
        </CardTitle>
        <CardDescription>
          Une erreur s&apos;est produite lors du chargement des données.
          Veuillez réessayer ou contacter le support si le problème persiste.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <details className="text-left bg-muted p-4 rounded-lg">
          <summary className="cursor-pointer font-medium mb-2">
            Détails de l&apos;erreur
          </summary>
          <code className="text-sm text-red-400 break-all">
            {error.message}
          </code>
        </details>

        <div className="flex items-center justify-center gap-4">
          {retry && (
            <Button onClick={retry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          )}
          <Button onClick={() => window.location.reload()} variant="default">
            Recharger la page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
