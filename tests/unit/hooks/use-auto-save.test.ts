/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSave } from "@/hooks/use-auto-save";

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with idle status", () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() =>
      useAutoSave({ data: { title: "test" }, onSave, delay: 500 }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.lastSaved).toBeNull();
  });

  it("does not save on initial render", () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    renderHook(() =>
      useAutoSave({ data: { title: "test" }, onSave, delay: 500 }),
    );

    vi.advanceTimersByTime(1000);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("saves after delay when data changes", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const { rerender } = renderHook(
      ({ data }) => useAutoSave({ data, onSave, delay: 500 }),
      { initialProps: { data: { title: "initial" } } },
    );

    // Change data
    rerender({ data: { title: "updated" } });

    // Not yet called (within delay)
    expect(onSave).not.toHaveBeenCalled();

    // Advance past delay
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(onSave).toHaveBeenCalledWith({ title: "updated" });
  });

  it("debounces multiple rapid changes", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const { rerender } = renderHook(
      ({ data }) => useAutoSave({ data, onSave, delay: 500 }),
      { initialProps: { data: { title: "v1" } } },
    );

    rerender({ data: { title: "v2" } });
    vi.advanceTimersByTime(200);

    rerender({ data: { title: "v3" } });
    vi.advanceTimersByTime(200);

    rerender({ data: { title: "v4" } });

    // Advance past delay from last change
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Should only save once with latest value
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({ title: "v4" });
  });

  it("does not save when disabled", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const { rerender } = renderHook(
      ({ data, enabled }) => useAutoSave({ data, onSave, delay: 500, enabled }),
      { initialProps: { data: { title: "v1" }, enabled: false } },
    );

    rerender({ data: { title: "v2" }, enabled: false });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("sets status to saving then saved on success", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: true });
    const { result, rerender } = renderHook(
      ({ data }) => useAutoSave({ data, onSave, delay: 500 }),
      { initialProps: { data: { title: "v1" } } },
    );

    rerender({ data: { title: "v2" } });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.status).toBe("saved");
    expect(result.current.lastSaved).not.toBeNull();
  });

  it("sets status to error on failure", async () => {
    const onSave = vi.fn().mockResolvedValue({ success: false, error: "fail" });
    const { result, rerender } = renderHook(
      ({ data }) => useAutoSave({ data, onSave, delay: 500 }),
      { initialProps: { data: { title: "v1" } } },
    );

    rerender({ data: { title: "v2" } });

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.status).toBe("error");
  });
});
