import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Collaborative Coding | TechMastery",
  description:
    "Code together in real-time with your peers, practice pair programming, and prepare for technical interviews collaboratively",
};

export default function CollaborationPage() {
  return (
    <main className="container py-8 space-y-12 animate-fadeIn">
      <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <Users className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Collaborative Coding</h1>
        <p className="text-muted-foreground max-w-md">
          Real-time collaborative coding is coming soon. Stay tuned for pair
          programming, live interviews, and shared editing sessions.
        </p>
      </Card>
    </main>
  );
}
