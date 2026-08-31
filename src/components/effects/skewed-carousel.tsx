"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, type PanInfo, type Transition } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SkewedCarouselItem {
  src: string;
  title: string;
  alt?: string;
}

export interface SkewedCarouselProps {
  items?: SkewedCarouselItem[];
  initialIndex?: number;
  cardWidth?: number;
  /** Horizontal gap between slides in pixels */
  cardGap?: number;
  aspectRatio?: string;
  rotation?: number;
  inactiveScale?: number;
  perspective?: number;
  borderRadius?: number;
  titleBlur?: number;
  speed?: number;
  showTitles?: boolean;
  showControls?: boolean;
  showDots?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  enableDrag?: boolean;
  enableKeyboard?: boolean;
  className?: string;
  onIndexChange?: (index: number) => void;
}

const FLICK_DISTANCE = 45;
const FLICK_WEIGHT = 0.08;

const settle = (value: number, count: number, wrap: boolean) => {
  if (count < 1) return 0;
  if (wrap) return ((value % count) + count) % count;
  return value < 0 ? 0 : value > count - 1 ? count - 1 : value;
};

const spring = (
  bounce: number,
  seconds: number,
  speed: number,
): Transition => ({
  type: "spring",
  bounce,
  duration: seconds * speed,
});

interface SlideProps {
  item: SkewedCarouselItem;
  offset: number;
  focused: boolean;
  width: number;
  aspectRatio: string;
  rotation: number;
  scale: number;
  perspective: number;
  radius: number;
  blur: number;
  gap: number;
  isLast: boolean;
  captioned: boolean;
  transition: Transition;
  onPick: () => void;
}

