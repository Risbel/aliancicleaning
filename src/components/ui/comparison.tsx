"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";
import type React from "react";
import { createContext, useContext, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ComparisonMode = "drag" | "hover";

interface ComparisonContextValue {
  /** Moves the divider and ends the change at once (a key press). */
  commit: (next: number) => void;
  mode: ComparisonMode;
  step: number;
  value: number;
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

const useComparison = () => {
  const context = useContext(ComparisonContext);

  if (!context) {
    throw new Error("Comparison parts must be used within Comparison");
  }

  return context;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

/** Where a pointer at `x` is across the box, 0 at its start edge, in percent. */
const percentAt = (x: number, rect: DOMRect, rtl: boolean) =>
  clampPercent(
    ((rtl ? rect.right - x : x - rect.left) / Math.max(1, rect.width)) * 100
  );

/**
 * The value a key moves the divider to, or `null` for a key it ignores.
 * The arrows move it the way they point, in either direction of text.
 */
const keyValue = (
  key: string,
  value: number,
  step: number,
  rtl: boolean,
  large: boolean
) => {
  const by = large ? step * 10 : step;
  const moves: Record<string, number> = {
    ArrowDown: value - by,
    ArrowLeft: rtl ? value + by : value - by,
    ArrowRight: rtl ? value - by : value + by,
    ArrowUp: value + by,
    End: 100,
    Home: 0,
    PageDown: value - step * 10,
    PageUp: value + step * 10,
  };
  const next = moves[key];

  return next === undefined ? null : clampPercent(next);
};

export interface ComparisonProps
  extends Omit<React.ComponentProps<"div">, "defaultValue"> {
  /**
   * Where the divider starts when uncontrolled, in percent from the start
   * edge.
   *
   * @default 50
   */
  defaultValue?: number;
  /**
   * `drag` moves the divider while a pointer is pressed (a click jumps it
   * there); `hover` follows a mouse without a press. Touch drags in both.
   *
   * @default "drag"
   */
  mode?: ComparisonMode;
  /** Called with the new position, in percent, as the divider moves. */
  onValueChange?: (value: number) => void;
  /** Called with the position once a drag or a key press ends. */
  onValueChangeEnd?: (value: number) => void;
  /**
   * How far an arrow key moves the divider, in percent; Shift, Page Up and
   * Page Down move ten times as far.
   *
   * @default 1
   */
  step?: number;
  /** The divider's position, in percent from the start edge (controlled). */
  value?: number;
}

/**
 * Two layers stacked in one box, split by a divider you drag: the start
 * item shows on the divider's start side, the end item on its end side.
 * The position is one CSS variable on the box; the layers clip to it.
 *
 * @cssvar --comparison-position The divider's place from the start edge (`50%`).
 */
export const Comparison = (props: ComparisonProps) => {
  const {
    children,
    className,
    defaultValue = 50,
    mode = "drag",
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    onValueChange,
    onValueChangeEnd,
    step = 1,
    style,
    value: valueProp,
    ...rest
  } = props;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  // Read by the handlers: the state can lag a pointer event behind.
  const pressed = useRef<boolean>(false);
  const latest = useRef(defaultValue);

  const value = clampPercent(valueProp ?? uncontrolled);

  const update = (next: number) => {
    latest.current = next;
    setUncontrolled(next);
    onValueChange?.(next);
  };

  const commit = (next: number) => {
    update(next);
    onValueChangeEnd?.(next);
  };

  const follow = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = event.currentTarget;
    update(
      percentAt(
        event.clientX,
        node.getBoundingClientRect(),
        node.matches(":dir(rtl)")
      )
    );
  };

  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (event.button !== 0) {
      return;
    }
    // A mouse in hover mode needs no press; everything else drags.
    if (mode === "hover" && event.pointerType === "mouse") {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    pressed.current = true;
    setDragging(true);
    follow(event);
  };

  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (
      pressed.current ||
      (mode === "hover" && event.pointerType === "mouse")
    ) {
      follow(event);
    }
  };

  const release = () => {
    if (pressed.current) {
      pressed.current = false;
      setDragging(false);
      onValueChangeEnd?.(latest.current);
    }
  };

  const pointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event);
    release();
  };

  const pointerLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    if (mode === "hover" && event.pointerType === "mouse" && !pressed.current) {
      onValueChangeEnd?.(latest.current);
    }
  };

  return (
    <ComparisonContext.Provider value={{ commit, mode, step, value }}>
      <div
        className={cn(
          "group/comparison relative isolate aspect-video w-full select-none overflow-hidden",
          "touch-pan-y data-dragging:cursor-grabbing",
          className
        )}
        data-dragging={dragging ? "" : undefined}
        data-mode={mode}
        data-slot="comparison"
        onLostPointerCapture={release}
        onPointerDown={pointerDown}
        onPointerLeave={pointerLeave}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        style={
          {
            "--comparison-position": `${value}%`,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        {children}
      </div>
    </ComparisonContext.Provider>
  );
};

/** Each side's clip, in either direction of text. */
const CLIPS = {
  end: "[clip-path:inset(0_0_0_var(--comparison-position))] rtl:[clip-path:inset(0_var(--comparison-position)_0_0)]",
  start:
    "[clip-path:inset(0_calc(100%-var(--comparison-position))_0_0)] rtl:[clip-path:inset(0_0_0_calc(100%-var(--comparison-position)))]",
};

export interface ComparisonItemProps extends React.ComponentProps<"div"> {
  /**
   * The divider's side this layer shows on: `start` (left in left-to-right
   * text) or `end`.
   */
  position: "start" | "end";
}

export const ComparisonItem = (props: ComparisonItemProps) => {
  const { className, position, ...rest } = props;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0",
        CLIPS[position],
        className
      )}
      data-position={position}
      data-slot="comparison-item"
      {...rest}
    />
  );
};

