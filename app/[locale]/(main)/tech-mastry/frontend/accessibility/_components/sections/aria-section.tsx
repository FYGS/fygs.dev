"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions";

// Demo component for ARIA roles and attributes
function AriaRolesDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Dialog with ARIA</h3>

        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          Open Dialog
        </button>

        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 id="dialog-title" className="text-xl font-bold mb-2">
                Accessible Dialog
              </h2>
              <p id="dialog-description" className="text-muted-foreground mb-4">
                This dialog uses ARIA roles and attributes to ensure it&apos;s
                accessible to screen readers.
              </p>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">ARIA Live Regions</h3>

        <div className="space-y-2">
          <div
            aria-live="polite"
            aria-atomic="true"
            className="border p-2 rounded-md min-h-[50px]"
          >
            <p>
              This region will announce changes politely (when the user is
              idle).
            </p>
          </div>

          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={(e) => {
              const liveRegion = e.currentTarget.previousElementSibling;
              if (liveRegion) {
                liveRegion.textContent =
                  "Content updated at " + new Date().toLocaleTimeString();
              }
            }}
          >
            Update Content
          </button>
        </div>
      </div>
    </div>
  );
}

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

      <CodeExample
        title="ARIA Roles and Landmarks"
        description="Using ARIA roles to define the purpose of elements"
        code={`// Basic landmark roles
<header role="banner">
  <h1>Website Title</h1>
</header>

<nav role="navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main role="main">
  <article>
    <h2>Main Content</h2>
    <p>This is the main content of the page.</p>
  </article>

  <aside role="complementary">
    <h3>Related Information</h3>
    <p>Supplementary content related to the main content.</p>
  </aside>
</main>

<footer role="contentinfo">
  <p>&copy; 2023 Example Company</p>
</footer>

// Widget roles
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>

<div id="panel-1" role="tabpanel" aria-labelledby="tab-1">
  <p>Content for Tab 1</p>
</div>

<div id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>
  <p>Content for Tab 2</p>
</div>

// Document structure roles
<section role="region" aria-labelledby="region-title">
  <h2 id="region-title">Section Title</h2>
  <p>Content within this region.</p>
</section>

<ul role="list">
  <li role="listitem">Item 1</li>
  <li role="listitem">Item 2</li>
</ul>`}
        explanation={
          <div>
            <p>
              ARIA roles define what an element is or does. They help assistive
              technologies understand the purpose and structure of content when
              HTML semantics aren&apos;t sufficient.
            </p>

            <p className="mt-3">There are several categories of ARIA roles:</p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Landmark roles</strong>: Define regions of the page,
                helping users navigate between major sections.
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>banner</code>: The main header of the page
                  </li>
                  <li>
                    <code>navigation</code>: A collection of links for
                    navigation
                  </li>
                  <li>
                    <code>main</code>: The main content of the document
                  </li>
                  <li>
                    <code>complementary</code>: Supporting content for the main
                    content
                  </li>
                  <li>
                    <code>contentinfo</code>: Information about the parent
                    document (typically the footer)
                  </li>
                </ul>
              </li>
              <li>
                <strong>Widget roles</strong>: Define interactive elements that
                don&apos;t have HTML equivalents.
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>button</code>, <code>tab</code>, <code>tabpanel</code>
                    , <code>dialog</code>, <code>tooltip</code>, etc.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Document structure roles</strong>: Define the
                organizational structure of content.
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>article</code>, <code>list</code>,{" "}
                    <code>listitem</code>, <code>region</code>, etc.
                  </li>
                </ul>
              </li>
            </ol>

            <p className="mt-3">
              <strong>Important notes about ARIA roles:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Use semantic HTML elements whenever possible instead of adding
                ARIA roles to non-semantic elements.
              </li>
              <li>
                Many HTML5 elements have implicit ARIA roles (e.g.,{" "}
                <code>&lt;nav&gt;</code> has role=&quot;navigation&quot;).
              </li>
              <li>
                Don&apos;t override the implicit role of an element unless you
                have a very good reason.
              </li>
              <li>
                Some roles require specific child roles or supporting ARIA
                attributes.
              </li>
            </ul>

            <p className="mt-3">
              The first rule of ARIA is: don&apos;t use ARIA if you can use a
              native HTML element with the semantics and behavior you need.
            </p>
          </div>
        }
        tips={[
          "Use semantic HTML elements whenever possible instead of ARIA roles",
          "Test with screen readers to ensure your ARIA implementation works as expected",
          "Don't override the implicit role of an element unless necessary",
          "Ensure that elements with ARIA roles meet all the requirements of those roles",
        ]}
      />

      <CodeExample
        title="ARIA States and Properties"
        description="Using ARIA attributes to provide additional information about elements"
        code={`// Labeling and describing elements
<button aria-label="Close">X</button>

<div aria-labelledby="title">
  <h2 id="title">Section Title</h2>
  <p>Content related to the section title.</p>
</div>

<button aria-describedby="tooltip-1">Help</button>
<div id="tooltip-1" role="tooltip" hidden>
  Click for additional assistance
</div>

// Indicating states
<button aria-pressed="false">Toggle</button>
<div role="checkbox" aria-checked="true">Checked</div>
<input aria-invalid="true" />
<div aria-hidden="true">This content is hidden from screen readers</div>

// Relationships
<div role="listbox" aria-activedescendant="option-2">
  <div id="option-1" role="option">Option 1</div>
  <div id="option-2" role="option">Option 2</div>
  <div id="option-3" role="option">Option 3</div>
</div>

// Live regions
<div aria-live="polite" aria-atomic="true">
  <p>This content will be announced when it changes</p>
</div>

<div aria-live="assertive" aria-relevant="additions text">
  <p>This content will be announced immediately when it changes</p>
</div>`}
        demo={<AriaRolesDemo />}
        explanation={
          <div>
            <p>
              ARIA states and properties provide additional information about
              elements and their relationships. They help communicate the
              current state, behavior, and relationships of elements to
              assistive technologies.
            </p>

            <p className="mt-3">Key categories of ARIA attributes:</p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Labeling and Describing</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>aria-label</code>: Provides a text label for an
                    element
                  </li>
                  <li>
                    <code>aria-labelledby</code>: References another element
                    that serves as the label
                  </li>
                  <li>
                    <code>aria-describedby</code>: References another element
                    that provides a description
                  </li>
                </ul>
              </li>
              <li>
                <strong>States</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>aria-checked</code>: Indicates the checked state of
                    checkboxes, radio buttons, etc.
                  </li>
                  <li>
                    <code>aria-disabled</code>: Indicates that an element is
                    perceivable but disabled
                  </li>
                  <li>
                    <code>aria-expanded</code>: Indicates if a control is
                    expanded or collapsed
                  </li>
                  <li>
                    <code>aria-hidden</code>: Indicates if an element is exposed
                    to assistive technology
                  </li>
                  <li>
                    <code>aria-invalid</code>: Indicates that the value of an
                    input is invalid
                  </li>
                  <li>
                    <code>aria-pressed</code>: Indicates the pressed state of a
                    toggle button
                  </li>
                  <li>
                    <code>aria-selected</code>: Indicates the selected state of
                    an element
                  </li>
                </ul>
              </li>
              <li>
                <strong>Relationships</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>aria-activedescendant</code>: Identifies the currently
                    active element
                  </li>
                  <li>
                    <code>aria-controls</code>: Identifies the element(s)
                    controlled by the current element
                  </li>
                  <li>
                    <code>aria-owns</code>: Identifies element(s) that are owned
                    by the current element
                  </li>
                </ul>
              </li>
              <li>
                <strong>Live Regions</strong>
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>aria-live</code>: Indicates that an element will be
                    updated
                  </li>
                  <li>
                    <code>aria-atomic</code>: Indicates whether the entire
                    region should be announced
                  </li>
                  <li>
                    <code>aria-relevant</code>: Indicates what types of changes
                    should be announced
                  </li>
                </ul>
              </li>
            </ol>

            <p className="mt-3">
              <strong>Important notes about ARIA states and properties:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                ARIA attributes don&apos;t change the behavior or appearance of
                elements; they only communicate information to assistive
                technologies.
              </li>
              <li>
                You must update ARIA states dynamically as the user interacts
                with the page.
              </li>
              <li>
                Some ARIA attributes have HTML equivalents that should be used
                instead (e.g., use <code>disabled</code> instead of{" "}
                <code>aria-disabled</code> on form elements).
              </li>
              <li>
                Live regions should be used sparingly and thoughtfully to avoid
                overwhelming users.
              </li>
            </ul>
          </div>
        }
        tips={[
          "Keep ARIA attributes updated as the state of your application changes",
          "Use aria-live regions sparingly to avoid overwhelming users with announcements",
          "Combine ARIA with keyboard accessibility for a complete accessibility solution",
          "Test with multiple screen readers as ARIA support can vary between them",
        ]}
        interviewQuestions={[
          {
            question: "What is ARIA and when should you use it?",
            answer:
              "ARIA (Accessible Rich Internet Applications) is a set of attributes that enhance accessibility for people with disabilities by providing additional semantics to HTML elements. You should use ARIA when: 1) HTML semantics aren't sufficient to convey the purpose or state of an element. 2) You're creating custom widgets or complex UI components that don't have HTML equivalents. 3) Dynamic content changes need to be communicated to screen reader users. 4) Relationships between elements need to be explicitly defined. However, the first rule of ARIA is to not use it if native HTML elements can provide the semantics and behavior you need. Overusing ARIA or implementing it incorrectly can actually harm accessibility rather than improve it. Always prioritize semantic HTML, and use ARIA as a supplement, not a replacement.",
            difficulty: "medium",
            tags: ["Accessibility", "ARIA", "HTML"],
          },
          {
            question:
              "Explain the difference between aria-labelledby and aria-describedby.",
            answer:
              'aria-labelledby and aria-describedby both reference other elements to provide information about an element, but they serve different purposes: 1) aria-labelledby: Provides the primary accessible name for an element. It\'s equivalent to a label and should be concise. Screen readers typically announce this information immediately when focusing an element. Example: `<div id="heading">User Profile</div><section aria-labelledby="heading">...</section>` 2) aria-describedby: Provides additional descriptive information about an element. It supplements the accessible name with more details. Screen readers typically announce this after the label, and some may require a specific command to read it. Example: `<button aria-describedby="tooltip">Save</button><div id="tooltip">Saves your current progress</div>` Key differences: aria-labelledby is for essential, identifying information (what the element is), while aria-describedby is for supplementary information (what the element does or additional context). Both can reference multiple elements by providing a space-separated list of IDs, and both take precedence over their counterparts (aria-label and native content) in the accessibility tree.',
            difficulty: "medium",
            tags: ["Accessibility", "ARIA", "Screen Readers"],
          },
        ]}
      />

      <CodeExample
        title="ARIA Live Regions"
        description="Making dynamic content changes accessible to screen readers"
        code={`// Basic live region
<div aria-live="polite">
  <p>This content will be announced when it changes</p>
</div>

// Live region with atomic property
<div aria-live="polite" aria-atomic="true">
  <p>The entire region will be announced when any part changes</p>
</div>

// Live region with relevant property
<div aria-live="polite" aria-relevant="additions text">
  <p>Only additions and text changes will be announced</p>
</div>

// Assertive live region for important updates
<div aria-live="assertive" aria-atomic="true">
  <p>This will interrupt the user to announce important information</p>
</div>

// Common use case: Form validation errors
<form>
  <label for="username">Username:</label>
  <input id="username" type="text" aria-describedby="username-error" />
  <div id="username-error" aria-live="assertive" role="alert"></div>

  <script>
    function validateUsername() {
      const input = document.getElementById('username');
      const error = document.getElementById('username-error');

      if (input.value.length < 3) {
        error.textContent = 'Username must be at least 3 characters long';
      } else {
        error.textContent = '';
      }
    }
  </script>
</form>

// Status messages
<div aria-live="polite" role="status">
  <p>Your changes have been saved</p>
</div>

// Alert messages
<div role="alert">
  <p>Your session will expire in 2 minutes</p>
</div>`}
        explanation={
          <div>
            <p>
              ARIA live regions allow developers to mark sections of the page
              that will be updated dynamically, ensuring that these updates are
              announced to screen reader users.
            </p>

            <p className="mt-3">Key attributes for live regions:</p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>aria-live</strong>: Indicates the verbosity level of
                updates
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>off</code> (default): Updates won&apos;t be announced
                  </li>
                  <li>
                    <code>polite</code>: Updates will be announced when the user
                    is idle
                  </li>
                  <li>
                    <code>assertive</code>: Updates will be announced
                    immediately, potentially interrupting the user
                  </li>
                </ul>
              </li>
              <li>
                <strong>aria-atomic</strong>: Indicates whether the entire
                region should be announced
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>false</code> (default): Only the changed parts will be
                    announced
                  </li>
                  <li>
                    <code>true</code>: The entire region will be announced when
                    any part changes
                  </li>
                </ul>
              </li>
              <li>
                <strong>aria-relevant</strong>: Indicates what types of changes
                should be announced
                <ul className="list-disc pl-6 mt-1">
                  <li>
                    <code>additions</code>: Announce when elements are added
                  </li>
                  <li>
                    <code>removals</code>: Announce when elements are removed
                  </li>
                  <li>
                    <code>text</code>: Announce when text changes
                  </li>
                  <li>
                    <code>all</code>: Announce all changes
                  </li>
                </ul>
              </li>
            </ol>

            <p className="mt-3">
              <strong>Common live region roles:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <code>role=&quot;status&quot;</code>: A non-critical update
                (implicit <code>aria-live=&quot;polite&quot;</code>)
              </li>
              <li>
                <code>role=&quot;alert&quot;</code>: An important,
                time-sensitive message (implicit{" "}
                <code>aria-live=&quot;assertive&quot;</code>)
              </li>
              <li>
                <code>role=&quot;log&quot;</code>: A log of messages where new
                information is added at the end (implicit{" "}
                <code>aria-live=&quot;polite&quot;</code>)
              </li>
              <li>
                <code>role=&quot;progressbar&quot;</code>: An element that
                displays the progress of a task
              </li>
              <li>
                <code>role=&quot;timer&quot;</code>: A countdown timer or
                stopwatch
              </li>
            </ul>

            <p className="mt-3">
              <strong>Best practices for live regions:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Use live regions sparingly to avoid overwhelming users with
                announcements.
              </li>
              <li>
                Set up live regions before they are needed, as some screen
                readers only recognize regions that were present when the page
                loaded.
              </li>
              <li>
                Use <code>aria-live=&quot;assertive&quot;</code> only for
                critical information that requires immediate attention.
              </li>
              <li>Keep live region announcements concise and meaningful.</li>
              <li>
                Test with actual screen readers to ensure your live regions work
                as expected.
              </li>
            </ul>
          </div>
        }
        tips={[
          "Set up live regions before they are needed, as some screen readers only recognize regions that were present when the page loaded",
          "Use aria-live='assertive' sparingly, only for critical information that requires immediate attention",
          "Keep live region announcements concise and meaningful",
          "Consider using role='status' or role='alert' instead of aria-live directly",
        ]}
      />

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
              'To make a custom dropdown accessible with ARIA: 1) Structure: `<div role="combobox" aria-expanded="false" aria-controls="dropdown-list" aria-haspopup="listbox"> <button>Select an option</button> <ul id="dropdown-list" role="listbox" aria-labelledby="dropdown-label" hidden> <li role="option" id="option1" aria-selected="false">Option 1</li> <li role="option" id="option2" aria-selected="false">Option 2</li> </ul> </div>` 2) Keyboard support: Implement arrow key navigation between options, Enter/Space to select, and Escape to close the dropdown. 3) State management: Update aria-expanded when opening/closing, aria-selected when selecting options, and aria-activedescendant to indicate the focused option. 4) Focus management: Trap focus within the dropdown when open and restore focus when closed. 5) Dynamic updates: When an option is selected, update the button text and close the dropdown. 6) Additional considerations: Add aria-disabled="true" for disabled options, ensure sufficient color contrast, and provide visible focus indicators. 7) Testing: Verify functionality with keyboard-only navigation and screen readers. This implementation combines proper ARIA attributes with keyboard interaction patterns to create an accessible custom dropdown that works similarly to a native select element.',
            difficulty: "hard",
            tags: ["Accessibility", "ARIA", "Implementation"],
          },
          {
            question:
              "What are common mistakes developers make when implementing ARIA?",
            answer:
              'Common ARIA implementation mistakes: 1) Using ARIA when native HTML would suffice: Adding unnecessary ARIA to elements that already have semantic meaning. 2) Not updating ARIA states dynamically: Setting aria-expanded="false" but not changing it when the element expands. 3) Incorrect role usage: Using roles that don\'t match the element\'s behavior or using conflicting roles. 4) Missing required attributes: Not providing required attributes for certain roles (e.g., aria-controls with role="combobox"). 5) Orphaned ARIA references: Using aria-labelledby or aria-describedby with IDs that don\'t exist. 6) Overriding implicit roles inappropriately: Adding role="button" to an <a> tag without proper keyboard support. 7) Improper nesting of roles: Placing elements with certain roles inside elements where they\'re not allowed. 8) Redundant ARIA: Adding aria-hidden="false" (the default) or duplicating information. 9) Inaccessible names: Using aria-label with empty strings or using aria-labelledby pointing to hidden elements. 10) No keyboard support: Adding ARIA without implementing the expected keyboard interactions. 11) Overusing aria-live: Creating too many live regions that overwhelm screen reader users. 12) Not testing with actual assistive technologies: Assuming ARIA works as expected without verification.',
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
