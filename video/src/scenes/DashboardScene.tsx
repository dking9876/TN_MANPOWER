import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
} from "remotion";
import { Users, TrendingUp, AlertTriangle, Plane } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { OverlayText } from "../components/OverlayText";
import { theme, statusColors, industryColors } from "../lib/theme";
import { dashboardStats, statusBreakdown, industryBreakdown, monthlyTrend, auditLogEntries } from "../data/mockData";
import { FeatureCallout, SceneTitle } from "../components/FeatureCallout";

const STAT_CARDS = [
  { key: "totalCandidates" as const, label: "Total Candidates", icon: Users, color: "#2563eb", value: dashboardStats.totalCandidates },
  { key: "inProgress" as const, label: "In Progress", icon: TrendingUp, color: "#059669", value: dashboardStats.inProgress },
  { key: "openAlerts" as const, label: "Open Alerts", icon: AlertTriangle, color: "#e11d48", value: dashboardStats.openAlerts },
  { key: "arrivedThisMonth" as const, label: "Arrived This Month", icon: Plane, color: "#0284c7", value: dashboardStats.arrivedThisMonth },
];

// Animated number counter
const Counter: React.FC<{ value: number; delay: number }> = ({ value, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 80, mass: 1.2 } });
  return <>{Math.round(value * progress)}</>;
};

