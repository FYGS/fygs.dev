"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InterviewQuestions } from "../ui/interview-questions";
import { CaseStudies } from "../ui/case-studies";
import { InteractiveDemo } from "../ui/interactive-demo";
import {
  ariaLiveDemo,
  formAccessibilityDemo,
  headingStructureDemo,
  renderAriaLiveDemo,
} from "./screen-readers/demos";
import { DocumentStructureExample } from "./screen-readers/document-structure-example";
import { ImagesAltExample } from "./screen-readers/images-alt-example";
import { SemanticHtmlExample } from "./screen-readers/semantic-html-example";

export function ScreenReadersSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Screen Readers</CardTitle>
          <CardDescription>
            Optimizing content for users who rely on screen readers to access
            digital information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Screen readers are assistive technologies that convert digital text
            into synthesized speech or braille output. Ensuring your content
            works well with screen readers is crucial for users with visual
            impairments or reading disabilities.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Semantic HTML</Badge>
            <Badge>Alt Text</Badge>
            <Badge>Heading Structure</Badge>
            <Badge>Testing</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add Interactive Demos */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Screen Reader Examples</CardTitle>
          <CardDescription>
            Try these examples with a screen reader to understand accessibility
            principles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <InteractiveDemo
            initialCode={headingStructureDemo}
            renderDemo={(code, container) => {
              container.innerHTML = code;
            }}
            height="400px"
          />

          <InteractiveDemo
            initialCode={ariaLiveDemo}
            renderDemo={renderAriaLiveDemo}
            height="200px"
          />

          <InteractiveDemo
            initialCode={formAccessibilityDemo}
            renderDemo={(code, container) => {
              container.innerHTML = code;
            }}
            height="400px"
          />
        </CardContent>
      </Card>

      <SemanticHtmlExample />

      <ImagesAltExample />

      <DocumentStructureExample />

      <CaseStudies
        title="Screen Reader Accessibility Case Studies"
        description="Real-world examples of companies implementing effective screen reader accessibility"
      />

      <InterviewQuestions
        title="Screen Reader Accessibility Interview Questions"
        questions={[
          {
            question:
              "What are the key differences between popular screen readers and how do they affect development?",
            answer:
              "Key differences between popular screen readers: 1) JAWS (Windows): Most widely used in professional environments, has extensive keyboard shortcuts, best support for legacy content, requires commercial license. 2) NVDA (Windows): Free and open-source, growing in popularity, good support for modern web standards, frequent updates. 3) VoiceOver (macOS/iOS): Built into Apple products, well-integrated with Safari, different keyboard shortcuts than Windows screen readers. 4) TalkBack (Android): Touch-based interaction model rather than keyboard shortcuts, designed for mobile interfaces. 5) Narrator (Windows): Built into Windows, improved significantly in recent versions, less commonly used than JAWS or NVDA. Development implications: 1) Browser compatibility: Screen readers work best with specific browsers (JAWS/NVDA with Chrome/Firefox, VoiceOver with Safari). 2) Announcement differences: Screen readers may announce the same content differently. 3) ARIA support: Implementation of ARIA attributes varies between screen readers. 4) Testing requirements: Test with multiple screen reader/browser combinations. 5) Keyboard shortcuts: Different screen readers use different keyboard commands. 6) Mobile considerations: Mobile screen readers use touch gestures rather than keyboard shortcuts. 7) Update frequency: Some screen readers update more frequently than others, affecting support for new features. 8) Default verbosity: Screen readers have different default verbosity levels. Best practice is to develop according to standards (semantic HTML, WCAG, WAI-ARIA) rather than targeting specific screen readers, and then test with multiple screen readers to catch inconsistencies.",
            difficulty: "medium",
            tags: ["Accessibility", "Screen Readers", "Technical Knowledge"],
          },
          {
            question:
              "How would you make a custom JavaScript component accessible to screen reader users?",
            answer:
              'Making custom JavaScript components screen reader accessible: 1) Use appropriate semantic HTML as a foundation whenever possible. 2) Add ARIA roles to define the component type (e.g., role="tablist", role="menu"). 3) Manage focus appropriately: ensure keyboard focus moves logically and is trapped within modal dialogs. 4) Implement keyboard interaction patterns that match native equivalents (e.g., arrow keys for navigation within components). 5) Use ARIA states and properties to communicate component state (aria-expanded, aria-selected, aria-checked). 6) Ensure proper labeling with aria-label or aria-labelledby. 7) Group related elements with aria-controls or aria-owns. 8) Announce dynamic changes with aria-live regions. 9) Maintain visible focus indicators. 10) Test with actual screen readers and keyboard-only navigation. 11) Follow WAI-ARIA Authoring Practices for design patterns and keyboard interactions. 12) Ensure sufficient color contrast and text size. 13) Provide text alternatives for any visual information. 14) Document the accessibility features and keyboard shortcuts. Implementation example for a custom dropdown: `&lt;div role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-labelledby="dropdown-label"&gt; &lt;span id="dropdown-label"&gt;Select an option&lt;/span&gt; &lt;button aria-haspopup="listbox" aria-labelledby="dropdown-label"&gt;Choose...&lt;/button&gt; &lt;ul role="listbox" hidden&gt; &lt;li role="option" aria-selected="false"&gt;Option 1&lt;/li&gt; &lt;li role="option" aria-selected="false"&gt;Option 2&lt;/li&gt; &lt;/ul&gt; &lt;/div&gt;` with appropriate keyboard event handlers for arrow navigation, Enter selection, and Escape to close.',
            difficulty: "hard",
            tags: ["Accessibility", "JavaScript", "ARIA", "Implementation"],
          },
          {
            question:
              "What considerations should be made for screen reader users when implementing forms?",
            answer:
              'Form accessibility considerations for screen readers: 1) Proper labeling: Use &lt;label&gt; elements properly associated with inputs via \'for\' attribute matching input \'id\'. 2) Grouping related fields: Use &lt;fieldset&gt; and &lt;legend&gt; to group related form controls. 3) Error handling: Provide clear error messages that are programmatically associated with inputs using aria-describedby. 4) Required fields: Mark required fields with both visual indicators and aria-required="true". 5) Input purpose: Use autocomplete attributes to indicate the expected input format. 6) Form instructions: Place instructions before the form and associate specific instructions with relevant fields. 7) Validation timing: Validate on submit and also on blur-sm when appropriate. 8) Error summary: Provide a summary of errors at the top of the form with links to each field. 9) Custom controls: Ensure custom form controls have proper roles, states, and keyboard support. 10) Focus management: Move focus to the first error when validation fails. 11) Clear button labels: Use descriptive text for buttons (e.g., "Submit Application" instead of just "Submit"). 12) Logical tab order: Ensure the tab order follows the visual layout. 13) Input masks and formatting: Announce format requirements before users start typing. 14) Complex inputs: Provide clear instructions for complex inputs like date pickers or sliders. 15) Success feedback: Clearly communicate when a form has been successfully submitted. These considerations ensure that screen reader users can understand, navigate, complete, and submit forms independently.',
            difficulty: "medium",
            tags: ["Accessibility", "Forms", "UX Design"],
          },
        ]}
      />
    </div>
  );
}
