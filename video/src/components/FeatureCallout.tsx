import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { theme } from "../lib/theme";

// Animated feature badge strip — shows feature descriptions in sequence
interface FeatureBadge {
  icon: string;
  label: string;
}

interface FeatureCalloutProps {
  features: FeatureBadge[];
  startFrame: number;
  stagger?: number;
  position?: "top" | "bottom";
}

export const FeatureCallout: React.FC<FeatureCalloutProps> = ({
  features, startFrame, stagger = 12, position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      position: "absolute",
      [position === "top" ? "top" : "bottom"]: position === "top" ? 20 : 140,
      left: 0, right: 0, display: "flex", justifyContent: "center",
      gap: 10, flexWrap: "wrap", padding: "0 40px", zIndex: 90,
    }}>
      {features.map((feat, i) => {
        const localFrame = frame - startFrame - i * stagger;
        if (localFrame < 0) return null;
        const enter = spring({ frame: localFrame, fps, config: { damping: 80, mass: 0.6 } });
        const exitStart = startFrame + features.length * stagger + 80;
        const exit = frame > exitStart
          ? interpolate(frame, [exitStart, exitStart + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 1;
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            backgroundColor: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(3, 105, 161, 0.3)",
            opacity: enter * exit,
            transform: `translateY(${(1 - enter) * 15}px) scale(${0.9 + 0.1 * enter})`,
          }}>
            <span style={{ fontSize: 14 }}>{feat.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "white", whiteSpace: "nowrap" }}>
              {feat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Scene title that appears at the start of each scene
interface SceneTitleProps {
  title: string;
  subtitle: string;
  startFrame: number;
  accentColor?: string;
}

export const SceneTitle: React.FC<SceneTitleProps> = ({
  title, subtitle, startFrame, accentColor = theme.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > 90) return null;

  const enter = spring({ frame: localFrame, fps, config: { damping: 80 } });
  const exit = localFrame > 65
    ? interpolate(localFrame, [65, 90], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  return (
    <div style={{
      position: "absolute", top: 16, right: 32, zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "flex-end",
      opacity: enter * exit,
      transform: `translateX(${(1 - enter) * 30}px)`,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
        color: accentColor, marginBottom: 4,
      }}>
        {subtitle}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, color: theme.foreground, letterSpacing: "-0.02em",
      }}>
        {title}
      </div>
      <div style={{
        width: 40 * enter, height: 2, backgroundColor: accentColor, borderRadius: 1, marginTop: 6,
      }} />
    </div>
  );
};
