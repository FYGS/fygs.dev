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
import { AriaRolesExample } from "./aria-section/aria-roles-example";
import { AriaStatesExample } from "./aria-section/aria-states-example";
import { AriaLiveRegionsExample } from "./aria-section/aria-live-regions-example";

export function AriaSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>ARIA (Accessible Rich Internet Applications)</CardTitle>
          <CardDescription>
            A set of attributes that define ways to make web content and
            applications more accessible to people with disabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            ARIA supplements HTML to provide additional semantics for assistive
            technologies like screen readers. It helps bridge the gap between
            complex web applications and accessibility needs.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>ARIA Roles</Badge>
            <Badge>ARIA States</Badge>
            <Badge>ARIA Properties</Badge>
            <Badge>Live Regions</Badge>
          </div>
        </CardContent>
      </Card>

      <AriaRolesExample />

      <AriaStatesExample />

      <AriaLiveRegionsExample />

      <InterviewQuestions
        title="ARIA Interview Questions"
        questions={[
          {
            question:
              "What are the five most important ARIA attributes every developer should know?",
            answer:
              'The five most important ARIA attributes every developer should know are: 1) aria-label: Provides a text label for elements that don\'t have visible text, like a button with only an icon. Example: `<button aria-label="Close">×</button>`. 2) aria-labelledby: References another element that serves as the label, useful when the label is visible but not programmatically associated. Example: `<div id="title">User Profile</div><section aria-labelledby="title">...</section>`. 3) aria-live: Marks regions that will update dynamically, ensuring screen readers announce changes. Example: `<div aria-live="polite">Status: Saving...</div>`. 4) aria-expanded: Indicates whether a collapsible element is expanded or collapsed. Example: `<button aria-expanded="false">Show Details</button>`. 5) aria-hidden: Hides elements from assistive technologies while keeping them visually present. Example: `<div aria-hidden="true">...</div>`. These attributes address the most common accessibility challenges: providing proper labels, handling dynamic content, communicating state changes, and controlling what\'s exposed to assistive technologies.',
            difficulty: "medium",
            tags: ["Accessibility", "ARIA", "Best Practices"],
          },
          {
            question:
              "How would you make a custom dropdown accessible using ARIA?",
            answer:
              'To make a custom dropdown accessible with ARIA: 1) Structure: `<button role="combobox" aria-expanded="false" aria-controls="dropdown-list" aria-haspopup="listbox" aria-labelledby="dropdown-label">Select an option</button> <ul id="dropdown-list" role="listbox" aria-labelledby="dropdown-label" hidden> <li role="option" id="option1" aria-selected="false">Option 1</li> <li role="option" id="option2" aria-selected="false">Option 2</li> </ul>` (the combobox role goes on the focusable element, not on a wrapper) 2) Keyboard support: Implement arrow key navigation between options, Enter/Space to select, and Escape to close the dropdown. 3) State management: Update aria-expanded when opening/closing, aria-selected when selecting options, and aria-activedescendant to indicate the focused option. 4) Focus management: Keep DOM focus on the combobox and point to the highlighted option with aria-activedescendant (or move focus into the list), do not trap focus, and restore focus to the combobox when the list closes. 5) Dynamic updates: When an option is selected, update the button text and close the dropdown. 6) Additional considerations: Add aria-disabled="true" for disabled options, ensure sufficient color contrast, and provide visible focus indicators. 7) Testing: Verify functionality with keyboard-only navigation and screen readers. This implementation combines proper ARIA attributes with keyboard interaction patterns to create an accessible custom dropdown that works similarly to a native select element.',
            difficulty: "hard",
            tags: ["Accessibility", "ARIA", "Implementation"],
          },
          {
            question:
              "What are common mistakes developers make when implementing ARIA?",
            answer:
              'Common ARIA implementation mistakes: 1) Using ARIA when native HTML would suffice: Adding unnecessary ARIA to elements that already have semantic meaning. 2) Not updating ARIA states dynamically: Setting aria-expanded="false" but not changing it when the element expands. 3) Incorrect role usage: Using roles that don\'t match the element\'s behavior or using conflicting roles. 4) Missing required attributes: Not providing required attributes for certain roles (e.g., aria-controls with role="combobox"). 5) Orphaned ARIA references: Using aria-labelledby or aria-describedby with IDs that don\'t exist. 6) Overriding implicit roles inappropriately: Adding role="button" to an <a> tag without proper keyboard support. 7) Improper nesting of roles: Placing elements with certain roles inside elements where they\'re not allowed. 8) Redundant ARIA: Adding aria-hidden="false" (the default) or duplicating information. 9) Inaccessible names: Using aria-label with empty strings or leaving interactive elements (icon buttons, inputs) with no accessible name at all. 10) No keyboard support: Adding ARIA without implementing the expected keyboard interactions. 11) Overusing aria-live: Creating too many live regions that overwhelm screen reader users. 12) Not testing with actual assistive technologies: Assuming ARIA works as expected without verification.',
            difficulty: "medium",
            tags: ["Accessibility", "ARIA", "Anti-patterns"],
          },
          {
            question:
              "How do you decide between using a native HTML element and a custom element with ARIA?",
            answer:
              'Decision process between native HTML and custom elements with ARIA: 1) Always start with native HTML: Native elements have built-in semantics, keyboard support, and browser consistency. Example: Use <button> instead of <div role="button">. 2) Evaluate if native elements meet your needs: Consider if a native element provides the functionality, semantics, and styling capabilities required. 3) Use native elements with enhancements: If a native element is close but needs additional semantics, use the native element and enhance it with ARIA. Example: <button aria-haspopup="true">. 4) Consider composition of native elements: Before creating custom widgets, try combining native elements. Example: Use <input>, <datalist>, and JavaScript instead of a custom combobox. 5) Custom elements as a last resort: Only create custom elements with ARIA when native elements cannot provide the required functionality or user experience. 6) When using custom elements: Implement all expected keyboard interactions, manage focus appropriately, and test thoroughly with assistive technologies. 7) Document your decision: If choosing a custom implementation, document why native elements weren\'t sufficient to help future maintainers understand the rationale. The first rule of ARIA is: "Don\'t use ARIA if you can use a native HTML element with the semantics and behavior you need."',
            difficulty: "hard",
            tags: ["Accessibility", "ARIA", "HTML", "Decision Making"],
          },
        ]}
      />
    </div>
  );
}
