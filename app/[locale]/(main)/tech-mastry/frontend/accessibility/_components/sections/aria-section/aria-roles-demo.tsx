"use client";

import { useState } from "react";

// Demo component for ARIA roles and attributes
export function AriaRolesDemo() {
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
