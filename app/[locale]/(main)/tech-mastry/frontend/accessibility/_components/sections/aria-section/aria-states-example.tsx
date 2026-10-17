import { CodeExample } from "../../ui/code-example";
import { AriaRolesDemo } from "./aria-roles-demo";

export function AriaStatesExample() {
  return (
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
  );
}
