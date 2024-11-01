import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";
import { SendIcon } from "lucide-react";

export const Newsletter = () => {
  return (
    <Section>
      <Card className="p-8 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold">Stay Updated</h2>
          <p className="text-muted-foreground">
            Subscribe to my newsletter for the latest insights on software
            engineering, cloud architecture, and web development best practices.
          </p>
          <form className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button type="submit">
              <SendIcon className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </form>
        </div>
      </Card>
    </Section>
  );
};
