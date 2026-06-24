"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  q: string;
  a: string;
}

interface CourseFaqProps {
  items: FaqItem[];
}

export function CourseFaq({ items }: CourseFaqProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-6">Questions fréquentes</h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
            <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
