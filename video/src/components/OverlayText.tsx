import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";

interface OverlayTextProps {
  text: string;
  startFrame: number;
  duration: number;
  subtitle?: string;
}

export const OverlayText: React.FC<OverlayTextProps> = ({ text, startFrame, duration, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame > duration) return null;

  const enter = spring({ frame: localFrame, fps, config: { damping: 80, mass: 0.8 } });
  const exit = localFrame > duration - 20
    ? interpolate(localFrame, [duration - 20, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const opacity = enter * exit;
  const translateY = interpolate(enter, [0, 1], [40, 0]);

  return (
    <div style={{
      position: "absolute", bottom: 70, left: 0, right: 0,
      display: "flex", justifyContent: "center", zIndex: 100,
      opacity, transform: `translateY(${translateY}px)`,
    }}>
      <div style={{
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(12px)",
        padding: "24px 56px",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
      }}>
        <div style={{
          color: "#FFFFFF", fontSize: 34, fontWeight: 700,
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          {text}
        </div>
        {subtitle && (
          <div style={{
            color: "rgba(148,163,184,0.9)", fontSize: 16, fontWeight: 400,
            marginTop: 8, letterSpacing: "0.02em",
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
