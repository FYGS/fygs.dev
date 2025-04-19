"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

// Demo component for color contrast
function ColorContrastDemo() {
  const [selectedExample, setSelectedExample] = useState<"good" | "bad">("bad");

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <Button
          variant={selectedExample === "bad" ? "default" : "outline"}
          onClick={() => setSelectedExample("bad")}
        >
          Poor Contrast Examples
        </Button>
        <Button
          variant={selectedExample === "good" ? "default" : "outline"}
          onClick={() => setSelectedExample("good")}
        >
          Good Contrast Examples
        </Button>
      </div>

      {selectedExample === "bad" ? (
        <div className="space-y-4">
          <div className="p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-2">Poor Text Contrast</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded">
                <p style={{ color: "#999999" }} className="mb-2">
                  This light gray text (#999999) on white background has a
                  contrast ratio of only 2.85:1, which fails WCAG AA
                  requirements for normal text.
                </p>
                <p
                  style={{
                    color: "#aaaaaa",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  className="mb-2"
                >
                  This large light gray text (#aaaaaa) has a contrast ratio of
                  only 2.32:1, which fails WCAG AA requirements even for large
                  text.
                </p>
              </div>

              <div
                className="p-4 rounded"
                style={{ backgroundColor: "#eeeeee" }}
              >
                <p style={{ color: "#ffffff" }} className="mb-2">
                  This white text on a light gray background (#eeeeee) has a
                  contrast ratio of only 1.16:1, which is very difficult to
                  read.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-2">
              Poor UI Component Contrast
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <button
                  style={{
                    backgroundColor: "#eeeeee",
                    color: "#999999",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  Low Contrast Button
                </button>

                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "1px solid #cccccc",
                    borderRadius: "4px",
                  }}
                ></div>

                <input
                  type="text"
                  placeholder="Low contrast input"
                  style={{
                    border: "1px solid #dddddd",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-2">Good Text Contrast</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded">
                <p style={{ color: "#595959" }} className="mb-2">
                  This dark gray text (#595959) on white background has a
                  contrast ratio of 7:1, which meets WCAG AAA requirements for
                  normal text.
                </p>
                <p
                  style={{
                    color: "#767676",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                  className="mb-2"
                >
                  This large medium gray text (#767676) has a contrast ratio of
                  4.54:1, which meets WCAG AAA requirements for large text.
                </p>
              </div>

              <div
                className="p-4 rounded"
                style={{ backgroundColor: "#333333" }}
              >
                <p style={{ color: "#ffffff" }} className="mb-2">
                  This white text on a dark gray background (#333333) has a
                  contrast ratio of 12.63:1, which is very easy to read.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-2">
              Good UI Component Contrast
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <button
                  style={{
                    backgroundColor: "#0072B2",
                    color: "#ffffff",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  High Contrast Button
                </button>

                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "2px solid #595959",
                    borderRadius: "4px",
                  }}
                ></div>

                <input
                  type="text"
                  placeholder="High contrast input"
                  style={{
                    border: "2px solid #595959",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ColorContrastSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Color Contrast</CardTitle>
          <CardDescription>
            Ensuring text and interactive elements have sufficient contrast for
            users with visual impairments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Proper color contrast is essential for users with low vision, color
            blindness, or those using devices in bright environments. WCAG
            guidelines provide specific contrast ratios that should be met for
            text and interactive elements.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Contrast Ratio</Badge>
            <Badge>WCAG Guidelines</Badge>
            <Badge>Color Blindness</Badge>
            <Badge>Testing Tools</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="WCAG Contrast Requirements"
        description="Understanding and implementing proper contrast ratios"
        demo={<ColorContrastDemo />}
        code={`/* WCAG 2.1 Level AA Requirements */

/* Normal text (less than 18pt or 14pt bold) needs a contrast ratio of at least 4.5:1 */
.normal-text-good {
  color: #595959; /* Dark gray on white background - ratio: 7:1 */
  background-color: #ffffff;
}

.normal-text-bad {
  color: #999999; /* Light gray on white background - ratio: 2.85:1 */
  background-color: #ffffff;
}

/* Large text (at least 18pt or 14pt bold) needs a contrast ratio of at least 3:1 */
.large-text-good {
  color: #767676; /* Medium gray on white background - ratio: 4.54:1 */
  background-color: #ffffff;
  font-size: 18pt; /* or 24px */
}

.large-text-bad {
  color: #aaaaaa; /* Light gray on white background - ratio: 2.32:1 */
  background-color: #ffffff;
  font-size: 18pt; /* or 24px */
}

/* UI Components and Graphical Objects need a contrast ratio of at least 3:1 */
.ui-component-good {
  background-color: #767676; /* Medium gray against white - ratio: 4.54:1 */
  border: 2px solid #767676;
}

.ui-component-bad {
  background-color: #cccccc; /* Very light gray against white - ratio: 1.61:1 */
  border: 2px solid #cccccc;
}

/* WCAG 2.1 Level AAA Requirements (stricter) */

/* Normal text needs a contrast ratio of at least 7:1 */
.normal-text-aaa {
  color: #595959; /* Dark gray on white background - ratio: 7:1 */
  background-color: #ffffff;
}

/* Large text needs a contrast ratio of at least 4.5:1 */
.large-text-aaa {
  color: #767676; /* Medium gray on white background - ratio: 4.54:1 */
  background-color: #ffffff;
  font-size: 18pt; /* or 24px */
}`}
        explanation={
          <div>
            <p>
              Color contrast is a measure of the difference in perceived
              luminance (or brightness) between two colors. It&apos;s crucial
              for ensuring that text and interactive elements are perceivable by
              all users, including those with low vision or color blindness.
            </p>

            <p className="mt-3">
              <strong>WCAG Contrast Requirements:</strong>
            </p>

            <p>
              The Web Content Accessibility Guidelines (WCAG) define specific
              contrast ratios that should be met for different types of content:
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>WCAG 2.1 Level AA (minimum requirement):</strong>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>
                    Normal text (less than 18pt or 14pt bold): at least 4.5:1
                  </li>
                  <li>Large text (at least 18pt or 14pt bold): at least 3:1</li>
                  <li>UI components and graphical objects: at least 3:1</li>
                </ul>
              </li>
              <li>
                <strong>WCAG 2.1 Level AAA (enhanced requirement):</strong>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>Normal text: at least 7:1</li>
                  <li>Large text: at least 4.5:1</li>
                </ul>
              </li>
            </ol>

            <p className="mt-3">
              <strong>How to Calculate Contrast Ratio:</strong>
            </p>

            <p>
              The contrast ratio is calculated using the relative luminance of
              the lightest and darkest colors:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md mt-2 text-sm">
              (L1 + 0.05) / (L2 + 0.05)
            </pre>

            <p className="mt-2">
              Where L1 is the relative luminance of the lightest color and L2 is
              the relative luminance of the darkest color. The result ranges
              from 1:1 (no contrast) to 21:1 (black on white).
            </p>

            <p className="mt-3">
              <strong>Common Contrast Issues:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Light gray text on white backgrounds</li>
              <li>White text on light-colored backgrounds</li>
              <li>Low contrast between form controls and their backgrounds</li>
              <li>Low contrast for focus indicators</li>
              <li>Text over images or gradients without proper contrast</li>
            </ul>

            <p className="mt-3">
              <strong>Testing Tools:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>WebAIM Contrast Checker</li>
              <li>Colour Contrast Analyser</li>
              <li>Chrome DevTools&apos; Accessibility Audit</li>
              <li>Axe DevTools</li>
              <li>Stark plugin for design tools</li>
            </ul>
          </div>
        }
        tips={[
          "Don't rely solely on color to convey information; use additional indicators like text, patterns, or icons",
          "Test your color combinations with contrast checkers before implementation",
          "Consider how your design appears to users with different types of color blindness",
          "Ensure that focus indicators have sufficient contrast against all possible backgrounds",
        ]}
      />

      <CodeExample
        title="Color Blindness Considerations"
        description="Designing for users with different types of color vision deficiencies"
        code={`/* Don't rely solely on color to convey information */

/* Bad example - using only color */
.error-message-bad {
  color: #ff0000; /* Red text for errors */
}

.success-message-bad {
  color: #00aa00; /* Green text for success */
}

/* Good example - using icons and colors */
.error-message-good {
  color: #ff0000; /* Red text for errors */
}
.error-message-good::before {
  content: '⚠️ '; /* Warning icon */
}

.success-message-good {
  color: #00aa00; /* Green text for success */
}
.success-message-good::before {
  content: '✓ '; /* Checkmark icon */
}

/* Good example - using patterns for charts and graphs */
.chart-bar-1 {
  background-color: #0000ff; /* Blue */
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent);
  background-size: 10px 10px; /* Striped pattern */
}

.chart-bar-2 {
  background-color: #ff0000; /* Red */
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 5px 5px; /* Dotted pattern */
}

/* Using a colorblind-friendly palette */
:root {
  --cb-blue: #0072B2;     /* Blue */
  --cb-yellow: #E69F00;    /* Yellow */
  --cb-green: #009E73;     /* Green */
  --cb-red: #D55E00;       /* Red/orange */
  --cb-purple: #CC79A7;    /* Purple/pink */
  --cb-grey: #56B4E9;      /* Sky blue */
  --cb-black: #000000;     /* Black */
}`}
        explanation={
          <div>
            <p>
              Color blindness (color vision deficiency) affects approximately 1
              in 12 men and 1 in 200 women worldwide. When designing interfaces,
              it&apos;s important to ensure that information is accessible to
              users with different types of color vision deficiencies.
            </p>

            <p className="mt-3">
              <strong>Types of Color Blindness:</strong>
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Deuteranopia/Deuteranomaly:</strong> Difficulty
                distinguishing between red and green (most common)
              </li>
              <li>
                <strong>Protanopia/Protanomaly:</strong> Difficulty
                distinguishing between red and green, and red appears darker
              </li>
              <li>
                <strong>Tritanopia/Tritanomaly:</strong> Difficulty
                distinguishing between blue and yellow (rare)
              </li>
              <li>
                <strong>Achromatopsia:</strong> Complete color blindness, seeing
                only in shades of gray (very rare)
              </li>
            </ol>

            <p className="mt-3">
              <strong>Best Practices for Designing for Color Blindness:</strong>
            </p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Don&apos;t rely solely on color:</strong> Always use
                additional indicators like text labels, patterns, icons, or
                shapes to convey important information.
              </li>
              <li>
                <strong>Use colorblind-friendly palettes:</strong> Choose color
                combinations that can be distinguished by people with color
                vision deficiencies.
              </li>
              <li>
                <strong>Ensure sufficient contrast:</strong> High contrast helps
                users with color blindness distinguish between different
                elements.
              </li>
              <li>
                <strong>Use patterns and textures:</strong> In charts, graphs,
                and maps, use patterns in addition to colors to differentiate
                between data points.
              </li>
              <li>
                <strong>Test your designs:</strong> Use color blindness
                simulators to check how your interface appears to users with
                different types of color vision deficiencies.
              </li>
            </ol>

            <p className="mt-3">
              <strong>Colorblind-Friendly Color Palettes:</strong>
            </p>

            <p>
              Several color palettes have been designed specifically to be
              distinguishable by people with color blindness:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Blue and orange</li>
              <li>Blue and yellow</li>
              <li>Blue and red</li>
              <li>Blue, purple, and green</li>
            </ul>

            <p className="mt-3">
              <strong>Testing Tools for Color Blindness:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Coblis — Color Blindness Simulator</li>
              <li>Color Oracle</li>
              <li>Stark plugin for design tools</li>
              <li>
                Chrome extensions like &quot;Let&apos;s get color blind&quot;
              </li>
            </ul>
          </div>
        }
        tips={[
          "Use a colorblind-friendly palette for your application's color scheme",
          "Always provide text labels for color-coded information",
          "For charts and graphs, use patterns, shapes, and labels in addition to colors",
          "Test your designs with color blindness simulators to ensure they're accessible",
        ]}
        interviewQuestions={[
          {
            question:
              "What are the WCAG requirements for color contrast and how do you ensure your designs meet them?",
            answer:
              "WCAG color contrast requirements: 1) Level AA: Normal text needs 4.5:1 contrast ratio, large text (18pt+) needs 3:1, and UI components need 3:1. 2) Level AAA: Normal text needs 7:1 and large text needs 4.5:1. To ensure designs meet these requirements: 1) Use contrast checking tools like WebAIM Contrast Checker, Colour Contrast Analyser, or browser DevTools. 2) Establish a color system with accessible base colors. 3) Test designs in grayscale to ensure information isn't conveyed by color alone. 4) Create accessible text styles in design systems with pre-approved color combinations. 5) Check contrast in different viewing conditions (bright light, dark mode). 6) Verify contrast of text over images using overlays or text shadows. 7) Ensure focus indicators meet 3:1 contrast requirement. 8) Document contrast ratios in design handoffs. 9) Implement automated testing in CI/CD pipelines. 10) Conduct user testing with people with visual impairments. These practices ensure content is perceivable by users with low vision, color blindness, or those using devices in challenging lighting conditions.",
            difficulty: "medium",
            tags: ["Accessibility", "WCAG", "Design"],
          },
          {
            question:
              "How would you design an interface that's accessible to users with color blindness?",
            answer:
              "Designing for color blindness: 1) Don't rely solely on color to convey information. Use multiple visual cues like text labels, icons, patterns, and shapes. 2) Use a colorblind-friendly palette with high contrast between colors. Blues, yellows, and whites are generally distinguishable by most people with color blindness. 3) Avoid problematic color combinations: red/green, green/brown, blue/purple, green/blue, light green/yellow, blue/grey, green/grey, green/black. 4) Add patterns or textures to charts, graphs, and maps to differentiate data points. 5) Provide text labels directly on charts rather than separate color legends. 6) Ensure sufficient contrast between text and backgrounds (4.5:1 for normal text). 7) Use bold or larger text for emphasis instead of just color changes. 8) For form validation and error messages, include icons and text descriptions, not just red text. 9) Test designs with color blindness simulators like Coblis, Color Oracle, or Stark. 10) Include accessibility options to customize color schemes. 11) Follow established design patterns that users are familiar with. 12) Conduct usability testing with color-blind users. These practices ensure information is accessible to all users regardless of their color perception abilities.",
            difficulty: "medium",
            tags: ["Accessibility", "UX Design", "Color Blindness"],
          },
        ]}
      />

      <InterviewQuestions
        title="Color Contrast Interview Questions"
        questions={[
          {
            question:
              "What tools would you use to test color contrast in a web application?",
            answer:
              "Tools for testing color contrast: 1) WebAIM Contrast Checker: A free online tool that calculates contrast ratios between foreground and background colors. 2) Colour Contrast Analyser: A desktop application that provides real-time contrast analysis with a color picker. 3) Chrome DevTools Accessibility Audit: Built into Chrome's DevTools, it identifies contrast issues on a page. 4) Axe DevTools: A browser extension that tests for accessibility issues including contrast. 5) WAVE (Web Accessibility Evaluation Tool): A comprehensive accessibility testing tool that includes contrast checking. 6) Stark: A plugin for design tools like Figma, Sketch, and Adobe XD. 7) Contrast: A macOS app for quick contrast checks. 8) Lighthouse: Google's automated tool for improving web page quality, including accessibility. 9) Firefox Accessibility Inspector: Similar to Chrome's tools but with some unique features. 10) Color Oracle: Simulates color blindness to test how designs appear to users with color vision deficiencies. 11) a11y.css: A CSS stylesheet that highlights accessibility issues. 12) Automated testing tools like Pa11y or Cypress-axe for continuous integration. These tools help ensure that text and interactive elements have sufficient contrast for users with visual impairments.",
            difficulty: "easy",
            tags: ["Accessibility", "Tools", "Testing"],
          },
          {
            question:
              "How would you handle text over images or gradients to ensure proper contrast?",
            answer:
              "Handling text over images or gradients for proper contrast: 1) Add a solid color overlay between the image and text. Use a semi-transparent black or colored overlay to increase contrast. 2) Use text shadows or outlines to create separation between text and background. 3) Place text in a solid-colored container with proper contrast. 4) Use a gradient overlay that ensures the area behind text has sufficient contrast. 5) Position text over simpler parts of the image with consistent colors. 6) Blur the image in areas where text appears to reduce visual complexity. 7) Use a scrim (gradient overlay that fades from dark to transparent) at the bottom or top of images. 8) Ensure text is sufficiently large and bold when placed over images. 9) Test contrast in various lighting conditions and devices. 10) Consider alternative layouts for users with high-contrast mode enabled. 11) Provide controls for users to adjust contrast or switch to a simpler view. 12) Test with actual users with visual impairments. These techniques ensure text remains readable regardless of the background complexity, maintaining accessibility while preserving design aesthetics.",
            difficulty: "medium",
            tags: ["Accessibility", "Design", "Implementation"],
          },
          {
            question:
              "How do you balance aesthetic design preferences with accessibility requirements for color contrast?",
            answer:
              "Balancing aesthetics with color contrast requirements: 1) Start with accessibility in mind: Begin with WCAG-compliant color palettes rather than retrofitting later. 2) Educate stakeholders: Help designers and clients understand that accessible design is good design and reaches more users. 3) Create accessible design systems: Develop pre-approved color combinations that meet contrast requirements. 4) Use subtle variations: Small adjustments to hues can maintain brand identity while improving contrast. 5) Apply contrast requirements selectively: Use high-contrast for important text and interactive elements, with more flexibility for decorative elements. 6) Layer design elements: Use borders, underlines, or icons to enhance recognition without relying solely on color. 7) Test with users: Conduct usability testing with people with visual impairments to validate solutions. 8) Implement alternative themes: Offer high-contrast modes as options. 9) Use tools during design: Integrate contrast checkers into the design workflow. 10) Focus on typography: Well-chosen fonts and sizes can improve readability without sacrificing aesthetics. 11) Document decisions: Create clear guidelines explaining the balance between brand and accessibility. 12) Embrace constraints as creative challenges: Use accessibility requirements to drive innovation rather than seeing them as limitations. This balanced approach ensures designs are both beautiful and accessible to all users.",
            difficulty: "hard",
            tags: ["Accessibility", "UX Design", "Best Practices"],
          },
        ]}
      />
    </div>
  );
}
