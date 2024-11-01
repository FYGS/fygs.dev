import { Card } from "@/components/ui/card";
import { QuoteIcon } from "lucide-react";
import Image from "next/image";

interface TestimonialProps {
  text: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

export const Testimonial = ({
  text,
  author,
  role,
  company,
  image,
}: TestimonialProps) => {
  return (
    <Card className="p-6 relative">
      <QuoteIcon
        size={48}
        className="absolute -top-4 -left-4 text-primary/10"
      />
      <div className="space-y-4">
        <p className="text-muted-foreground italic relative z-10">
          &ldquo;{text}&rdquo;
        </p>
        <div className="flex items-center gap-4">
          <Image
            src={image}
            alt={author}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-muted-foreground">
              {role} at {company}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