function Slide({
  item,
  offset,
  focused,
  width,
  aspectRatio,
  rotation,
  scale,
  perspective,
  radius,
  blur,
  gap,
  isLast,
  captioned,
  transition,
  onPick,
}: SlideProps) {
  return (
    <div
      style={{
        perspective,
        marginRight: isLast ? 0 : gap,
      }}
    >
      <motion.div
        className="will-change-[transform,scale]"
        style={{ width, aspectRatio }}
        animate={{ rotateY: offset * -rotation, scale: focused ? 1 : scale }}
        transition={transition}
      >
        <button
          type="button"
          onClick={onPick}
          tabIndex={focused ? 0 : -1}
          aria-label={item.title}
          aria-current={focused}
          style={{ borderRadius: radius }}
          className="relative block h-full w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0 shadow-[0_12px_40px_-8px_rgb(0_0_0/0.55)] outline-none ring-1 ring-white/10 transition-shadow duration-300 hover:shadow-[0_16px_48px_-6px_rgb(0_0_0/0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cinnabar"
        >
          <img
            src={item.src}
            alt={item.alt ?? item.title}
            draggable={false}
            className="h-full w-full object-cover object-top"
            style={{ borderRadius: radius }}
          />

          {captioned && (
            <>
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                animate={{ opacity: focused ? 1 : 0 }}
                transition={transition}
              />
              <motion.span
                aria-hidden={!focused}
                className="pointer-events-none absolute inset-x-0 bottom-0 block px-3.5 pb-3 text-left font-serif text-sm font-medium leading-snug tracking-[0.08em] text-rice-text"
                style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.35)" }}
                animate={{
                  opacity: focused ? 1 : 0,
                  filter: `blur(${focused ? 0 : blur}px)`,
                  y: focused ? 0 : 10,
                }}
                transition={transition}
              >
                {item.title}
              </motion.span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}

interface RailProps {
  items: SkewedCarouselItem[];
  current: number;
  token: string;
  transition: Transition;
  onPick: (index: number) => void;
}

function Rail({ items, current, token, transition, onPick }: RailProps) {
  return (
    <div className="flex w-44 items-center gap-1.5 sm:w-56">
      {items.map((item, index) => (
        <button
          key={`rail-${item.src}-${index}`}
          type="button"
          onClick={() => onPick(index)}
          aria-label={`Show ${item.title}`}
          aria-current={index === current}
          className="relative h-0.5 flex-1 cursor-pointer rounded-full bg-current/25 transition-colors duration-200 before:absolute before:-inset-y-2.5 before:inset-x-0 before:content-[''] hover:bg-current/50"
        >
          {index === current && (
            <motion.span
              layoutId={token}
              className="absolute inset-0 rounded-full bg-cinnabar"
              transition={transition}
            />
          )}
        </button>
      ))}
    </div>
  );
}

function Arrow({
  side,
  disabled,
  onPress,
}: {
  side: "prev" | "next";
  disabled: boolean;
  onPress: () => void;
}) {
  const Glyph = side === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={side === "prev" ? "Previous slide" : "Next slide"}
      className="cursor-pointer p-1 text-current opacity-40 transition-opacity duration-200 hover:opacity-100 disabled:pointer-events-none disabled:opacity-15"
    >
      <Glyph size={16} strokeWidth={2.25} />
    </button>
  );
}

export function SkewedCarousel({
  items = [],
  initialIndex = 0,
  cardWidth = 200,
  cardGap = 0,
  aspectRatio = "3 / 4",
  rotation = 60,
  inactiveScale = 0.85,
  perspective = 800,
  borderRadius = 8,
  titleBlur = 2,
  speed = 1,
  showTitles = true,
  showControls = true,
  showDots = true,
  loop = false,
  autoplay = false,
  autoplayDelay = 3000,
  enableDrag = true,
  enableKeyboard = true,
  className,
  onIndexChange,
}: SkewedCarouselProps) {
  const count = items.length;
  const token = useId();
  const [focused, setFocused] = useState(() =>
    settle(initialIndex, count, false),
  );
  const report = useRef(onIndexChange);

  useEffect(() => {
    report.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    report.current?.(focused);
  }, [focused]);

  const focusSlide = useCallback(
    (index: number) => setFocused(settle(index, count, loop)),
    [count, loop],
  );

  const step = useCallback(
    (delta: number) => setFocused((from) => settle(from + delta, count, loop)),
    [count, loop],
  );

  useEffect(() => {
    if (!autoplay || count <= 1) return;
    const tick = window.setInterval(
      () =>
        setFocused((from) =>
          from + 1 >= count && !loop ? from : settle(from + 1, count, loop),
        ),
      Math.max(autoplayDelay, 400),
    );
    return () => window.clearInterval(tick);
  }, [autoplay, autoplayDelay, count, loop]);

  const motions = useMemo(
    () => ({
      strip: spring(0.2, 0.8, speed),
      card: spring(0.1, 1, speed),
      rail: spring(0.25, 0.5, speed),
    }),
    [speed],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboard) return;
    const delta =
      event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (!delta) return;
    event.preventDefault();
    step(delta);
  };

  const onPanEnd = (_: unknown, info: PanInfo) => {
    const thrown = info.offset.x + info.velocity.x * FLICK_WEIGHT;
    if (Math.abs(thrown) < FLICK_DISTANCE) return;
    step(thrown < 0 ? 1 : -1);
  };

  const head = !loop && focused === 0;
  const tail = !loop && focused >= count - 1;

  if (count === 0) return null;

  const slideStride = cardWidth + cardGap;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Team member carousel"
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex w-full select-none flex-col items-center overflow-visible text-current outline-none",
        className,
      )}
    >
      <div className="w-full overflow-visible">
        <div
          className="mx-auto overflow-visible"
          style={{ width: cardWidth }}
        >
          <motion.div
            className="flex w-fit"
            style={{ touchAction: "pan-y" }}
            animate={{ x: -focused * slideStride }}
            transition={motions.strip}
            onPanEnd={enableDrag ? onPanEnd : undefined}
          >
            {items.map((item, index) => (
              <Slide
                key={`${item.src}-${index}`}
                item={item}
                offset={index - focused}
                focused={index === focused}
                width={cardWidth}
                aspectRatio={aspectRatio}
                rotation={rotation}
                scale={inactiveScale}
                perspective={perspective}
                radius={borderRadius}
                blur={titleBlur}
                gap={cardGap}
                isLast={index === count - 1}
                captioned={showTitles}
                transition={motions.card}
                onPick={() => focusSlide(index)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {(showControls || showDots) && count > 1 && (
        <div className="mt-9 flex items-center gap-4">
          {showControls && (
            <Arrow side="prev" disabled={head} onPress={() => step(-1)} />
          )}
          {showDots && (
            <Rail
              items={items}
              current={focused}
              token={token}
              transition={motions.rail}
              onPick={focusSlide}
            />
          )}
          {showControls && (
            <Arrow side="next" disabled={tail} onPress={() => step(1)} />
          )}
        </div>
      )}
    </div>
  );
}
