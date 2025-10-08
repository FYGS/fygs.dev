"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface SliderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "defaultValue" | "onValueChange"
  > {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue = [0],
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number[]>(
      value || defaultValue
    );
    const trackRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef(false);

    // Use controlled or uncontrolled value
    const currentValue = value !== undefined ? value : internalValue;

    // Memoize the onValueChange callback to prevent infinite re-renders
    const handleValueChange = React.useCallback(
      (newValue: number[]) => {
        if (!value) {
          setInternalValue(newValue);
        }
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      [onValueChange, value]
    );

    const getValueFromPosition = React.useCallback(
      (position: number) => {
        if (!trackRef.current) return min;

        const trackRect = trackRef.current.getBoundingClientRect();
        const trackWidth = trackRect.width;
        const percentage = Math.max(0, Math.min(1, position / trackWidth));
        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
      },
      [min, max, step]
    );

    // Use refs to avoid circular dependencies
    const handleMouseMoveRef = React.useRef<(event: MouseEvent) => void>(null);
    const handleMouseUpRef = React.useRef<() => void>(null);

    // Define handleMouseMove
    const handleMouseMove = React.useCallback(
      (event: MouseEvent) => {
        if (!isDragging.current || !trackRef.current) return;

        const trackRect = trackRef.current.getBoundingClientRect();
        const position = event.clientX - trackRect.left;
        const newValue = getValueFromPosition(position);
        handleValueChange([newValue]);
      },
      [getValueFromPosition, handleValueChange]
    );

    // Update ref
    React.useEffect(() => {
      handleMouseMoveRef.current = handleMouseMove;
    }, [handleMouseMove]);

    // Define handleMouseUp
    const handleMouseUp = React.useCallback(() => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMoveRef.current!);
      document.removeEventListener("mouseup", handleMouseUpRef.current!);
    }, []);

    // Update ref
    React.useEffect(() => {
      handleMouseUpRef.current = handleMouseUp;
    }, [handleMouseUp]);

    // Define handleMouseDown
    const handleMouseDown = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        isDragging.current = true;
        document.addEventListener("mousemove", handleMouseMoveRef.current!);
        document.addEventListener("mouseup", handleMouseUpRef.current!);

        // Update value on initial click
        if (trackRef.current) {
          const trackRect = trackRef.current.getBoundingClientRect();
          const position = event.clientX - trackRect.left;
          const newValue = getValueFromPosition(position);
          handleValueChange([newValue]);
        }
      },
      [disabled, getValueFromPosition, handleValueChange]
    );

    // Clean up event listeners on unmount
    React.useEffect(() => {
      return () => {
        if (handleMouseMoveRef.current && handleMouseUpRef.current) {
          document.removeEventListener("mousemove", handleMouseMoveRef.current);
          document.removeEventListener("mouseup", handleMouseUpRef.current);
        }
      };
    }, []);

    // Calculate the percentage for the thumb position
    const percentage = ((currentValue[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          ref={trackRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
          style={{ left: `calc(${percentage}% - 0.5rem)` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
