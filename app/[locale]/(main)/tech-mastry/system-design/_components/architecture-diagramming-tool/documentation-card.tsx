import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cloud,
  Database,
  FileText,
  HardDrive,
  Lock,
  Network,
  Server,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

export function DocumentationCard() {
  return (
  <Card className="backdrop-blur-xl bg-background/80 border-border/50">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <span>System Design Documentation</span>
      </CardTitle>
      <CardDescription>
        Learn about system design principles and best practices
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Scalability Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Server className="h-4 w-4" />
                Horizontal Scaling
              </h4>
              <p className="text-sm text-muted-foreground">
                Adding more machines to handle increased load. It usually scales further and tolerates failures better than vertical scaling, at the cost of added complexity (shared state, coordination, load balancing).
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                Database Sharding
              </h4>
              <p className="text-sm text-muted-foreground">
                Splitting a database into smaller, more manageable pieces distributed across multiple servers.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            Security Considerations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                Authentication & Authorization
              </h4>
              <p className="text-sm text-muted-foreground">
                Implement proper authentication mechanisms (OAuth, JWT) and authorization checks to protect resources.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Network className="h-4 w-4" />
                Rate Limiting
              </h4>
              <p className="text-sm text-muted-foreground">
                Prevent abuse by limiting the number of requests a user can make in a given timeframe.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Performance Optimization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4" />
                Caching Strategies
              </h4>
              <p className="text-sm text-muted-foreground">
                Use Redis/Memcached for frequently accessed data and implement proper cache invalidation.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Cloud className="h-4 w-4" />
                CDN Implementation
              </h4>
              <p className="text-sm text-muted-foreground">
                Distribute content geographically to reduce latency and improve user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
}
