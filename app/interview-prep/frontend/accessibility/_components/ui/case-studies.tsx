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
        <Tabs defaultValue="github">
          <TabsList className="mb-4">
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="bbc">BBC</TabsTrigger>
            <TabsTrigger value="apple">Apple</TabsTrigger>
            <TabsTrigger value="gov">GOV.UK</TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <h3 className="text-lg font-semibold">
              GitHub&apos;s Screen Reader Accessibility
            </h3>
            <p>
              GitHub has made significant improvements to their platform&apos;s
              accessibility, particularly for screen reader users. Their
              approach includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Semantic HTML Structure</strong>: GitHub uses proper
                heading hierarchy and landmark regions throughout their
                interface, making it easier for screen reader users to navigate.
              </li>
              <li>
                <strong>Accessible Components</strong>: Custom components like
                the file tree, pull request interface, and code editor have been
                optimized for screen reader access with appropriate ARIA
                attributes.
              </li>
              <li>
                <strong>Keyboard Navigation</strong>: All functionality is
                accessible via keyboard, with visible focus indicators and
                logical tab order.
              </li>
              <li>
                <strong>Alternative Text</strong>: Images, including repository
                graphs and user avatars, have descriptive alternative text.
              </li>
              <li>
                <strong>Skip Links</strong>: GitHub provides skip links to help
                users bypass navigation and jump directly to main content.
              </li>
            </ul>
            <p className="mt-4">
              <strong>Results</strong>: GitHub&apos;s accessibility improvements
              have made the platform more inclusive for developers with visual
              impairments, allowing them to contribute to open source projects
              and collaborate effectively with teams.
            </p>
          </TabsContent>

          <TabsContent value="bbc" className="space-y-4">
            <h3 className="text-lg font-semibold">
              BBC&apos;s Screen Reader Accessibility
            </h3>
            <p>
              The BBC has been a leader in digital accessibility, with a strong
              focus on making their content accessible to screen reader users:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Accessible Media Player</strong>: BBC&apos;s custom
                media player includes audio descriptions, transcripts, and
                keyboard controls that work well with screen readers.
              </li>
              <li>
                <strong>Clear Document Structure</strong>: Their content follows
                a logical heading structure and uses proper semantic elements to
                organize information.
              </li>
              <li>
                <strong>Live Region Announcements</strong>: For dynamic content
                like news updates, BBC uses ARIA live regions to ensure screen
                readers announce new content.
              </li>
              <li>
                <strong>Alternative Text Guidelines</strong>: BBC has developed
                detailed guidelines for writing effective alternative text for
                different types of images.
              </li>
              <li>
                <strong>Accessibility Testing</strong>: They conduct regular
                testing with users who rely on screen readers to identify and
                address issues.
              </li>
            </ul>
            <p className="mt-4">
              <strong>Results</strong>: BBC&apos;s commitment to accessibility
              has made their news, entertainment, and educational content
              available to millions of users with visual impairments, setting a
              high standard for media organizations worldwide.
            </p>
          </TabsContent>

          <TabsContent value="apple" className="space-y-4">
            <h3 className="text-lg font-semibold">
              Apple&apos;s VoiceOver Integration
            </h3>
            <p>
              Apple has integrated VoiceOver, their screen reader technology,
              deeply into their ecosystem, making their websites and products
              highly accessible:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Consistent Navigation</strong>: Apple&apos;s website
                maintains consistent navigation patterns and landmark regions
                across all pages, making it predictable for screen reader users.
              </li>
              <li>
                <strong>Product Showcase Accessibility</strong>: Product images
                include detailed alternative text that describes visual
                features, and interactive 3D models have accessible
                alternatives.
              </li>
              <li>
                <strong>Accessible Documentation</strong>: Apple&apos;s support
                documentation and user guides are structured with proper
                headings and semantic markup for easy navigation.
              </li>
              <li>
                <strong>Accessible Store Experience</strong>: The online Apple
                Store includes accessible forms, product comparisons, and
                checkout processes optimized for screen readers.
              </li>
              <li>
                <strong>Developer Resources</strong>: Apple provides extensive
                documentation and tools for developers to make their apps
                accessible to VoiceOver users.
              </li>
            </ul>
            <p className="mt-4">
              <strong>Results</strong>: Apple&apos;s focus on accessibility has
              created a seamless experience for VoiceOver users across their
              digital platforms, allowing users with visual impairments to
              research, purchase, and use Apple products independently.
            </p>
          </TabsContent>

          <TabsContent value="gov" className="space-y-4">
            <h3 className="text-lg font-semibold">
              GOV.UK&apos;s Accessibility Approach
            </h3>
            <p>
              The UK government&apos;s digital services platform, GOV.UK, has
              prioritized accessibility from its inception, with particular
              attention to screen reader compatibility:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Simple, Semantic HTML</strong>: GOV.UK uses clean,
                semantic HTML with minimal JavaScript, making their pages highly
                compatible with all screen readers.
              </li>
              <li>
                <strong>Progressive Enhancement</strong>: Core functionality
                works without JavaScript, ensuring that screen reader users can
                access essential services even if scripts fail.
              </li>
              <li>
                <strong>Form Accessibility</strong>: Government forms include
                clear labels, error messages, and instructions that are properly
                associated with form controls for screen reader users.
              </li>
              <li>
                <strong>PDF Accessibility</strong>: GOV.UK provides accessible
                HTML alternatives to PDF documents, or ensures PDFs are properly
                tagged for screen reader access.
              </li>
              <li>
                <strong>Accessibility Statement</strong>: Each service includes
                a detailed accessibility statement that outlines known issues
                and provides alternative ways to access services.
              </li>
            </ul>
            <p className="mt-4">
              <strong>Results</strong>: GOV.UK&apos;s approach has made
              government services accessible to all citizens, including those
              who rely on screen readers, setting a standard for public sector
              websites worldwide.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
