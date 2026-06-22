import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface AnimatedCursorProps {
  path: Array<{ x: number; y: number; frame: number }>;
  clickFrames?: number[];
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({ path, clickFrames = [] }) => {
  const frame = useCurrentFrame();
  const frames = path.map((p) => p.frame);
  const xs = path.map((p) => p.x);
  const ys = path.map((p) => p.y);

  if (frame < frames[0] || frame > frames[frames.length - 1] + 30) return null;

  const x = interpolate(frame, frames, xs, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, frames, ys, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const isClicking = clickFrames.some((cf) => frame >= cf && frame < cf + 6);
  const clickRing = clickFrames.some((cf) => frame >= cf && frame < cf + 15);
  const ringProgress = clickFrames.reduce((acc, cf) => {
    if (frame >= cf && frame < cf + 15) return (frame - cf) / 15;
    return acc;
  }, 0);

  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 9999, pointerEvents: "none" }}>
      {clickRing && (
        <div style={{
          position: "absolute", left: -20, top: -20,
          width: 40, height: 40, borderRadius: "50%",
          border: "2px solid rgba(3, 105, 161, 0.6)",
          transform: `scale(${1 + ringProgress * 1.5})`,
          opacity: 1 - ringProgress,
        }} />
      )}
      <svg width="28" height="28" viewBox="0 0 28 28" style={{
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        transform: `scale(${isClicking ? 0.82 : 1})`,
        transition: "transform 0.05s",
      }}>
        <path
          d="M7 2L22 13L14 15.5L10 24L7 2Z"
          fill="white" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
