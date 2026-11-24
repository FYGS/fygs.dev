"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CaseStudiesProps {
  title: string;
  description?: string;
}

export function CaseStudies({ title, description }: CaseStudiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          These organizations publish their accessibility guidance, design
          systems or standards. The summaries below describe general, publicly
          documented practices, not audit results: check each organization&apos;s
          own documentation for current details.
        </p>
        <Tabs defaultValue="github">
          <TabsList className="mb-4">
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="bbc">BBC</TabsTrigger>
            <TabsTrigger value="apple">Apple</TabsTrigger>
            <TabsTrigger value="gov">GOV.UK</TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <h3 className="text-lg font-semibold">
              GitHub: accessibility in a design system
            </h3>
            <p>
              GitHub documents accessibility guidance for its Primer design
              system and publishes articles about the accessibility work done
              on its interface. The general lessons for screen reader support
              are:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Build accessibility into shared components</strong>: a
                fix in a design system component benefits every page that uses
                it.
              </li>
              <li>
                <strong>Document keyboard and ARIA patterns</strong>: complex
                widgets such as menus, dialogs or trees need documented
                keyboard interactions and roles.
              </li>
              <li>
                <strong>Test with assistive technologies</strong>: automated
                checks catch only part of the issues, manual testing with
                screen readers and keyboard completes them.
              </li>
            </ul>
          </TabsContent>

          <TabsContent value="bbc" className="space-y-4">
            <h3 className="text-lg font-semibold">
              BBC: public accessibility guidelines
            </h3>
            <p>
              The BBC publishes public accessibility guidelines for its
              digital products (including its Global Experience Language
              design guidance). The general lessons are:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Write guidelines teams can apply</strong>: concrete
                guidance per component type (media, forms, navigation) is
                easier to follow than a copy of the standard.
              </li>
              <li>
                <strong>Plan for media</strong>: video and audio need captions,
                transcripts and keyboard-operable controls.
              </li>
              <li>
                <strong>Announce dynamic updates carefully</strong>: ARIA live
                regions can keep screen reader users informed, but overuse
                becomes noise.
              </li>
            </ul>
          </TabsContent>

          <TabsContent value="apple" className="space-y-4">
            <h3 className="text-lg font-semibold">
              Apple: VoiceOver and platform guidance
            </h3>
            <p>
              VoiceOver is the screen reader built into Apple platforms, and
              Apple publishes accessibility guidance for developers (for
              example in its Human Interface Guidelines). The general lessons
              are:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Rely on platform semantics</strong>: native controls and
                accessibility APIs expose names, roles and states to assistive
                technologies.
              </li>
              <li>
                <strong>Give every control an accessible name</strong>: images
                and icon buttons need a text alternative or label.
              </li>
              <li>
                <strong>Support user settings</strong>: text size, reduced
                motion and contrast preferences should be respected.
              </li>
            </ul>
          </TabsContent>

          <TabsContent value="gov" className="space-y-4">
            <h3 className="text-lg font-semibold">
              GOV.UK: accessibility as a service standard
            </h3>
            <p>
              The UK government publishes the GOV.UK Design System and a
              Service Manual with accessibility guidance, and UK public sector
              websites must meet WCAG at level AA and publish an accessibility
              statement. The general lessons are:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Simple, semantic HTML</strong>: start from native
                elements and add JavaScript as an enhancement.
              </li>
              <li>
                <strong>Progressive enhancement</strong>: the Service Manual
                recommends that core journeys keep working if scripts fail.
              </li>
              <li>
                <strong>Accessible forms</strong>: visible labels, hints and
                error messages programmatically associated with their fields,
                plus an error summary.
              </li>
              <li>
                <strong>Accessibility statement</strong>: state known issues
                and offer an alternative way to get the service.
              </li>
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
