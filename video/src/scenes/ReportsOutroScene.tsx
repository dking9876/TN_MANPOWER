import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
} from "remotion";
import { theme } from "../lib/theme";
import {
  growthData, mockUsers, settingsTabs, alertThresholds,
  blacklistedCountries, criticalRules,
} from "../data/mockData";
import { AppShell } from "../components/AppShell";
import { OverlayText } from "../components/OverlayText";
import { FeatureCallout, SceneTitle } from "../components/FeatureCallout";

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "#dbeafe", text: "#1d4ed8" },
  RECRUITER: { bg: "#e0f2fe", text: "#0369A1" },
  REFERRER: { bg: "#f1f5f9", text: "#334155" },
};

// ── Admin Command Center ────────────────────────────────────────────
const AdminPanel: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelEnter = spring({ frame: frame - 10, fps, config: { damping: 80 } });
  const rightEnter = spring({ frame: frame - 25, fps, config: { damping: 80 } });
  const bottomEnter = spring({ frame: frame - 50, fps, config: { damping: 80 } });

  const users = mockUsers.slice(0, 4);
  const activeTab = "Alert Thresholds";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily }}>
      <div style={{ display: "flex", gap: 16 }}>
        {/* LEFT: User Management Table */}
        <div style={{
          flex: 1, backgroundColor: theme.card, borderRadius: 10, padding: 16,
          border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          opacity: panelEnter, transform: `translateX(${(1 - panelEnter) * -20}px)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: theme.foreground }}>
            👥 User Management
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 8, paddingBottom: 6, borderBottom: `1px solid ${theme.border}` }}>
              {["Name", "Role", "Status"].map((h, idx) => (
                <div key={h} style={{
                  flex: idx === 0 ? 2 : idx === 1 ? 1 : 0.5,
                  fontSize: 10, fontWeight: 600, color: theme.mutedForeground,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>{h}</div>
              ))}
            </div>
            {users.map((user, i) => {
              const rowEnter = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 80 } });
              const badge = roleBadgeColors[user.role] || roleBadgeColors.REFERRER;
              return (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "center",
                  opacity: rowEnter, transform: `translateY(${(1 - rowEnter) * 8}px)`,
                }}>
                  <div style={{ flex: 2, fontSize: 12, fontWeight: 500, color: theme.foreground }}>{user.name}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                      backgroundColor: badge.bg, color: badge.text,
                    }}>{user.role}</span>
                  </div>
                  <div style={{ flex: 0.5, display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      backgroundColor: user.active ? "#22c55e" : "#94a3b8",
                    }} />
                    <span style={{ fontSize: 10, color: theme.mutedForeground }}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Settings Panel */}
        <div style={{
          flex: 1, backgroundColor: theme.card, borderRadius: 10, padding: 16,
          border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          opacity: rightEnter, transform: `translateX(${(1 - rightEnter) * 20}px)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: theme.foreground }}>
            ⚙️ Settings Panels
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
              {settingsTabs.map((tab, i) => {
                const isActive = tab === activeTab;
                const tabEnter = spring({ frame: frame - 30 - i * 5, fps, config: { damping: 80 } });
                return (
                  <div key={i} style={{
                    fontSize: 11, fontWeight: isActive ? 700 : 500, padding: "5px 10px", borderRadius: 6,
                    backgroundColor: isActive ? "#e0f2fe" : "transparent",
                    color: isActive ? "#0369A1" : theme.mutedForeground,
                    border: isActive ? "1px solid #bae6fd" : "1px solid transparent",
                    opacity: tabEnter, transform: `translateX(${(1 - tabEnter) * 10}px)`,
                  }}>{tab}</div>
                );
              })}
            </div>
            <div style={{
              flex: 1, backgroundColor: "#f8fafc", borderRadius: 8, padding: 12,
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: theme.foreground }}>
                Alert Thresholds
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {Object.entries(alertThresholds).map(([key, val], i) => {
                  const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                      <span style={{ color: theme.mutedForeground }}>{label}</span>
                      <span style={{ fontWeight: 700, color: theme.accent }}>{val} days</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Blacklisted Countries */}
      <div style={{
        backgroundColor: theme.card, borderRadius: 10, padding: 14,
        border: `1px solid ${theme.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        opacity: bottomEnter, transform: `translateY(${(1 - bottomEnter) * 12}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.foreground }}>🚫 Blacklisted Countries</span>
          <span style={{ fontSize: 10, color: theme.destructive, fontWeight: 600 }}>CRITICAL CHECK</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {blacklistedCountries.map((country, i) => {
            const badgeEnter = spring({ frame: frame - 55 - i * 6, fps, config: { damping: 80 } });
            return (
              <span key={i} style={{
                fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
                backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca",
                opacity: badgeEnter, transform: `scale(${0.8 + 0.2 * badgeEnter})`,
              }}>{country}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Growth Chart (SVG path animation) ───────────────────────────────
const GrowthChart: React.FC<{ fontFamily: string; startFrame: number }> = ({ fontFamily, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  const maxVal = Math.max(...growthData.map((d) => d.candidates));
  const minVal = Math.min(...growthData.map((d) => d.candidates)) * 0.9;
  const w = 1100, h = 400, padL = 60, padR = 40, padT = 40, padB = 60;

  const drawProgress = spring({ frame: local - 10, fps, config: { damping: 40, mass: 2 } });

  const points = growthData.map((d, i) => ({
    x: padL + (i / (growthData.length - 1)) * (w - padL - padR),
    y: padT + (1 - (d.candidates - minVal) / (maxVal - minVal)) * (h - padT - padB),
    value: d.candidates,
    label: d.month,
  }));

  const visibleCount = Math.ceil(points.length * drawProgress);
  const visiblePoints = points.slice(0, visibleCount);

  const linePath = visiblePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = visiblePoints.length > 1
    ? linePath + ` L ${visiblePoints[visiblePoints.length - 1].x} ${h - padB} L ${padL} ${h - padB} Z`
    : "";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ fontFamily }}>
      <defs>
        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0369A1" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#0369A1" stopOpacity={0.02} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padT + pct * (h - padT - padB);
        const val = Math.round(maxVal - pct * (maxVal - minVal));
        return (
          <g key={pct}>
            <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
            <text x={padL - 10} y={y + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{val}</text>
          </g>
        );
      })}

      {points.map((p) => (
        <text key={p.label} x={p.x} y={h - padB + 24} textAnchor="middle" fontSize={11} fill="#94a3b8">
          {p.label}
        </text>
      ))}

      {areaPath && <path d={areaPath} fill="url(#growthGrad)" />}

      {linePath && (
        <path d={linePath} fill="none" stroke="#0369A1" strokeWidth={3} strokeLinecap="round" filter="url(#glow)" />
      )}

      {visiblePoints.map((p, i) => {
        const pointSpring = spring({ frame: local - 20 - i * 5, fps, config: { damping: 80 } });
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={6 * pointSpring} fill="white" stroke="#0369A1" strokeWidth={2.5} />
            {i === visiblePoints.length - 1 && pointSpring > 0.5 && (
              <g>
                <rect x={p.x - 28} y={p.y - 32} width={56} height={22} rx={6}
                  fill="#0F172A" opacity={pointSpring} />
                <text x={p.x} y={p.y - 17} textAnchor="middle"
                  fontSize={12} fontWeight={700} fill="white" opacity={pointSpring}>
                  {p.value}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ── SiteSprint Logo Animation ───────────────────────────────────────
const SiteSprintLogo: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - 290;

  if (localFrame < 0) return null;

  const logoScale = spring({ frame: localFrame, fps, config: { damping: 60, mass: 0.8 } });
  const textEnter = spring({ frame: localFrame - 15, fps, config: { damping: 80 } });
  const taglineEnter = spring({ frame: localFrame - 35, fps, config: { damping: 80 } });

  const shimmerX = interpolate(localFrame, [0, 120], [-200, 600], { extrapolateRight: "clamp" });

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        transform: `scale(${logoScale})`, opacity: logoScale,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16,
          background: "linear-gradient(135deg, #0F172A 0%, #0369A1 50%, #0ea5e9 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 20px 60px rgba(3,105,161,0.3)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: shimmerX, width: 40, height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            transform: "skewX(-20deg)",
          }} />
          <span style={{
            fontSize: 28, fontWeight: 800, color: "white", letterSpacing: "-0.02em",
            fontFamily,
          }}>
            SS
          </span>
        </div>
        <div style={{
          opacity: textEnter, transform: `translateX(${(1 - textEnter) * 20}px)`,
        }}>
          <div style={{
            fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #0F172A, #0369A1)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily,
          }}>
            SiteSprint
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 28, fontWeight: 600, color: theme.mutedForeground,
        letterSpacing: "-0.01em", opacity: taglineEnter,
        transform: `translateY(${(1 - taglineEnter) * 15}px)`,
        fontFamily,
      }}>
        Built for Growth. Built by SiteSprint.
      </div>

      <div style={{
        width: 80 * taglineEnter, height: 3, borderRadius: 2,
        background: "linear-gradient(90deg, #0369A1, #0ea5e9)",
        opacity: taglineEnter,
      }} />
    </div>
  );
};

// ── 9 Critical Rules Strip ──────────────────────────────────────────
const CriticalRulesStrip: React.FC<{ fontFamily: string }> = ({ fontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - 310;

  if (localFrame < 0) return null;

  return (
    <div style={{
      position: "absolute", top: 60, left: 0, right: 0,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      fontFamily,
    }}>
      {criticalRules.map((rule, i) => {
        const ruleEnter = spring({ frame: localFrame - i * 8, fps, config: { damping: 80, mass: 0.5 } });
        if (ruleEnter < 0.01) return null;
        return (
          <div key={i} style={{
            fontSize: 11, fontWeight: 500, color: theme.mutedForeground,
            opacity: ruleEnter * 0.7,
            transform: `translateY(${(1 - ruleEnter) * 10}px)`,
          }}>
            {`${i + 1}. ${rule}`}
          </div>
        );
      })}
    </div>
  );
};

// ── Main Scene ──────────────────────────────────────────────────────
export const ReportsOutroScene: React.FC<{ fontFamily: string; headingFontFamily: string }> = ({ fontFamily, headingFontFamily }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  // Phase transitions
  const phase1Exit = frame >= 115 ? interpolate(frame, [115, 135], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const phase2Enter = frame >= 125 ? interpolate(frame, [125, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const phase2Exit = frame >= 275 ? interpolate(frame, [275, 295], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const phase3Enter = frame >= 280 ? interpolate(frame, [280, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const showPhase1 = frame < 140;
  const showPhase2 = frame >= 120 && frame < 300;
  const showPhase3 = frame >= 280;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, opacity: fadeIn }}>
      {/* Phase 1: Admin Command Center (0-130) */}
      {showPhase1 && (
        <div style={{ width: "100%", height: "100%", opacity: phase1Exit }}>
          <AppShell activePage="settings" fontFamily={fontFamily} headingFontFamily={headingFontFamily}>
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: headingFontFamily, letterSpacing: "-0.02em" }}>
                Admin Settings
              </h1>
              <p style={{ fontSize: 13, color: theme.mutedForeground, marginTop: 2 }}>
                Full administrative control over the entire system
              </p>
            </div>
            <AdminPanel fontFamily={fontFamily} />
          </AppShell>
        </div>
      )}

      {/* Phase 2: Growth Chart + Analytics (130-290) */}
      {showPhase2 && (
        <div style={{ width: "100%", height: "100%", opacity: phase2Enter * phase2Exit }}>
          <AppShell activePage="dashboard" fontFamily={fontFamily} headingFontFamily={headingFontFamily}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: headingFontFamily, letterSpacing: "-0.02em" }}>
                Reports & Analytics
              </h1>
              <p style={{ fontSize: 14, color: theme.mutedForeground, marginTop: 4 }}>
                12-month growth trajectory
              </p>
            </div>
            <div style={{
              backgroundColor: theme.card, borderRadius: 12, padding: 32,
              border: "1px solid rgba(226,232,240,0.4)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>Candidate Growth</div>
                  <div style={{ fontSize: 13, color: theme.mutedForeground }}>May 2024 — April 2025</div>
                </div>
                <div style={{
                  padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                  backgroundColor: "#e0f2fe", color: "#0369A1",
                }}>
                  +173% Growth
                </div>
              </div>
              <GrowthChart fontFamily={fontFamily} startFrame={130} />
            </div>
          </AppShell>
        </div>
      )}

      {/* Phase 3: SiteSprint Outro (290-450) */}
      {showPhase3 && (
        <AbsoluteFill style={{
          backgroundColor: theme.background, opacity: phase3Enter,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CriticalRulesStrip fontFamily={fontFamily} />
          <SiteSprintLogo fontFamily={fontFamily} />
        </AbsoluteFill>
      )}

      {/* Scene titles */}
      <SceneTitle title="Full Administrative Control" subtitle="ADMIN" startFrame={5} />
      <SceneTitle title="12-Month Growth Trajectory" subtitle="ANALYTICS" startFrame={135} />

      {/* Feature callouts */}
      <FeatureCallout
        startFrame={40}
        features={[
          { icon: "👥", label: "User Management (RBAC)" },
          { icon: "⚙️", label: "7 Settings Panels" },
          { icon: "🌍", label: "Blacklist Countries" },
          { icon: "📊", label: "Full Audit Logs" },
          { icon: "🔐", label: "Row Level Security" },
        ]}
      />
      <FeatureCallout
        startFrame={170}
        features={[
          { icon: "📈", label: "+173% Candidate Growth" },
          { icon: "📊", label: "Status & Industry Charts" },
          { icon: "🔍", label: "Filter by Date, Status, Industry" },
          { icon: "📤", label: "Export Filtered Results" },
        ]}
      />

      {/* Phase 2 overlay */}
      <OverlayText text="From Scattered Data to Centralized Growth." startFrame={200} duration={60} />
    </AbsoluteFill>
  );
};