// Horizontal bar chart
const StatusBarChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maxCount = Math.max(...statusBreakdown.map((s) => s.count));

  return (
    <div style={{
      backgroundColor: theme.card, borderRadius: 12, padding: 24,
      border: `1px solid rgba(226,232,240,0.4)`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, letterSpacing: "-0.01em" }}>
        Candidates by Status
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {statusBreakdown.slice(0, 7).map((item, i) => {
          const barProgress = spring({ frame: frame - 60 - i * 5, fps, config: { damping: 100 } });
          const width = (item.count / maxCount) * 100 * barProgress;
          return (
            <div key={item.status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 120, fontSize: 11, textAlign: "right", color: theme.mutedForeground, whiteSpace: "nowrap", overflow: "hidden" }}>
                {item.label}
              </div>
              <div style={{ flex: 1, height: 22, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${width}%`, height: "100%", borderRadius: "0 4px 4px 0",
                  backgroundColor: statusColors[item.status] || "#64748b",
                }} />
              </div>
              <div style={{ width: 30, fontSize: 12, fontWeight: 600, textAlign: "right" }}>
                {Math.round(item.count * barProgress)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donut chart for industry breakdown
const IndustryDonut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = industryBreakdown.reduce((s, i) => s + i.count, 0);
  const drawProgress = spring({ frame: frame - 70, fps, config: { damping: 60, mass: 1.5 } });

  let cumulativeAngle = 0;
  const slices = industryBreakdown.map((item) => {
    const angle = (item.count / total) * 360 * drawProgress;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...item, startAngle, endAngle: cumulativeAngle };
  });

  const cx = 120, cy = 120, r = 90, inner = 55;
  const polarToCartesian = (a: number) => ({
    x: cx + r * Math.cos((a - 90) * Math.PI / 180),
    y: cy + r * Math.sin((a - 90) * Math.PI / 180),
  });
  const polarInner = (a: number) => ({
    x: cx + inner * Math.cos((a - 90) * Math.PI / 180),
    y: cy + inner * Math.sin((a - 90) * Math.PI / 180),
  });

  return (
    <div style={{
      backgroundColor: theme.card, borderRadius: 12, padding: 24,
      border: `1px solid rgba(226,232,240,0.4)`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.01em" }}>
        By Industry
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <svg width={240} height={240} viewBox="0 0 240 240">
          {slices.map((slice) => {
            if (slice.endAngle - slice.startAngle < 0.5) return null;
            const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
            const s1 = polarToCartesian(slice.startAngle);
            const e1 = polarToCartesian(slice.endAngle);
            const s2 = polarInner(slice.endAngle);
            const e2 = polarInner(slice.startAngle);
            return (
              <path key={slice.industry}
                d={`M ${s1.x} ${s1.y} A ${r} ${r} 0 ${largeArc} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${inner} ${inner} 0 ${largeArc} 0 ${e2.x} ${e2.y} Z`}
                fill={industryColors[slice.industry] || "#64748b"}
              />
            );
          })}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={28} fontWeight={700} fill={theme.foreground}>
            {Math.round(total * drawProgress)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill={theme.mutedForeground}>
            Total
          </text>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {industryBreakdown.slice(0, 5).map((item) => (
            <div key={item.industry} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: industryColors[item.industry] }} />
              <span style={{ fontSize: 12, color: theme.mutedForeground }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, marginLeft: "auto" }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mini area chart for monthly trend
const TrendMiniChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drawProgress = spring({ frame: frame - 80, fps, config: { damping: 60 } });
  const maxVal = Math.max(...monthlyTrend.map((m) => m.count));
  const w = 320, h = 120, pad = 20;

  const points = monthlyTrend.map((m, i) => ({
    x: pad + (i / (monthlyTrend.length - 1)) * (w - 2 * pad),
    y: pad + (1 - m.count / maxVal) * (h - 2 * pad),
  }));

  const visibleCount = Math.ceil(points.length * drawProgress);
  const visiblePoints = points.slice(0, visibleCount);
  const linePath = visiblePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${visiblePoints[visiblePoints.length - 1]?.x || pad} ${h - pad} L ${pad} ${h - pad} Z`;

  return (
    <div style={{
      backgroundColor: theme.card, borderRadius: 12, padding: 24,
      border: `1px solid rgba(226,232,240,0.4)`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, letterSpacing: "-0.01em" }}>
        Candidates Added (6 Months)
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0369A1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0369A1" stopOpacity={0} />
          </linearGradient>
        </defs>
        {visiblePoints.length > 1 && <path d={areaPath} fill="url(#trendFill)" />}
        {visiblePoints.length > 1 && <path d={linePath} fill="none" stroke="#0369A1" strokeWidth={2.5} strokeLinecap="round" />}
        {visiblePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#0369A1" />
        ))}
      </svg>
    </div>
  );
};

// Audit activity feed
const ACTION_STYLES: Record<string, { color: string; icon: string }> = {
  CREATE: { color: "#059669", icon: "➕" },
  UPDATE: { color: "#2563eb", icon: "✏️" },
  STATUS_CHANGE: { color: "#7c3aed", icon: "🔄" },
};

const ActivityFeed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entries = auditLogEntries.slice(0, 5);

  return (
    <div style={{
      backgroundColor: theme.card, borderRadius: 12, padding: 24, marginTop: 24,
      border: "1px solid rgba(226,232,240,0.4)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.01em" }}>
        📋 Recent Activity
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map((entry, i) => {
          const enter = spring({ frame: frame - 140 - i * 10, fps, config: { damping: 80 } });
          const style = ACTION_STYLES[entry.action] || ACTION_STYLES.UPDATE;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              opacity: enter, transform: `translateX(${(1 - enter) * 30}px)`,
              padding: "8px 12px", borderRadius: 8, backgroundColor: "#f8fafc",
            }}>
              <span style={{ fontSize: 16 }}>{style.icon}</span>
              <div style={{
                fontSize: 10, fontWeight: 600, color: "#fff", backgroundColor: style.color,
                padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {entry.action.replace("_", " ")}
              </div>
              <span style={{ fontSize: 12, color: theme.mutedForeground }}>{entry.user}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{entry.candidate}</span>
              <span style={{ fontSize: 11, color: theme.mutedForeground, flex: 1 }}>{entry.detail}</span>
              <span style={{ fontSize: 10, color: theme.mutedForeground, whiteSpace: "nowrap" }}>{entry.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Dashboard Scene
export const DashboardScene: React.FC<{ fontFamily: string; headingFontFamily: string }> = ({ fontFamily, headingFontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera pan: start slightly zoomed in on top-left, then pull back
  const zoom = interpolate(frame, [0, 60, 180, 300], [1.15, 1.1, 1.0, 1.0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panX = interpolate(frame, [0, 60, 180, 300], [-80, -40, 0, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, 60, 180, 300], [-50, -25, 0, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Fade in from black
  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  // Fade out
  const fadeOut = interpolate(frame, [275, 300], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Highlight glow on Total Candidates and Open Alerts
  const glowOnTotal = frame >= 90 && frame < 160;
  const glowOnAlerts = frame >= 130 && frame < 200;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, opacity: fadeIn * fadeOut }}>
      <div style={{
        width: "100%", height: "100%",
        transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
        transformOrigin: "top left",
      }}>
        <AppShell activePage="dashboard" fontFamily={fontFamily} headingFontFamily={headingFontFamily}>
          {/* Dashboard header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: headingFontFamily, letterSpacing: "-0.02em" }}>
              Dashboard
            </h1>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 24 }}>
            {STAT_CARDS.map((card, i) => {
              const cardEnter = spring({ frame: frame - 20 - i * 8, fps, config: { damping: 80 } });
              const isHighlighted = (card.key === "totalCandidates" && glowOnTotal) || (card.key === "openAlerts" && glowOnAlerts);
              return (
                <div key={card.key} style={{
                  position: "relative", overflow: "hidden", borderRadius: 12,
                  padding: 24, backgroundColor: "rgba(255,255,255,0.8)",
                  border: `1px solid ${isHighlighted ? theme.accent : "rgba(226,232,240,0.4)"}`,
                  boxShadow: isHighlighted ? `0 0 24px rgba(3,105,161,0.25)` : "0 1px 3px rgba(0,0,0,0.05)",
                  transform: `translateY(${(1 - cardEnter) * 20}px)`,
                  opacity: cardEnter,
                  transition: "box-shadow 0.3s, border-color 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      fontSize: 12, color: theme.mutedForeground, fontWeight: 500,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {card.label}
                    </div>
                    <div style={{
                      padding: 10, borderRadius: 8, backgroundColor: "#f1f5f9", color: card.color,
                    }}>
                      <card.icon size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>
                    <Counter value={card.value} delay={30 + i * 8} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <StatusBarChart />
            <IndustryDonut />
          </div>

          {/* Trend chart */}
          <TrendMiniChart />

          {/* Audit activity feed */}
          <ActivityFeed />
        </AppShell>
      </div>

      {/* Scene title badge */}
      <SceneTitle title="Real-Time Command Center" subtitle="DASHBOARD" startFrame={10} />

      {/* Overlay text */}
      <OverlayText text="Real-Time Visibility Across Your Entire Operation." startFrame={200} duration={90} />

      {/* Feature callout strip */}
      <FeatureCallout
        startFrame={220}
        features={[
          { icon: "📊", label: "10-Stage Pipeline" },
          { icon: "🏭", label: "7 Industries Tracked" },
          { icon: "🔔", label: "Real-Time Alert Count" },
          { icon: "👁️", label: "Admin God-Mode View" },
          { icon: "📋", label: "Full Audit Trail" },
        ]}
      />
    </AbsoluteFill>
  );
};
