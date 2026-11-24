import { CodeExample } from "../../ui/code-example";

export function SemanticHtmlExample() {
  return (
      <CodeExample
        title="Semantic HTML for Screen Readers"
        description="Using proper HTML elements to improve screen reader experience"
        code={`<!-- Bad example: using divs for everything -->
<div class="header">
  <div class="logo">Company Name</div>
  <div class="nav">
    <div class="nav-item" onclick="navigate('home')">Home</div>
    <div class="nav-item" onclick="navigate('about')">About</div>
    <div class="nav-item" onclick="navigate('contact')">Contact</div>
  </div>
</div>

<div class="main-content">
  <div class="title">Welcome to our website</div>
  <div class="text">This is some content on our website.</div>

  <div class="form">
    <div class="form-title">Contact Us</div>
    <div class="input-group">
      <div class="label">Name:</div>
      <div class="input" contenteditable="true" tabindex="0"></div>
    </div>
    <div class="button" onclick="submitForm()">Submit</div>
  </div>
</div>

<!-- Good example: using semantic HTML -->
<header>
  <h1>Company Name</h1>
  <nav>
    <ul>
      <li><a href="/home">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <h2>Welcome to our website</h2>
  <p>This is some content on our website.</p>

  <form>
    <h3>Contact Us</h3>
    <div class="form-group">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name">
    </div>
    <button type="submit">Submit</button>
  </form>
</main>`}
        explanation={
          <div>
            <p>
              Semantic HTML is the foundation of web accessibility. It provides
              meaning and structure to content, which is essential for screen
              readers to interpret and convey information accurately to users.
            </p>

            <p className="mt-3">
              <strong>Why semantic HTML matters for screen readers:</strong>
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Navigation</strong>: Screen readers use semantic
                elements to create a navigable outline of the page, allowing
                users to jump between sections.
              </li>
              <li>
                <strong>Context</strong>: Semantic elements provide context
                about the content they contain, helping users understand the
                purpose and relationship of different elements.
              </li>
              <li>
                <strong>Functionality</strong>: Elements like buttons, links,
                and form controls have built-in behaviors and keyboard
                accessibility that non-semantic elements lack.
              </li>
              <li>
                <strong>Consistency</strong>: Semantic HTML creates a consistent
                experience across different websites and applications.
              </li>
            </ol>

            <p className="mt-3">
              <strong>Key semantic elements and their purposes:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <code>&lt;header&gt;</code>: The introductory content of a page
                or section
              </li>
              <li>
                <code>&lt;nav&gt;</code>: A section of navigation links
              </li>
              <li>
                <code>&lt;main&gt;</code>: The main content of the document
              </li>
              <li>
                <code>&lt;article&gt;</code>: A self-contained composition
              </li>
              <li>
                <code>&lt;section&gt;</code>: A standalone section of content
              </li>
              <li>
                <code>&lt;aside&gt;</code>: Content tangentially related to the
                main content
              </li>
              <li>
                <code>&lt;footer&gt;</code>: The footer of a page or section
              </li>
              <li>
                <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>: Headings
                that create a hierarchical structure
              </li>
              <li>
                <code>&lt;button&gt;</code>: An interactive button element
              </li>
              <li>
                <code>&lt;a&gt;</code>: A hyperlink to another resource
              </li>
              <li>
                <code>&lt;form&gt;</code>, <code>&lt;label&gt;</code>,{" "}
                <code>&lt;input&gt;</code>: Form elements for user input
              </li>
              <li>
                <code>&lt;table&gt;</code>, <code>&lt;th&gt;</code>,{" "}
                <code>&lt;td&gt;</code>: Table elements for tabular data
              </li>
              <li>
                <code>&lt;figure&gt;</code> and <code>&lt;figcaption&gt;</code>:
                Images or diagrams with captions
              </li>
            </ul>

            <p className="mt-3">
              <strong>Common anti-patterns to avoid:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Using <code>&lt;div&gt;</code> or <code>&lt;span&gt;</code> for
                interactive elements instead of <code>&lt;button&gt;</code> or{" "}
                <code>&lt;a&gt;</code>
              </li>
              <li>
                Using heading elements for styling rather than document
                structure
              </li>
              <li>
                Creating custom form controls without proper ARIA attributes
              </li>
              <li>Using tables for layout instead of for tabular data</li>
              <li>
                Using <code>onclick</code> handlers on non-interactive elements
              </li>
            </ul>
          </div>
        }
        tips={[
          "Use the most specific semantic element for each piece of content",
          "Ensure a logical heading structure (h1, h2, h3, etc.) that reflects the document outline",
          "Use native HTML elements whenever possible before resorting to ARIA",
          "Test your HTML with a screen reader to ensure it's interpreted correctly",
        ]}
      />
  );
}
