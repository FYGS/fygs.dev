import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Target, TrendingUp } from "lucide-react";

export function AnalyticsCard() {
  return (
    <Card className="backdrop-blur-xl bg-background/80 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Performance Analytics</span>
        </CardTitle>
        <CardDescription>
          Detailed insights about your challenge performance and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Overall Performance
            </h3>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Success Rate</span>
                <span className="font-medium">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Average Efficiency</span>
                <span className="font-medium">82%</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Time Efficiency</span>
                <span className="font-medium">65%</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Challenge Completion
            </h3>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Arrays & Strings</span>
                <span className="font-medium">12/15</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">Trees & Graphs</span>
                <span className="font-medium">8/12</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm">System Design</span>
                <span className="font-medium">3/8</span>
              </div>
              <Progress value={38} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
