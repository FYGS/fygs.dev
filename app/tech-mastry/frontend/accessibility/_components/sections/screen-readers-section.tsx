"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions";
import { CaseStudies } from "../ui/case-studies";
import { InteractiveDemo } from "../ui/interactive-demo";

const headingStructureDemo = `
<main>
  <h1>Main Page Title</h1>
  
  <section>
    <h2>About Us</h2>
    <p>Company description goes here.</p>
    
    <h3>Our Mission</h3>
    <p>Mission statement goes here.</p>
  </section>

  <section>
    <h2>Services</h2>
    <ul>
      <li>Service 1</li>
      <li>Service 2</li>
    </ul>
  </section>
</main>
`;

const ariaLiveDemo = `
<div role="alert" aria-live="polite" id="notification">
  <!-- Content will be updated dynamically -->
</div>

<button id="notifyBtn">Show Notification</button>
`;

const formAccessibilityDemo = `
<form>
  <div class="form-group">
    <label for="username">Username</label>
    <input 
      type="text" 
      id="username" 
      name="username" 
      aria-required="true"
      aria-describedby="username-help"
    />
    <div id="username-help" class="help-text">
      Enter your username (minimum 3 characters)
    </div>
  </div>

  <div class="form-group">
    <label for="newsletter">Email Preferences</label>
    <div role="group" aria-labelledby="newsletter-label">
      <input 
        type="checkbox" 
        id="newsletter" 
        name="newsletter"
      />
      <label for="newsletter">Subscribe to newsletter</label>
    </div>
  </div>

  <button type="submit">Submit</button>
</form>
`;

