import { CodeExample } from "../../ui/code-example";

export function AriaRolesExample() {
  return (
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
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Tab 2</button>
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
  );
}
