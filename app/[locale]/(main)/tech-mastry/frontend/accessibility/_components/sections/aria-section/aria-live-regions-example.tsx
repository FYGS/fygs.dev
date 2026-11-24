import { CodeExample } from "../../ui/code-example";

export function AriaLiveRegionsExample() {
  return (
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
              displays the progress of a task (not a live region: updates are
              exposed through <code>aria-valuenow</code>)
            </li>
            <li>
              <code>role=&quot;timer&quot;</code>: A countdown timer or
              stopwatch (a live region with implicit{" "}
              <code>aria-live=&quot;off&quot;</code>)
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
  );
}
