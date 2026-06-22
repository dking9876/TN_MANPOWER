import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
} from "remotion";
import { Clock, Gift, AlertTriangle, FileText, Shield, CheckCircle2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { OverlayText } from "../components/OverlayText";
import { FeatureCallout, SceneTitle } from "../components/FeatureCallout";
import { theme } from "../lib/theme";
import { mockAlerts, documentCompletionData, expiringDocuments, alertSummary, candidateDocuments, resolveAlertFlow } from "../data/mockData";

const ALERT_ICONS: Record<string, { icon: React.FC<any>; color: string; bg: string }> = {
  DOCUMENT_EXPIRATION: { icon: FileText, color: "#dc2626", bg: "#fee2e2" },
  STALENESS: { icon: Clock, color: "#d97706", bg: "#fef3c7" },
  REFERRER_BONUS: { icon: Gift, color: "#059669", bg: "#dcfce7" },
};

const DOC_STATUS_STYLES: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  expiring: { icon: "⚠️", label: "Expiring", color: "#d97706", bg: "#fef3c7" },
  valid: { icon: "✓", label: "Valid", color: "#15803d", bg: "#dcfce7" },
  received: { icon: "✓", label: "Received", color: "#15803d", bg: "#dcfce7" },
  missing: { icon: "✗", label: "Not Received", color: "#94a3b8", bg: "#f1f5f9" },
};

// Document completion bar
const DocBar: React.FC<{ item: typeof documentCompletionData[0]; index: number }> = ({ item, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - 30 - index * 8, fps, config: { damping: 80 } });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 130, fontSize: 12, fontWeight: 500, textAlign: "right", color: theme.mutedForeground }}>
        {item.type}
      </div>
      <div style={{ flex: 1, height: 18, backgroundColor: "#f1f5f9", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{
          width: `${item.rate * progress}%`, height: "100%", borderRadius: 9999,
          backgroundColor: item.rate >= 90 ? "#15803d" : item.rate >= 70 ? "#0369A1" : "#d97706",
        }} />
      </div>
      <div style={{ width: 42, fontSize: 12, fontWeight: 600, textAlign: "right" }}>
        {Math.round(item.rate * progress)}%
      </div>
      {item.expiring > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
          backgroundColor: "#fef3c7", color: "#92400e",
        }}>
          {item.expiring} expiring
        </div>
      )}
    </div>
  );
};