/**
 * The divider, and the slider that moves it: focus it and use the arrow
 * keys, Page Up and Page Down, Home and End. Without children it draws a
 * line with a grip (the grip shows in hover mode only while focused).
 */
export const ComparisonHandle = (props: React.ComponentProps<"div">) => {
  const {
    "aria-label": ariaLabel,
    children,
    className,
    onKeyDown,
    ...rest
  } = props;
  const { commit, mode, step, value } = useComparison();

  const keyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const next = keyValue(
      event.key,
      value,
      step,
      event.currentTarget.matches(":dir(rtl)"),
      event.shiftKey
    );
    if (next !== null) {
      event.preventDefault();
      commit(next);
    }
  };

  return (
    <div
      aria-label={ariaLabel ?? "Divider position"}
      aria-orientation="horizontal"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${Math.round(value)}%`}
      className={cn(
        "group/comparison-handle absolute inset-y-0 start-(--comparison-position) z-10 w-10",
        "flex -translate-x-1/2 items-center justify-center rtl:translate-x-1/2",
        "outline-none",
        mode === "drag" &&
          "cursor-grab group-data-dragging/comparison:cursor-grabbing",
        className
      )}
      data-slot="comparison-handle"
      onKeyDown={keyDown}
      role="slider"
      tabIndex={0}
      {...rest}
    >
      {children ?? (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 inset-y-0 mx-auto w-1 bg-background shadow-xs ring-1 ring-foreground/10"
            data-slot="comparison-handle-line"
          />
          <span
            aria-hidden="true"
            className={cn(
              "relative z-10 flex items-center justify-center rounded-sm bg-background px-0.5 py-1 shadow-sm",
              "group-focus-visible/comparison-handle:flex! group-data-[mode=hover]/comparison:hidden",
              "group-focus-visible/comparison-handle:ring-[3px] group-focus-visible/comparison-handle:ring-ring/50"
            )}
            data-slot="comparison-handle-grip"
          >
            <HugeiconsIcon
              icon={DragDropVerticalIcon}
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          </span>
        </>
      )}
    </div>
  );
};
