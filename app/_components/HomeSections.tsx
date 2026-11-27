"use client";
import Link from "next/link";
import { ArrowUpRight, Ban } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { Section } from "./Section";
import { Button } from "@/components/ui/button";

const Heading = ({
  badge,
  title,
  intro,
}: {
  badge: string;
  title: string;
  intro?: string;
}) => (
  <div className="text-center space-y-4 mb-12">
    <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
      {badge}
    </span>
    <h2 className="text-3xl lg:text-5xl font-bold text-gradient-heading">
      {title}
    </h2>
    {intro ? (
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{intro}</p>
    ) : null}
  </div>
);

export const HomeMethod = () => {
  const { method } = useIntlayer("home");
  return (
    <Section className="py-16 lg:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        <Heading
          badge={method.badge.value}
          title={method.title.value}
          intro={method.intro.value}
        />
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {method.steps.map((step, i) => (
            <li
              key={i}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <span className="font-caption text-4xl font-bold text-primary/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
};

export const HomeProjects = () => {
  const { projects } = useIntlayer("home");
  return (
    <Section className="py-16 lg:py-24" >
      <div id="projects" className="container max-w-7xl mx-auto px-4 scroll-mt-24">
        <Heading badge={projects.badge.value} title={projects.title.value} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.items.map((item, i) => (
            <article
              key={i}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="mt-2 flex-1 text-muted-foreground">{item.text}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.stack.map((s) => (
                  <li
                    key={s.value}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {s.value}
                  </li>
                ))}
              </ul>
              {item.link.value ? (
                <Link
                  href={item.link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {projects.visit}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/projects">{projects.all}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
};

export const HomeWork = () => {
  const { work } = useIntlayer("home");
  return (
    <Section className="py-16 lg:py-24">
      <div className="container max-w-7xl mx-auto px-4">
        <Heading badge={work.badge.value} title={work.title.value} />
        <div className="grid gap-6 md:grid-cols-3">
          {work.formats.map((f, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-dashed p-6 text-center">
          <p className="font-semibold">{work.notTitle}</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-3">
            {work.notItems.map((n, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-2 text-muted-foreground"
              >
                <Ban className="h-4 w-4" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export const HomeAbout = () => {
  const { about } = useIntlayer("home");
  return (
    <Section className="py-16 lg:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <Heading badge={about.badge.value} title={about.title.value} />
        <p className="text-lg leading-relaxed text-muted-foreground text-center">
          {about.text}
        </p>
        <div className="mt-10">
          <h3 className="mb-6 text-center text-2xl font-semibold">
            {about.stackTitle}
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {about.stackGroups.map((group, gi) => (
              <div
                key={gi}
                className="rounded-2xl border bg-card p-5 shadow-sm"
              >
                <p className="mb-3 font-semibold">{group.title}</p>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item, ii) => (
                    <li
                      key={ii}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-muted-foreground">
            {about.stackNote}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="outline" asChild>
            <Link
              href="https://ouestech.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {about.ouestech}
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/formations">{about.formations}</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
};
