import { CodeExample } from "../../ui/code-example";

export function ImagesAltExample() {
  return (
      <CodeExample
        title="Images and Alternative Text"
        description="Making visual content accessible to screen reader users"
        code={`<!-- Informative image with appropriate alt text -->
<img src="chart-quarterly-sales.png" alt="Bar chart showing quarterly sales: Q1: $10k, Q2: $15k, Q3: $20k, Q4: $25k">

<!-- Decorative image that should be ignored by screen readers -->
<img src="decorative-divider.png" alt="">

<!-- Another way to mark decorative images -->
<img src="background-pattern.png" alt="" role="presentation">

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
<svg width="100" height="100" role="img" aria-labelledby="svg-title svg-desc">
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
                <pre className="bg-gray-800 p-2 rounded-md mt-1 text-sm">
                  &lt;img src=&quot;chart.png&quot; alt=&quot;Bar chart showing
                  sales growth of 25% in 2023&quot;&gt;
                </pre>
              </li>
              <li>
                <strong>Decorative images</strong>: Use empty alt text or{" "}
                <code>role=&quot;presentation&quot;</code> to indicate that the
                image should be ignored by screen readers.
                <pre className="bg-gray-800 p-2 rounded-md mt-1 text-sm">
                  &lt;img src=&quot;decorative.png&quot; alt=&quot;&quot;&gt;
                </pre>
              </li>
              <li>
                <strong>Functional images</strong> (like buttons or links):
                Describe the function rather than the appearance.
                <pre className="bg-gray-800 p-2 rounded-md mt-1 text-sm">
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
          "Keep alt text concise and meaningful in context. \"Under 125 characters\" is a common rule of thumb (historically linked to some screen readers), not a WCAG requirement: when an image needs more, give a short alt and a longer description nearby",
          "Test your alt text by turning off images and seeing if you can understand the content",
          'Use empty alt text (alt="") for decorative images',
          "For complex images, provide both short alt text and a longer description",
        ]}
      />
  );
}
