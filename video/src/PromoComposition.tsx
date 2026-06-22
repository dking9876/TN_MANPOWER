import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { DashboardScene } from "./scenes/DashboardScene";
import { CandidateScene } from "./scenes/CandidateScene";
import { DocumentAlertScene } from "./scenes/DocumentAlertScene";
import { ReportsOutroScene } from "./scenes/ReportsOutroScene";
import { theme } from "./lib/theme";
import "./styles/globals.css";

const { fontFamily: montserrat } = loadMontserrat();
const { fontFamily: cormorant } = loadCormorant();

// Scene transition — crossfade overlay
const SceneFade: React.FC<{ startFrame: number; duration?: number }> = ({ startFrame, duration = 25 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > duration) return null;

  const opacity = localFrame < duration / 2
    ? interpolate(localFrame, [0, duration / 2], [0, 1], { extrapolateRight: "clamp" })
    : interpolate(localFrame, [duration / 2, duration], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: theme.primary, opacity, zIndex: 200 }} />
  );
};

export const PromoComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, fontFamily: montserrat }}>
      {/* Scene 1: Dashboard — The Hook (0-10s) */}
      <Sequence from={0} durationInFrames={310}>
        <DashboardScene fontFamily={montserrat} headingFontFamily={cormorant} />
      </Sequence>

      {/* Transition 1→2 */}
      <SceneFade startFrame={290} duration={30} />

      {/* Scene 2: Candidate Management — The Engine (10-25s) */}
      <Sequence from={300} durationInFrames={460}>
        <CandidateScene fontFamily={montserrat} headingFontFamily={cormorant} />
      </Sequence>

      {/* Transition 2→3 */}
      <SceneFade startFrame={740} duration={30} />

      {/* Scene 3: Documents & Alerts — The Safety Net (25-45s) */}
      <Sequence from={750} durationInFrames={610}>
        <DocumentAlertScene fontFamily={montserrat} headingFontFamily={cormorant} />
      </Sequence>

      {/* Transition 3→4 */}
      <SceneFade startFrame={1340} duration={30} />

      {/* Scene 4: Reports & Outro — The Scale (45-60s) */}
      <Sequence from={1350} durationInFrames={450}>
        <ReportsOutroScene fontFamily={montserrat} headingFontFamily={cormorant} />
      </Sequence>
    </AbsoluteFill>
  );
};