export function ScreenReadersSection() {
  const renderAriaLiveDemo = (code: string, container: HTMLDivElement) => {
    container.innerHTML = code;

    // Add event listeners after rendering HTML
    const button = container.querySelector("#notifyBtn");
    const notification = container.querySelector("#notification");

    if (button && notification) {
      button.addEventListener("click", () => {
        notification.textContent =
          "New message received at " + new Date().toLocaleTimeString();
      });
    }
  };

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

      <CodeExample
        title="Images and Alternative Text"
        description="Making visual content accessible to screen reader users"
        code={`<!-- Informative image with appropriate alt text -->
<img src="chart-quarterly-sales.png" alt="Bar chart showing quarterly sales: Q1: $10k, Q2: $15k, Q3: $20k, Q4: $25k">

<!-- Decorative image that should be ignored by screen readers -->
<img src="decorative-divider.png" alt="">

<!-- Another way to mark decorative images -->
<img src="background-pattern.png" role="presentation">

<!-- Image that is a link needs alt text describing the destination -->
<a href="/home">
  <img src="home-icon.png" alt="Home page">
</a>

<!-- Complex image with extended description -->
<figure>
  <img src="complex-diagram.png" alt="System architecture diagram" aria-describedby="diagram-description">
  <figcaption id="diagram-description">
    <h3>System Architecture</h3>
    <p>This diagram illustrates the three-tier architecture of our application:</p>
    <ul>
      <li>The presentation tier handles user interface and user experience</li>
      <li>The application tier contains business logic and processing</li>
      <li>The data tier manages data storage and retrieval</li>
    </ul>
  </figcaption>
</figure>

<!-- SVG with accessible text -->
<svg width="100" height="100" aria-labelledby="svg-title svg-desc">
  <title id="svg-title">Company Logo</title>
  <desc id="svg-desc">A blue circle with the letter C in the center</desc>
  <circle cx="50" cy="50" r="40" fill="blue" />
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="30">C</text>
</svg>

<!-- Icon font with accessible text -->
<span class="icon icon-search" aria-hidden="true"></span>
<span class="sr-only">Search</span>

<!-- CSS background image with accessible alternative -->
<div class="hero-image" role="img" aria-label="Team of diverse professionals collaborating in a modern office space"></div>`}
        explanation={
          <div>
            <p>
              Images and visual content present unique challenges for screen
              reader users. Proper alternative text and descriptions are
              essential to ensure that all users can access the information
              conveyed by images.
            </p>

            <p className="mt-3">
              <strong>Guidelines for writing effective alt text:</strong>
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Be specific and concise</strong>: Describe the content
                and function of the image without unnecessary details.
              </li>
              <li>
                <strong>Consider context</strong>: The same image might need
                different alt text depending on its context and purpose on the
                page.
              </li>
              <li>
                <strong>
                  Don&apos;t include &quot;image of&quot; or &quot;picture
                  of&quot;
                </strong>
                : Screen readers already announce that it&apos;s an image.
              </li>
              <li>
                <strong>Include relevant text</strong>: If the image contains
                text that&apos;s important for understanding, include it in the
                alt text.
              </li>
              <li>
                <strong>Describe data in charts and graphs</strong>: Summarize
                the trends or key data points rather than describing the visual
                appearance.
              </li>
            </ol>

            <p className="mt-3">
              <strong>
                Different types of images require different approaches:
              </strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Informative images</strong>: Provide alt text that
                conveys the same information as the image.
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-1 text-sm">
                  &lt;img src=&quot;chart.png&quot; alt=&quot;Bar chart showing
                  sales growth of 25% in 2023&quot;&gt;
                </pre>
              </li>
              <li>
                <strong>Decorative images</strong>: Use empty alt text or{" "}
                <code>role=&quot;presentation&quot;</code> to indicate that the
                image should be ignored by screen readers.
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-1 text-sm">
                  &lt;img src=&quot;decorative.png&quot; alt=&quot;&quot;&gt;
                </pre>
              </li>
              <li>
                <strong>Functional images</strong> (like buttons or links):
                Describe the function rather than the appearance.
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-1 text-sm">
                  &lt;img src=&quot;print-icon.png&quot; alt=&quot;Print this
                  page&quot;&gt;
                </pre>
              </li>
              <li>
                <strong>Complex images</strong> (like charts, diagrams, or
                maps): Provide a brief alt text and a more detailed description
                using <code>aria-describedby</code> or adjacent text.
              </li>
            </ul>

            <p className="mt-3">
              <strong>
                Other techniques for making visual content accessible:
              </strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Use <code>&lt;figure&gt;</code> and{" "}
                <code>&lt;figcaption&gt;</code> to associate images with
                captions
              </li>
              <li>
                Provide accessible text for SVG images using{" "}
                <code>&lt;title&gt;</code> and <code>&lt;desc&gt;</code>{" "}
                elements
              </li>
              <li>
                Make icon fonts accessible by hiding them from screen readers
                and providing text alternatives
              </li>
              <li>
                Use <code>role=&quot;img&quot;</code> and{" "}
                <code>aria-label</code> for CSS background images that convey
                information
              </li>
              <li>
                Consider providing text alternatives for complex visualizations
                like data visualizations or infographics
              </li>
            </ul>
          </div>
        }
        tips={[
          "Keep alt text concise (generally under 125 characters)",
          "Test your alt text by turning off images and seeing if you can understand the content",
          'Use empty alt text (alt="") for decorative images',
          "For complex images, provide both short alt text and a longer description",
        ]}
      />

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
              "Common screen reader accessibility issues and fixes: 1) Missing alternative text: Add descriptive alt text to images that convey information and empty alt text for decorative images. 2) Improper heading structure: Create a logical hierarchy of headings without skipping levels. 3) Inaccessible forms: Add proper labels, group related fields with fieldset/legend, and provide clear error messages. 4) Lack of keyboard accessibility: Ensure all interactive elements are keyboard accessible and have visible focus indicators. 5) Improper use of ARIA: Follow the first rule of ARIA (don't use it if native HTML will work) and ensure ARIA attributes are used correctly. 6) Missing document language: Add lang attribute to the html element and to elements that change language. 7) Uninformative link text: Use descriptive link text instead of 'click here' or 'read more'. 8) Inaccessible dynamic content: Use ARIA live regions for dynamic updates and manage focus for dialogs. 9) Complex tables without proper markup: Add proper headers, captions, and summary attributes to data tables. 10) Poor color contrast: Ensure text meets WCAG contrast requirements. 11) Lack of visible focus indicators: Maintain or enhance default focus styles. 12) Inaccessible custom widgets: Implement proper keyboard interaction patterns and ARIA roles/states. 13) Autoplay media: Provide controls to pause, stop, or adjust volume for audio/video content. 14) Missing page titles: Add descriptive, unique titles to each page. 15) Inaccessible PDFs and documents: Create accessible versions of downloadable content.",
            difficulty: "hard",
            tags: ["Accessibility", "Screen Readers", "Troubleshooting"],
          },
        ]}
      />

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
              'Form accessibility considerations for screen readers: 1) Proper labeling: Use &lt;label&gt; elements properly associated with inputs via \'for\' attribute matching input \'id\'. 2) Grouping related fields: Use &lt;fieldset&gt; and &lt;legend&gt; to group related form controls. 3) Error handling: Provide clear error messages that are programmatically associated with inputs using aria-describedby. 4) Required fields: Mark required fields with both visual indicators and aria-required="true". 5) Input purpose: Use autocomplete attributes to indicate the expected input format. 6) Form instructions: Place instructions before the form and associate specific instructions with relevant fields. 7) Validation timing: Validate on submit and also on blur when appropriate. 8) Error summary: Provide a summary of errors at the top of the form with links to each field. 9) Custom controls: Ensure custom form controls have proper roles, states, and keyboard support. 10) Focus management: Move focus to the first error when validation fails. 11) Clear button labels: Use descriptive text for buttons (e.g., "Submit Application" instead of just "Submit"). 12) Logical tab order: Ensure the tab order follows the visual layout. 13) Input masks and formatting: Announce format requirements before users start typing. 14) Complex inputs: Provide clear instructions for complex inputs like date pickers or sliders. 15) Success feedback: Clearly communicate when a form has been successfully submitted. These considerations ensure that screen reader users can understand, navigate, complete, and submit forms independently.',
            difficulty: "medium",
            tags: ["Accessibility", "Forms", "UX Design"],
          },
        ]}
      />
    </div>
  );
}
