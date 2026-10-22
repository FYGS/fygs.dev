import { CodeExample } from "../../ui/code-example";

export function DocumentStructureExample() {
  return (
      <CodeExample
        title="Document Structure and Navigation"
        description="Creating a logical structure that's easy to navigate with screen readers"
        code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessible Document Structure</title>
</head>
<body>
  <!-- Skip link for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <h1>Company Name</h1>
    <nav aria-label="Main Navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <!-- Proper heading hierarchy -->
    <h2>Welcome to Our Website</h2>
    <p>Introduction text goes here.</p>

    <section aria-labelledby="products-heading">
      <h3 id="products-heading">Our Products</h3>
      <p>Product information goes here.</p>

      <article>
        <h4>Product 1</h4>
        <p>Details about product 1.</p>
      </article>

      <article>
        <h4>Product 2</h4>
        <p>Details about product 2.</p>
      </article>
    </section>

    <section aria-labelledby="services-heading">
      <h3 id="services-heading">Our Services</h3>
      <p>Service information goes here.</p>

      <article>
        <h4>Service 1</h4>
        <p>Details about service 1.</p>
      </article>

      <article>
        <h4>Service 2</h4>
        <p>Details about service 2.</p>
      </article>
    </section>
  </main>

  <aside aria-labelledby="related-heading">
    <h3 id="related-heading">Related Information</h3>
    <ul>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/resources">Resources</a></li>
    </ul>
  </aside>

  <footer>
    <h3>Contact Us</h3>
    <address>
      <p>123 Main Street, Anytown, USA</p>
      <p><a href="tel:+15551234567">555-123-4567</a></p>
      <p><a href="mailto:info@example.com">info@example.com</a></p>
    </address>

    <nav aria-label="Footer Navigation">
      <ul>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/terms">Terms of Service</a></li>
      </ul>
    </nav>
  </footer>
</body>
</html>`}
        explanation={
          <div>
            <p>
              Document structure is crucial for screen reader users to navigate
              and understand web content efficiently. A well-structured document
              allows users to jump between sections, understand the hierarchy of
              information, and build a mental model of the page.
            </p>

            <p className="mt-3">
              <strong>Key elements of accessible document structure:</strong>
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Proper HTML5 landmark elements</strong>: Use{" "}
                <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>,{" "}
                <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>,{" "}
                <code>&lt;article&gt;</code>, <code>&lt;aside&gt;</code>, and{" "}
                <code>&lt;footer&gt;</code> to define the major sections of your
                page.
              </li>
              <li>
                <strong>Logical heading hierarchy</strong>: Use heading elements
                (<code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>) to
                create a hierarchical outline of the content. Don&apos;t skip
                heading levels or use headings for styling purposes.
              </li>
              <li>
                <strong>Skip links</strong>: Provide a way for keyboard users to
                skip navigation and go directly to the main content.
              </li>
              <li>
                <strong>Descriptive link text</strong>: Ensure that link text
                makes sense out of context, as screen reader users can navigate
                by links.
              </li>
              <li>
                <strong>Proper labeling</strong>: Use <code>aria-label</code> or{" "}
                <code>aria-labelledby</code> to provide labels for landmark
                regions when needed.
              </li>
            </ol>

            <p className="mt-3">
              <strong>How screen readers navigate document structure:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Users can navigate by headings, jumping from{" "}
                <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> to quickly
                scan the page structure
              </li>
              <li>
                Landmark elements allow users to jump between major sections of
                the page
              </li>
              <li>
                Lists enable users to navigate through items sequentially or
                skip the entire list
              </li>
              <li>Tables provide row and column navigation capabilities</li>
              <li>
                Links can be navigated sequentially or accessed through a links
                list
              </li>
            </ul>

            <p className="mt-3">
              <strong>Best practices for document structure:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Use only one <code>&lt;h1&gt;</code> per page, typically for the
                page title
              </li>
              <li>
                Ensure heading levels reflect the logical hierarchy of the
                content
              </li>
              <li>
                Use lists (<code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code>,{" "}
                <code>&lt;dl&gt;</code>) for groups of related items
              </li>
              <li>
                Group related form fields with <code>&lt;fieldset&gt;</code> and{" "}
                <code>&lt;legend&gt;</code>
              </li>
              <li>
                Use <code>&lt;table&gt;</code> only for tabular data, with
                proper headers and captions
              </li>
              <li>
                Provide descriptive page titles that identify the page content
              </li>
              <li>
                Use the <code>lang</code> attribute to identify the language of
                the page and any language changes within the page
              </li>
            </ul>
          </div>
        }
        tips={[
          "Use headings to create a logical outline of your content",
          "Test navigation by using a screen reader and navigating by headings, landmarks, and links",
          "Provide skip links to bypass repetitive navigation",
          "Use ARIA landmarks to enhance navigation when HTML5 semantic elements aren't sufficient",
        ]}
        interviewQuestions={[
          {
            question:
              "How would you test a website for screen reader accessibility?",
            answer:
              "Testing for screen reader accessibility: 1) Use actual screen readers: Test with popular screen readers like NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS), and TalkBack (Android). 2) Test with keyboard only: Ensure all functionality is accessible without a mouse. 3) Check document structure: Navigate by headings, landmarks, and links to verify logical organization. 4) Verify form accessibility: Test form controls, labels, error messages, and submission. 5) Check alternative text: Ensure images have appropriate alt text. 6) Test dynamic content: Verify that updates, alerts, and modal dialogs are announced properly. 7) Check reading order: Ensure the reading order matches the visual order. 8) Test custom widgets: Verify that custom components work with keyboard and announce proper roles and states. 9) Verify focus management: Check that focus is managed appropriately, especially for interactive elements. 10) Test with different browsers: Screen reader behavior can vary between browsers. 11) Use automated tools: Tools like axe, WAVE, or Lighthouse can catch common issues. 12) Create test scenarios: Test common user journeys and tasks. 13) Involve users with disabilities: Get feedback from actual screen reader users. Document findings, prioritize issues based on impact, and retest after making changes.",
            difficulty: "medium",
            tags: ["Accessibility", "Testing", "Screen Readers"],
          },
          {
            question:
              "What are the most common screen reader accessibility issues and how would you fix them?",
            answer:
              "Common screen reader accessibility issues and fixes: 1) Missing alternative text: Add descriptive alt text to images that convey information and empty alt text for decorative images. 2) Improper heading structure: Create a logical hierarchy of headings without skipping levels. 3) Inaccessible forms: Add proper labels, group related fields with fieldset/legend, and provide clear error messages. 4) Lack of keyboard accessibility: Ensure all interactive elements are keyboard accessible and have visible focus indicators. 5) Improper use of ARIA: Follow the first rule of ARIA (don't use it if native HTML will work) and ensure ARIA attributes are used correctly. 6) Missing document language: Add lang attribute to the html element and to elements that change language. 7) Uninformative link text: Use descriptive link text instead of 'click here' or 'read more'. 8) Inaccessible dynamic content: Use ARIA live regions for dynamic updates and manage focus for dialogs. 9) Complex tables without proper markup: Add proper header cells (th with scope) and captions to data tables. 10) Poor color contrast: Ensure text meets WCAG contrast requirements. 11) Lack of visible focus indicators: Maintain or enhance default focus styles. 12) Inaccessible custom widgets: Implement proper keyboard interaction patterns and ARIA roles/states. 13) Autoplay media: Provide controls to pause, stop, or adjust volume for audio/video content. 14) Missing page titles: Add descriptive, unique titles to each page. 15) Inaccessible PDFs and documents: Create accessible versions of downloadable content.",
            difficulty: "hard",
            tags: ["Accessibility", "Screen Readers", "Troubleshooting"],
          },
        ]}
      />
  );
}
