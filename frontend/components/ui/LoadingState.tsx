"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// 1. MorphingInfinity (Pure CSS Keyframe Animation, zero external animation dependencies)
// ─────────────────────────────────────────────────────────────────────────────
export function MorphingInfinity({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <>
      <style>{`
        @keyframes morphing-infinity-pulse {
          0%, 100% {
            stroke-dashoffset: 0;
            transform: scale(1);
          }
          50% {
            stroke-dashoffset: 48;
            transform: scale(1.08);
          }
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="status"
        aria-label="Loading"
        className={cn("size-6 text-[#1a6aef] origin-center", className)}
        style={{
          strokeDasharray: "40 8",
          animation: "morphing-infinity-pulse 3s ease-in-out infinite",
        }}
        {...props}
      >
        <path d="M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z" />
        <span className="sr-only">Loading</span>
      </svg>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Wave
// ─────────────────────────────────────────────────────────────────────────────
const WAVE_BAR_HEIGHTS = ["50%", "75%", "100%", "75%", "50%"] as const;

export function Wave({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.35);
          }
        }
      `}</style>
      <span
        role="status"
        className={cn(
          "inline-flex items-center justify-center gap-1 h-5 text-[#1a6aef]",
          className
        )}
        {...props}
      >
        {WAVE_BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="inline-block rounded-full bg-current w-1"
            style={{
              height,
              animation: "loading-ui-wave 1s ease-in-out infinite",
              animationDelay: `${index * 120}ms`,
            }}
          />
        ))}
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. WanderingEyes
// ─────────────────────────────────────────────────────────────────────────────
export type WanderingEyesProps = React.ComponentProps<"span"> & {
  eyeScale?: number;
  gapScale?: number;
  pupilScale?: number;
  blinkScale?: number;
  travelScale?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function WanderingEyes({
  className,
  style,
  eyeScale = 0.62,
  gapScale = 0.09,
  pupilScale = 0.32,
  blinkScale = 0.375,
  travelScale = 0.3125,
  ...props
}: WanderingEyesProps) {
  const safeEyeScale = clamp(eyeScale, 0.28, 0.7);
  const safeGapScale = clamp(gapScale, 0.04, 0.3);
  const safePupilScale = clamp(pupilScale, 0.12, 0.45);
  const safeBlinkScale = clamp(blinkScale, 0.15, 1);
  const safeTravelScale = clamp(travelScale, 0.08, 0.5);

  const eyesStyle = {
    ...style,
    "--loading-ui-wandering-eyes-eye": `${(safeEyeScale * 100).toFixed(2)}cqmin`,
    "--loading-ui-wandering-eyes-gap": `${(safeGapScale * 100).toFixed(2)}cqmin`,
    "--loading-ui-wandering-eyes-pupil-scale": `${safePupilScale}`,
    "--loading-ui-wandering-eyes-blink": `${safeBlinkScale}`,
    "--loading-ui-wandering-eyes-travel-scale": `${safeTravelScale}`,
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        @keyframes loading-ui-wandering-eyes-move {
          0%, 10% { background-position: 0 0; }
          13%, 40% { background-position: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale) * -1) 0; }
          43%, 70% { background-position: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale)) 0; }
          73%, 90% { background-position: 0 calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale)); }
          93%, 100% { background-position: 0 0; }
        }

        @keyframes loading-ui-wandering-eyes-blink {
          0%, 10%, 12%, 20%, 22%, 40%, 42%, 60%, 62%, 70%, 72%, 90%, 92%, 98%, 100% {
            height: var(--loading-ui-wandering-eyes-eye);
          }
          11%, 21%, 41%, 61%, 71%, 91%, 99% {
            height: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-blink));
          }
        }
      `}</style>
      <span
        role="status"
        className={cn(
          "@container-[size] relative inline-flex aspect-9/4 items-center justify-center align-middle [--eye-color:color-mix(in_srgb,currentColor_16%,transparent)] [--pupil-color:currentColor] text-[#1a6aef] w-12 h-6",
          className
        )}
        style={eyesStyle}
        {...props}
      >
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center gap-(--loading-ui-wandering-eyes-gap)"
        >
          {Array.from({ length: 2 }, (_, index) => (
            <span
              key={index}
              className="inline-block rounded-full"
              style={{
                width: "var(--loading-ui-wandering-eyes-eye)",
                height: "var(--loading-ui-wandering-eyes-eye)",
                backgroundColor: "var(--eye-color)",
                backgroundImage:
                  "radial-gradient(circle calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-pupil-scale)), var(--pupil-color) 100%, transparent 0)",
                backgroundRepeat: "no-repeat",
                animation:
                  "loading-ui-wandering-eyes-move var(--duration, 8s) infinite, loading-ui-wandering-eyes-blink var(--duration, 8s) infinite",
              }}
            />
          ))}
        </span>
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AnalyzingImage
// ─────────────────────────────────────────────────────────────────────────────
export function AnalyzingImage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <>
      <style>{`
        @keyframes analyzing-scan-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(1100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes analyzing-reveal {
          0%, 100% { clip-path: inset(0% 0% 0% 0%); }
          50% { clip-path: inset(0% 100% 0% 0%); }
        }
      `}</style>
      <div
        role="status"
        aria-label="Analyzing tender verification"
        className={cn("relative isolate shrink-0 size-8 text-[#1a6aef] overflow-hidden", className)}
        {...props}
      >
        <div
          className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-900/90"
          style={{ animation: "analyzing-reveal 2.4s ease-in-out infinite" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-full"
          >
            <path
              d="M4.27 20.73L10.87 14.13a1.5 1.5 0 012.12 0l6.55 6.55M14 15l2.87-2.87a1.5 1.5 0 012.12 0L22 15M10 9a1 1 0 11-2 0 1 1 0 012 0zM6.8 21h10.4c1.68 0 2.52 0 3.16-.33a3 3 0 001.31-1.31c.33-.64.33-1.48.33-3.16V7.8c0-1.68 0-2.52-.33-3.16a3 3 0 00-1.31-1.31C20.36 3 19.52 3 17.2 3H6.8c-1.68 0-2.52 0-3.16.33a3 3 0 00-1.31 1.31C2 5.28 2 6.12 2 7.8v8.4c0 1.68 0 2.52.33 3.16a3 3 0 001.31 1.31c.64.33 1.48.33 3.16.33z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          className="absolute z-20 h-full w-[10%] rounded-full bg-current opacity-85 shadow-[0_0_8px_currentColor]"
          style={{ animation: "analyzing-scan-bar 2.4s ease-in-out infinite" }}
        />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full opacity-60"
        >
          <path
            d="M6.8 21h10.4c1.68 0 2.52 0 3.16-.33a3 3 0 001.31-1.31c.33-.64.33-1.48.33-3.16V7.8c0-1.68 0-2.52-.33-3.16a3 3 0 00-1.31-1.31C20.36 3 19.52 3 17.2 3H6.8c-1.68 0-2.52 0-3.16.33a3 3 0 00-1.31 1.31C2 5.28 2 6.12 2 7.8v8.4c0 1.68 0 2.52.33 3.16a3 3 0 001.31 1.31c.64.33 1.48.33 3.16.33z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="6" y="19" width="1" height="1" fill="currentColor" />
          <rect x="7" y="18" width="1" height="1" fill="currentColor" />
          <rect x="7" y="19" width="3" height="1" fill="currentColor" />
          <rect x="14" y="19" width="3" height="1" fill="currentColor" />
          <rect x="10" y="9" width="1" height="1" fill="currentColor" />
          <rect x="12" y="11" width="1" height="1" fill="currentColor" />
          <rect x="16" y="12" width="1" height="2" fill="currentColor" />
          <rect x="13" y="14" width="1" height="1" fill="currentColor" />
        </svg>
        <span className="sr-only">Analyzing</span>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Spiral
// ─────────────────────────────────────────────────────────────────────────────
export function Spiral({
  dots = 8,
  radius = 31.25,
  className,
  ...props
}: React.ComponentProps<"span"> & { dots?: number; radius?: number }) {
  return (
    <>
      <style>{`
        @keyframes loading-spiral-pulse {
          0%, 100% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      <span
        role="status"
        className={cn("relative inline-block size-6 text-[#1a6aef]", className)}
        {...props}
      >
        {Array.from({ length: dots }, (_, index) => {
          const angle = (index / dots) * (2 * Math.PI);
          const x = `${50 + radius * Math.cos(angle)}%`;
          const y = `${50 + radius * Math.sin(angle)}%`;

          return (
            <span
              key={index}
              aria-hidden="true"
              className="absolute inline-block rounded-full bg-current"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                width: `${140 / dots}%`,
                height: `${140 / dots}%`,
                animation: "loading-spiral-pulse 1.4s ease-in-out infinite",
                animationDelay: `${(index / dots) * 1.4}s`,
              }}
            />
          );
        })}
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Classic
// ─────────────────────────────────────────────────────────────────────────────
export type ClassicProps = Omit<React.ComponentProps<"span">, "children">;

