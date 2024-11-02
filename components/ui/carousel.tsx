"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";

interface CarouselProps {
  images: {
    url: string;
    alt: string;
  }[];
  className?: string;
}

export function Carousel({ images, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const previous = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  if (!images.length) return null;

  return (
    <Card className={cn("relative group", className)}>
      <div className="aspect-video relative overflow-hidden rounded-lg">
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          fill
          className="object-cover object-center"
          priority
        />

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="w-10 h-10 rounded-full"
            onClick={previous}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="w-10 h-10 rounded-full"
            onClick={next}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentIndex === index
                  ? "bg-primary w-4"
                  : "bg-primary/50 hover:bg-primary/75"
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