export const DocumentAlertScene: React.FC<{ fontFamily: string; headingFontFamily: string }> = ({ fontFamily, headingFontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [570, 600], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 1: Document view (0-280), Phase 2: Alerts view (280-600)
  const showAlerts = frame >= 280;
  const docExit = frame >= 260 ? interpolate(frame, [260, 290], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const alertEnter = frame >= 270 ? interpolate(frame, [270, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // Zoom into passport warning
  const zoomToWarning = frame >= 150 && frame < 250;
  const warningZoom = zoomToWarning
    ? interpolate(frame, [150, 180, 220, 250], [1, 1.4, 1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const warningX = zoomToWarning
    ? interpolate(frame, [150, 180, 220, 250], [0, -120, -120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const warningY = zoomToWarning
    ? interpolate(frame, [150, 180, 220, 250], [0, -80, -80, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  // Resolve panel slide-in
  const resolveEnter = frame >= 450
    ? spring({ frame: frame - 450, fps, config: { damping: 80 } })
    : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, opacity: fadeIn * fadeOut }}>
      {/* Phase 1: Document Completion */}
      {!showAlerts && (
        <div style={{ width: "100%", height: "100%", opacity: docExit,
          transform: `scale(${warningZoom}) translate(${warningX}px, ${warningY}px)`,
          transformOrigin: "center",
        }}>
          <AppShell activePage="documents" fontFamily={fontFamily} headingFontFamily={headingFontFamily}>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: headingFontFamily, letterSpacing: "-0.02em" }}>
                Document Management
              </h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Document Completion Panel */}
              <div style={{
                backgroundColor: theme.card, borderRadius: 12, padding: 24,
                border: `1px solid rgba(226,232,240,0.4)`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <Shield size={18} color={theme.accent} />
                  <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
                    Document Completion Rates
                  </span>
                </div>
                {documentCompletionData.map((item, i) => (
                  <DocBar key={item.type} item={item} index={i} />
                ))}
              </div>

              {/* Expiring Documents Panel */}
              <div style={{
                backgroundColor: theme.card, borderRadius: 12, padding: 24,
                border: `1px solid rgba(226,232,240,0.4)`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <AlertTriangle size={18} color="#d97706" />
                  <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
                    Expiring Documents
                  </span>
                </div>
                {expiringDocuments.map((doc, i) => {
                  const enter = spring({ frame: frame - 50 - i * 12, fps, config: { damping: 80 } });
                  const isPassport = doc.documentType === "Passport";
                  const pulseOpacity = isPassport && zoomToWarning
                    ? 0.5 + 0.5 * Math.sin(frame * 0.2)
                    : 0;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 8, marginBottom: 8,
                      backgroundColor: isPassport ? "#fef2f2" : "#fffbeb",
                      border: `1px solid ${isPassport ? "#fecaca" : "#fde68a"}`,
                      opacity: enter, transform: `translateX(${(1 - enter) * 20}px)`,
                      position: "relative", overflow: "hidden",
                    }}>
                      {/* Pulse glow for passport */}
                      {isPassport && (
                        <div style={{
                          position: "absolute", inset: 0,
                          backgroundColor: "rgba(220, 38, 38, 0.08)",
                          opacity: pulseOpacity,
                        }} />
                      )}
                      <FileText size={16} color={isPassport ? "#dc2626" : "#d97706"} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.foreground }}>
                          {doc.candidateName}
                        </div>
                        <div style={{ fontSize: 11, color: theme.mutedForeground }}>
                          {doc.documentType} — expires {doc.expirationDate}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                        backgroundColor: isPassport ? "#dc2626" : "#d97706",
                        color: "white",
                      }}>
                        {doc.daysLeft} days
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Candidate Documents — Sunil Kumar */}
            <div style={{
              backgroundColor: theme.card, borderRadius: 12, padding: 24, marginTop: 20,
              border: `1px solid rgba(226,232,240,0.4)`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <FileText size={18} color={theme.accent} />
                <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
                  Sunil Kumar — Documents
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                  backgroundColor: "#e0f2fe", color: "#0369a1", marginLeft: "auto",
                }}>
                  4 Auto-Created
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {candidateDocuments.map((doc, i) => {
                  const s = DOC_STATUS_STYLES[doc.status] || DOC_STATUS_STYLES.missing;
                  const rowEnter = spring({ frame: frame - 70 - i * 10, fps, config: { damping: 80 } });
                  return (
                    <div key={doc.type} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 8,
                      backgroundColor: s.bg, border: `1px solid ${s.color}33`,
                      opacity: rowEnter, transform: `translateY(${(1 - rowEnter) * 10}px)`,
                    }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{s.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: theme.foreground }}>{doc.type}</div>
                        <div style={{ fontSize: 11, color: theme.mutedForeground }}>
                          {s.label}{doc.daysLeft != null ? ` (${doc.daysLeft} days)` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AppShell>
        </div>
      )}

      {/* Phase 2: Alerts System */}
      {showAlerts && (
        <div style={{ width: "100%", height: "100%", opacity: alertEnter, position: "relative" }}>
          <AppShell activePage="alerts" fontFamily={fontFamily} headingFontFamily={headingFontFamily}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: headingFontFamily, letterSpacing: "-0.02em" }}>
                Alerts & Notifications
              </h1>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: theme.mutedForeground }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#dc2626" }} />
                  Open: {alertSummary.open}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: theme.mutedForeground }}>
                  <CheckCircle2 size={14} color="#15803d" /> Resolved: {alertSummary.resolved}
                </div>
              </div>
            </div>

            {/* Alert filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {["Unresolved", "All Types"].map((f) => (
                <div key={f} style={{
                  padding: "8px 14px", borderRadius: 8, fontSize: 14,
                  backgroundColor: f === "Unresolved" ? "#fef2f2" : theme.card,
                  border: `1px solid ${f === "Unresolved" ? "#fecaca" : theme.border}`,
                  color: f === "Unresolved" ? "#dc2626" : theme.foreground, fontWeight: 500,
                }}>
                  {f}
                </div>
              ))}
            </div>

            {/* Alerts table */}
            <div style={{ backgroundColor: theme.card, borderRadius: 0 }}>
              <div style={{
                display: "grid", gridTemplateColumns: "0.5fr 1fr 2fr 1fr 0.7fr",
                borderBottom: `4px solid ${theme.foreground}`, padding: "14px 16px",
              }}>
                {["Type", "Candidate", "Message", "Created", "Status"].map((h) => (
                  <div key={h} style={{ fontSize: 13, fontWeight: 500, color: theme.foreground }}>{h}</div>
                ))}
              </div>

              {mockAlerts.map((alert, i) => {
                const rowEnter = spring({ frame: frame - 300 - i * 6, fps, config: { damping: 100 } });
                const iconData = ALERT_ICONS[alert.type] || ALERT_ICONS.STALENESS;
                const Icon = iconData.icon;
                const isHighlighted = i === 0 && frame >= 380 && frame < 460;
                return (
                  <div key={alert.id} style={{
                    display: "grid", gridTemplateColumns: "0.5fr 1fr 2fr 1fr 0.7fr",
                    padding: "14px 16px", borderBottom: `2px solid rgba(226,232,240,0.5)`,
                    opacity: rowEnter, transform: `translateY(${(1 - rowEnter) * 8}px)`,
                    backgroundColor: isHighlighted ? "rgba(254,242,242,0.6)" : "transparent",
                    boxShadow: isHighlighted ? "inset 3px 0 0 #dc2626" : "none",
                  }}>
                    <div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 6,
                        backgroundColor: iconData.bg, color: iconData.color,
                      }}>
                        <Icon size={14} />
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: theme.accent }}>{alert.candidateName}</div>
                    <div style={{ fontSize: 13, color: theme.mutedForeground, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: 13, color: theme.mutedForeground }}>{alert.createdAt}</div>
                    <div>
                      <span style={{
                        display: "inline-flex", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                        backgroundColor: alert.resolved ? "#dcfce7" : "#fee2e2",
                        color: alert.resolved ? "#15803d" : "#dc2626",
                      }}>
                        {alert.resolved ? "Resolved" : "Unresolved"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </AppShell>

          {/* Resolve Alert Panel — slides in at frame 450 */}
          {resolveEnter > 0 && (
            <div style={{
              position: "absolute", top: 100, right: 32, width: 300,
              backgroundColor: theme.card, borderRadius: 12, padding: 20,
              border: `1px solid ${theme.border}`,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              opacity: resolveEnter,
              transform: `translateX(${(1 - resolveEnter) * 40}px)`,
              zIndex: 50,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: theme.foreground }}>
                Resolve Alert
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: theme.mutedForeground, marginBottom: 6 }}>
                  Resolution Notes
                </div>
                <div style={{
                  padding: "10px 12px", borderRadius: 8, fontSize: 12,
                  backgroundColor: "#f8fafc", border: `1px solid ${theme.border}`,
                  color: theme.foreground, lineHeight: 1.5,
                }}>
                  {resolveAlertFlow.resolutionNotes}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  backgroundColor: "#0369a1", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <CheckCircle2 size={10} color="white" />
                </div>
                <span style={{ fontSize: 12, color: theme.foreground }}>
                  Update candidate last_updated_at
                </span>
              </div>
              <div style={{
                padding: "10px 0", textAlign: "center", borderRadius: 8,
                backgroundColor: "#15803d", color: "white",
                fontSize: 13, fontWeight: 700,
              }}>
                ✓ Resolve
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scene Titles */}
      <SceneTitle title="Proactive Document Tracking" subtitle="DOCUMENTS" startFrame={0} />
      <SceneTitle title="Intelligent Alert Engine" subtitle="ALERTS" startFrame={290} />

      {/* Feature Callouts */}
      <FeatureCallout startFrame={80} features={[
        { icon: "📄", label: "4 Documents Auto-Created" },
        { icon: "⏰", label: "Passport: 90-Day Warning" },
        { icon: "📋", label: "Visa: 30-Day Warning" },
        { icon: "🔍", label: "Expiration Date Required" },
      ]} />
      <FeatureCallout startFrame={380} features={[
        { icon: "⏰", label: "Staleness: 7-Day Default" },
        { icon: "📋", label: "Document Expiration Alerts" },
        { icon: "✅", label: "Resolve with Notes" },
        { icon: "🔄", label: "Auto-Updates Timestamp" },
        { icon: "👤", label: "Assigned to Creator" },
      ]} />

      {/* Overlay Texts */}
      <OverlayText text="Every Document Tracked. Every Deadline Enforced." startFrame={180} duration={80} />
      <OverlayText text="Never Miss a Deadline. Never Lose a Candidate." startFrame={510} duration={80} />
    </AbsoluteFill>
  );
};
