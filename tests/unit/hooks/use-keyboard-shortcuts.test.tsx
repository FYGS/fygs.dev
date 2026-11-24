import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isTypingTarget, useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

function press(target: Element | Window, init: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const mount = () => {
    const go = vi.fn();
    const theme = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts([
        { key: "r", action: go, description: "resume" },
        { key: "d", command: true, shift: true, action: theme, description: "dark" },
      ]),
    );
    return { go, theme };
  };

  it("runs a plain letter shortcut on the page", () => {
    const { go } = mount();
    const event = press(document.body, { key: "r" });
    expect(go).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("never fires while typing in a field, a textarea or the rich-text editor", () => {
    const { go } = mount();
    const input = document.createElement("input");
    const area = document.createElement("textarea");
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    const paragraph = document.createElement("p");
    editor.append(paragraph);
    document.body.append(input, area, editor);
    for (const target of [input, area, editor, paragraph]) press(target, { key: "r" });
    expect(go).not.toHaveBeenCalled();
  });

  it("leaves the browser's own combinations alone (Ctrl+R reloads, Alt+R is not ours)", () => {
    const { go } = mount();
    const reload = press(document.body, { key: "r", ctrlKey: true });
    press(document.body, { key: "r", altKey: true });
    press(document.body, { key: "r", metaKey: true });
    expect(go).not.toHaveBeenCalled();
    expect(reload.defaultPrevented).toBe(false);
  });

  it("still runs the command shortcuts, which need the modifier and shift", () => {
    const { theme } = mount();
    press(document.body, { key: "d", ctrlKey: true });
    expect(theme).not.toHaveBeenCalled();
    press(document.body, { key: "d", ctrlKey: true, shiftKey: true });
    expect(theme).toHaveBeenCalledTimes(1);
  });
});

describe("isTypingTarget", () => {
  it("recognises widgets that take typing", () => {
    const box = document.createElement("div");
    box.setAttribute("role", "textbox");
    const select = document.createElement("select");
    expect(isTypingTarget(box)).toBe(true);
    expect(isTypingTarget(select)).toBe(true);
    expect(isTypingTarget(document.createElement("button"))).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
