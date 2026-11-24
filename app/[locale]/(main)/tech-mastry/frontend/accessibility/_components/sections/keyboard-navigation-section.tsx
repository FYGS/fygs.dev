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
import { useEffect, useMemo, useRef, useState } from "react";
import { CodeExample } from "../ui/code-example";
import { InterviewQuestions } from "../ui/interview-questions";

// Demo component for keyboard navigation
function KeyboardNavigationDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFocusTrapActive, setIsFocusTrapActive] = useState(false);

  // Create individual refs for each button
  const button1Ref = useRef<HTMLButtonElement>(null);
  const button2Ref = useRef<HTMLButtonElement>(null);
  const button3Ref = useRef<HTMLButtonElement>(null);
  const button4Ref = useRef<HTMLButtonElement>(null);

  // Store refs in an array for easier access using useMemo to prevent re-creation on each render
  const buttonRefs = useMemo(
    () => [button1Ref, button2Ref, button3Ref, button4Ref],
    [button1Ref, button2Ref, button3Ref, button4Ref]
  );

  const trapRef = useRef<HTMLDivElement>(null);

  // Handle arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % 4);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + 4) % 4);
    }
  };

  // Focus the active button when activeIndex changes
  useEffect(() => {
    buttonRefs[activeIndex]?.current?.focus();
  }, [activeIndex, buttonRefs]);

  // Set up focus trap
  useEffect(() => {
    if (!isFocusTrapActive || !trapRef.current) return;

    const trapElement = trapRef.current;
    const focusableElements = trapElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTrapKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFocusTrapActive(false);
        return;
      }

      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    trapElement.addEventListener("keydown", handleTrapKeyDown);
    firstElement.focus();

    return () => {
      trapElement.removeEventListener("keydown", handleTrapKeyDown);
    };
  }, [isFocusTrapActive]);

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Arrow Key Navigation</h3>
        <p className="text-xs text-muted-foreground mb-2">
          Use arrow keys to navigate between buttons
        </p>

        <div
          className="grid grid-cols-2 gap-2"
          role="toolbar"
          aria-label="Button toolbar"
          onKeyDown={handleKeyDown}
        >
          <Button
            ref={button1Ref}
            variant={activeIndex === 0 ? "default" : "outline"}
            tabIndex={activeIndex === 0 ? 0 : -1}
          >
            Button 1
          </Button>
          <Button
            ref={button2Ref}
            variant={activeIndex === 1 ? "default" : "outline"}
            tabIndex={activeIndex === 1 ? 0 : -1}
          >
            Button 2
          </Button>
          <Button
            ref={button3Ref}
            variant={activeIndex === 2 ? "default" : "outline"}
            tabIndex={activeIndex === 2 ? 0 : -1}
          >
            Button 3
          </Button>
          <Button
            ref={button4Ref}
            variant={activeIndex === 3 ? "default" : "outline"}
            tabIndex={activeIndex === 3 ? 0 : -1}
          >
            Button 4
          </Button>
        </div>
      </div>

      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Focus Trap Demo</h3>
        <p className="text-xs text-muted-foreground mb-2">
          {isFocusTrapActive
            ? "Press Escape to exit the focus trap"
            : "Click the button to activate a focus trap"}
        </p>

        {!isFocusTrapActive ? (
          <Button onClick={() => setIsFocusTrapActive(true)}>
            Activate Focus Trap
          </Button>
        ) : (
          <div
            ref={trapRef}
            className="p-4 border-2 border-primary rounded-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trap-title"
          >
            <h4 id="trap-title" className="font-medium mb-2">
              Focus is trapped in this dialog
            </h4>
            <p className="mb-4 text-sm">
              Tab through the buttons below. Focus will cycle within this
              container.
            </p>
            <div className="flex flex-col gap-2">
              <Button>First Button</Button>
              <Button>Second Button</Button>
              <Button onClick={() => setIsFocusTrapActive(false)}>
                Close Dialog
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function KeyboardNavigationSection() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Navigation</CardTitle>
          <CardDescription>
            Ensuring all functionality is accessible via keyboard for users who
            cannot use a mouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Keyboard navigation is essential for users with motor disabilities,
            visual impairments, or those who prefer keyboard shortcuts. All
            interactive elements should be accessible and operable using only a
            keyboard.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>Focus Management</Badge>
            <Badge>Tab Order</Badge>
            <Badge>Keyboard Shortcuts</Badge>
            <Badge>Focus Indicators</Badge>
          </div>
        </CardContent>
      </Card>

      <CodeExample
        title="Basic Keyboard Navigation Patterns"
        description="Common keyboard interaction patterns for different UI elements"
        demo={<KeyboardNavigationDemo />}
        code={`// Interactive elements should be focusable and operable with keyboard
<button>Native buttons are keyboard accessible by default</button>

// Links should have meaningful text and be focusable
<a href="/contact">Contact Us</a>

// Non-interactive elements should not be in the tab order
// (tabindex="-1" only allows programmatic focus via element.focus())
<div tabindex="-1">Focusable by script only, not by Tab</div>

// Custom interactive elements need tabindex="0" to be focusable
<div role="button" tabindex="0" onclick="handleClick()" onkeydown="handleKeyDown(event)">
  Custom Button
</div>

// Keyboard event handling for custom elements
function handleKeyDown(event) {
  // Handle Enter and Space for buttons
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault(); // Prevent scrolling on Space
    handleClick();
  }
}

// Positive tabindex values override the natural order: avoid them (hard to maintain,
// they confuse users). Prefer a logical DOM order, and use tabindex="0" / "-1" only.
// Shown here only to explain how the focus order would be altered:
<div>
  <button tabindex="1">First focus</button>
  <button tabindex="3">Third focus</button>
  <button tabindex="2">Second focus</button>
</div>

// Focus trap for modals
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}`}
        explanation={
          <div>
            <p>
              Keyboard navigation is a fundamental aspect of web accessibility.
              It ensures that users who cannot use a mouse or other pointing
              devices can still interact with your website or application.
            </p>

            <p className="mt-3">Key principles of keyboard navigation:</p>

            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>
                <strong>Focusability</strong>: All interactive elements should
                be focusable using the Tab key.
              </li>
              <li>
                <strong>Operability</strong>: Users should be able to activate
                or interact with elements using keyboard commands (Enter, Space,
                arrow keys, etc.).
              </li>
              <li>
                <strong>Logical tab order</strong>: The focus should move in a
                logical sequence that matches the visual layout.
              </li>
              <li>
                <strong>Visible focus indicators</strong>: The currently focused
                element should have a visible focus indicator.
              </li>
            </ol>

            <p className="mt-3">
              <strong>Common keyboard interactions:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Tab</strong>: Move focus to the next focusable element
              </li>
              <li>
                <strong>Shift+Tab</strong>: Move focus to the previous focusable
                element
              </li>
              <li>
                <strong>Enter</strong>: Activate links, buttons, or submit forms
              </li>
              <li>
                <strong>Space</strong>: Activate buttons, toggle checkboxes
              </li>
              <li>
                <strong>Arrow keys</strong>: Navigate within components (menus,
                radio groups, sliders, etc.)
              </li>
              <li>
                <strong>Escape</strong>: Close dialogs, menus, or cancel actions
              </li>
            </ul>

            <p className="mt-3">
              <strong>The tabindex attribute:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <code>tabindex=&quot;0&quot;</code>: Includes an element in the
                natural tab order
              </li>
              <li>
                <code>tabindex=&quot;-1&quot;</code>: Excludes an element from
                the tab order but allows focus via JavaScript
              </li>
              <li>
                <code>tabindex=&quot;1&quot;</code> (or higher): Places an
                element earlier in the tab order (generally avoid this)
              </li>
            </ul>

            <p className="mt-3">
              <strong>Focus management:</strong>
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Trap focus within modal dialogs to prevent users from tabbing
                outside
              </li>
              <li>
                Return focus to the triggering element when a dialog is closed
              </li>
              <li>
                Skip to content links allow users to bypass repetitive
                navigation
              </li>
              <li>
                Avoid setting focus programmatically except after significant
                page changes
              </li>
            </ul>
          </div>
        }
        tips={[
          "Use native HTML elements whenever possible as they have built-in keyboard support",
          "Avoid using positive tabindex values as they disrupt the natural tab order",
          "Ensure all interactive elements have visible focus indicators",
          "Test your website using only a keyboard to identify accessibility issues",
        ]}
      />

      <InterviewQuestions
        title="Keyboard Navigation Interview Questions"
        questions={[
          {
            question:
              "Why is keyboard accessibility important and how do you implement it?",
            answer:
              "Keyboard accessibility is important because: 1) Many users with motor disabilities cannot use a mouse. 2) Screen reader users primarily navigate with a keyboard. 3) Some users prefer keyboard shortcuts for efficiency. 4) It's required by accessibility standards like WCAG. To implement keyboard accessibility: 1) Use native HTML elements when possible (buttons, links, form controls). 2) Ensure all interactive elements are focusable and operable with a keyboard. 3) Maintain a logical tab order that follows the visual layout. 4) Provide visible focus indicators. 5) Implement proper keyboard interactions (Enter/Space for buttons, arrow keys for navigation within components). 6) Manage focus appropriately for dynamic content. 7) Create skip links to bypass repetitive navigation. 8) Trap focus in modal dialogs. 9) Test your website using only a keyboard. 10) Ensure custom widgets follow WAI-ARIA Authoring Practices for keyboard patterns. These practices ensure that all users, regardless of ability or preference, can effectively use your website.",
            difficulty: "medium",
            tags: ["Accessibility", "Keyboard", "Implementation"],
          },
          {
            question:
              "What is focus management and why is it important for accessibility?",
            answer:
              "Focus management is the practice of controlling where keyboard focus moves within a web application, especially after user interactions or dynamic content changes. It's important for accessibility because: 1) It ensures keyboard users can navigate efficiently without getting lost. 2) It provides context to screen reader users about what's currently active. 3) It's essential for making dynamic content changes perceivable. Key aspects of focus management include: 1) Maintaining a logical tab order that matches visual layout. 2) Trapping focus within modal dialogs to prevent users from interacting with content behind them. 3) Returning focus to triggering elements when dialogs close. 4) Moving focus to newly revealed content when appropriate. 5) Providing skip links to bypass repetitive navigation. 6) Ensuring focus indicators are visible for all interactive elements. 7) Avoiding focus on non-interactive elements. 8) Managing focus during page transitions in single-page applications. Poor focus management can make a site completely unusable for keyboard-only users, as they may be unable to access certain functionality or become trapped in specific sections of the page.",
            difficulty: "hard",
            tags: ["Accessibility", "Focus", "UX"],
          },
          {
            question:
              "What are the best practices for implementing keyboard shortcuts in web applications?",
            answer:
              "Best practices for keyboard shortcuts in web applications: 1) Use standard shortcuts when possible (Ctrl+S for save, Ctrl+Z for undo). 2) Avoid overriding browser or screen reader shortcuts. 3) Make shortcuts discoverable through documentation, tooltips, or a help modal. 4) Allow users to customize or disable shortcuts to prevent conflicts. 5) Group related shortcuts logically. 6) Use modifier keys (Ctrl, Alt, Shift) to avoid accidental activation. 7) Consider international keyboard layouts when choosing shortcuts. 8) Provide visual feedback when shortcuts are activated. 9) Make all shortcut functionality also available through standard UI controls. 10) Test shortcuts with different browsers and assistive technologies. 11) Consider using the aria-keyshortcuts attribute to communicate available shortcuts. 12) Implement a shortcut help dialog accessible via '?' key. 13) For complex applications, consider implementing different shortcut modes (like Vim's normal/insert modes). 14) Ensure shortcuts work consistently across the entire application. These practices create a more efficient experience for power users while maintaining accessibility for all users.",
            difficulty: "medium",
            tags: ["Accessibility", "UX", "Keyboard Shortcuts"],
          },
        ]}
      />
    </div>
  );
}
