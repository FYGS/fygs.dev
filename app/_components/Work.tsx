import { Badge } from "@/components/ui/badge";
import { useIntlayer } from "next-intlayer";
import Image from "next/image";
import Link from "next/link";

export interface WorkProps {
  image: string;
  title: string;
  role: string;
  date: string;
  url: string;
  freelance?: boolean;
}

export const Work = ({
  image,
  title,
  role,
  date,
  url,
  freelance,
}: WorkProps) => {
  const content = useIntlayer("work");

  return (
    <Link
      href={url}
      className="inline-flex items-center gap-4 hover:bg-accent/50 transition-colors p-1 rounded"
      target="_blank"
    >
      <Image
        src={image}
        alt={title}
        width={32}
        height={32}
        className="size-10 object-contain rounded-md"
      />
      <div className="mr-auto">
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold">{title}</p>
          {freelance && (
            <Badge variant="outline" className="">
              {content.freelance}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
      <p className="text-xs text-end text-muted-foreground">{date}</p>
    </Link>
  );
};