export function Classic({ className, ...props }: ClassicProps) {
  return (
    <>
      <style>{`
        @keyframes loading-ui-classic-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
      <span
        role="status"
        className={cn("box-border inline-block size-5 text-[#1a6aef]", className)}
        {...props}
      >
        <span
          aria-hidden="true"
          className="relative top-1/2 left-1/2 block size-full"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="absolute top-[-3.9%] left-[-10%] block h-[8%] w-[24%] rounded-full bg-current"
              style={{
                transform: `rotate(${index * 30}deg) translate(146%)`,
                animation:
                  "loading-ui-classic-fade 1.1s linear infinite",
                animationDelay: `calc(1.1s / 12 * ${index - 12})`,
              }}
            />
          ))}
        </span>
        <span className="sr-only">Loading</span>
      </span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. FadeArc
// ─────────────────────────────────────────────────────────────────────────────
export function FadeArc({ className, style, ...props }: React.ComponentProps<"svg">) {
  const baseId = useId().replace(/:/g, "");
  const leadingGradientId = `${baseId}-leading`;
  const trailingGradientId = `${baseId}-trailing`;

  return (
    <>
      <style>{`
        @keyframes loading-ui-fade-arc-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="status"
        className={cn("size-6 text-[#1a6aef]", className)}
        style={{
          animationName: "loading-ui-fade-arc-spin",
          animationDuration: "1s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          ...style,
        }}
        {...props}
      >
        <defs>
          <linearGradient
            id={leadingGradientId}
            x1="50%"
            x2="50%"
            y1="5.271%"
            y2="91.793%"
          >
            <stop offset="0%" stopColor="currentColor" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient
            id={trailingGradientId}
            x1="50%"
            x2="50%"
            y1="15.24%"
            y2="87.15%"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <g fill="none">
          <path
            d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021"
            fill={`url(#${leadingGradientId})`}
            transform="translate(1.5 1.625)"
          />
          <path
            d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118"
            fill={`url(#${trailingGradientId})`}
            transform="translate(1.5 1.625)"
          />
        </g>
      </svg>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RadarSweepLoader (BidSure AI Defense & Tender Verification Scanner)
// ─────────────────────────────────────────────────────────────────────────────
export function RadarSweepLoader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <>
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        role="status"
        className={cn(
          "relative size-12 rounded-full border border-blue-500/30 bg-blue-950/20 overflow-hidden flex items-center justify-center",
          className
        )}
        {...props}
      >
        {/* Radar Range Rings */}
        <div className="absolute inset-1 rounded-full border border-blue-500/20" />
        <div className="absolute inset-3 rounded-full border border-blue-500/20" />
        <div className="absolute w-full h-[1px] bg-blue-500/20" />
        <div className="absolute h-full w-[1px] bg-blue-500/20" />

        {/* Sweep beam */}
        <div
          className="absolute inset-0 origin-center"
          style={{
            animation: "radar-sweep 2s linear infinite",
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(26, 106, 239, 0.4) 360deg)",
          }}
        />
        <div className="size-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#1a6aef]" />
        <span className="sr-only">Scanning intelligence verification</span>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. FullScreenLoader (Ready-to-use overlay with BidSure AI branding)
// ─────────────────────────────────────────────────────────────────────────────
export interface FullScreenLoaderProps {
  message?: string;
  variant?: "eyes" | "infinity" | "wave" | "arc" | "spiral" | "analyzing" | "classic" | "radar";
}

export function FullScreenLoader({
  message = "Loading procurement intelligence data...",
  variant = "eyes",
}: FullScreenLoaderProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex items-center justify-center">
        {variant === "eyes" && <WanderingEyes className="w-16 h-8 text-[#1a6aef]" />}
        {variant === "infinity" && <MorphingInfinity className="size-10 text-[#1a6aef]" />}
        {variant === "wave" && <Wave className="h-8 text-[#1a6aef]" />}
        {variant === "arc" && <FadeArc className="size-10 text-[#1a6aef]" />}
        {variant === "spiral" && <Spiral className="size-10 text-[#1a6aef]" />}
        {variant === "analyzing" && <AnalyzingImage className="size-10 text-[#1a6aef]" />}
        {variant === "classic" && <Classic className="size-8 text-[#1a6aef]" />}
        {variant === "radar" && <RadarSweepLoader className="size-14" />}
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. InlineLoader
// ─────────────────────────────────────────────────────────────────────────────
export function InlineLoader({
  text = "Processing...",
  variant = "wave",
  className,
}: {
  text?: string;
  variant?: "wave" | "arc" | "eyes" | "classic" | "spiral" | "radar";
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400", className)}>
      {variant === "wave" && <Wave className="h-4" />}
      {variant === "arc" && <FadeArc className="size-4" />}
      {variant === "eyes" && <WanderingEyes className="w-8 h-4" />}
      {variant === "classic" && <Classic className="size-4" />}
      {variant === "spiral" && <Spiral className="size-4" />}
      {variant === "radar" && <RadarSweepLoader className="size-4" />}
      <span>{text}</span>
    </div>
  );
}
