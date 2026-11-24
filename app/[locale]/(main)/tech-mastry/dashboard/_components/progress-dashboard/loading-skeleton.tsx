import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-muted/50 rounded-md animate-pulse"></div>
          <div className="h-4 w-96 bg-muted/30 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-32 bg-muted/50 rounded-md"></div>
              </CardHeader>
              <CardContent>
                <div className="h-12 w-24 bg-muted/30 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
