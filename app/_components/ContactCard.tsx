import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const ContactCard = ({
  image,
  mediumImage,
  name,
  description,
  url,
  className,
}: {
  image: string;
  mediumImage: string;
  name: string;
  description: string;
  url: string;
  className?: string;
}) => {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("w-full", className)}
    >
      <Card className="p-3 bg-accent/10 hover:bg-accent/30 transition-colors group flex items-center gap-4">
        <div className="relative size-10">
          <Image
            src={image}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-contain"
          />
          <Image
            src={mediumImage}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="size-4 absolute -bottom-1 -right-1 rounded-full object-contain"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">{name}</p>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowUpRight
          className="group-hover:translate-x-2 mr-4 group-hover:-translate-y-2 transition-transform"
          size={16}
        />
      </Card>
    </Link>
  );
};
