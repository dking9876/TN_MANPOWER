import React from "react";
import { useCurrentFrame } from "remotion";

interface TypewriterTextProps {
  text: string;
  startFrame: number;
  speed?: number;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text, startFrame, speed = 2, style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0) return <span style={style} />;

  const chars = Math.min(Math.floor(elapsed / speed), text.length);
  const visible = text.slice(0, chars);
  const showCursor = chars < text.length;

  return (
    <span style={style}>
      {visible}
      {showCursor && (
        <span style={{ opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0, color: "#0369A1" }}>
          |
        </span>
      )}
    </span>
  );
};
