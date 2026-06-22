import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate,
} from "remotion";
import { Search, Download, Filter, Eye, Pencil } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { AnimatedCursor } from "../components/AnimatedCursor";
import { TypewriterText } from "../components/TypewriterText";
import { OverlayText } from "../components/OverlayText";
import { FeatureCallout, SceneTitle } from "../components/FeatureCallout";
import { theme, statusBadgeColors } from "../lib/theme";
import { mockCandidates, constructionCandidates } from "../data/mockData";

const INDUSTRIES_LABEL: Record<string, string> = {
  CONSTRUCTION: "Construction", NURSING: "Nursing", AGRICULTURE: "Agriculture",
  INDUSTRY: "Industry", HOSPITALITY: "Hospitality", SERVICES: "Services", COMMERCE: "Commerce",
};

const STATUS_LABELS: Record<string, string> = {
  VISA_APPROVED: "Visa Approved", ARRIVED_IN_ISRAEL: "Arrived in Israel",
  DOCUMENTS_RECEIVED: "Documents Received", RECRUITMENT_STARTED: "Recruitment Started",
  AWAITING_INTERVIEW: "Awaiting Interview", FLIGHT_TICKET_PURCHASED: "Flight Ticket",
  SENT_TO_IVS: "Sent to IVS", POTENTIAL_CANDIDATE: "Potential Candidate",
  HEALTH_INSURANCE_PURCHASED: "Health Insurance",
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = statusBadgeColors[status] || { bg: "#f1f5f9", text: "#334155", border: "#e2e8f0" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 500,
      backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.text }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
};

const TABLE_HEADERS = ["Full Name", "National ID", "Passport", "Age", "Industry", "Profession", "Company", "Status", "Updated", ""];

export const CandidateScene: React.FC<{ fontFamily: string; headingFontFamily: string }> = ({ fontFamily, headingFontFamily }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Show construction-filtered results after frame 230
  const showFiltered = frame > 230;
  const candidates = showFiltered ? constructionCandidates : mockCandidates;

  // Fade in
  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Filter dropdown animation
  const filterOpen = frame >= 150 && frame < 220;
  const filterOpacity = filterOpen ? spring({ frame: frame - 150, fps, config: { damping: 100 } }) : 0;

  // Export toast
  const showToast = frame >= 340 && frame < 400;
  const toastEnter = showToast ? spring({ frame: frame - 340, fps, config: { damping: 80 } }) : 0;

  // "Construction" filter highlight
  const filterApplied = frame >= 220;

  // Cursor path: rest → filter button → dropdown item → export button
  const cursorPath = [
    { x: 960, y: 400, frame: 60 },
    { x: 540, y: 130, frame: 120 },
    { x: 540, y: 130, frame: 150 },
    { x: 530, y: 210, frame: 185 },
    { x: 530, y: 210, frame: 215 },
    { x: 1480, y: 74, frame: 280 },
    { x: 1480, y: 74, frame: 320 },
  ];
  const clickFrames = [150, 215, 320];

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background, opacity: fadeIn * fadeOut }}>
      <AppShell activePage="candidates" fontFamily={fontFamily} headingFontFamily={headingFontFamily}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: headingFontFamily, letterSpacing: "-0.02em" }}>
            Candidates
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
              borderRadius: 8, fontSize: 14, fontWeight: 500,
              backgroundColor: theme.card, border: `1px solid ${theme.border}`,
              color: theme.foreground,
            }}>
              <Download size={16} /> Export CSV
            </div>
            <div style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              backgroundColor: theme.primary, color: theme.primaryForeground,
            }}>
              + Add Candidate
            </div>
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, flex: 1,
            padding: "8px 14px", borderRadius: 8, backgroundColor: theme.card,
            border: `1px solid ${theme.border}`, fontSize: 14, color: theme.mutedForeground,
          }}>
            <Search size={16} />
            <TypewriterText text="Search by name, ID, passport..." startFrame={30} speed={2} style={{ color: theme.mutedForeground }} />
          </div>

          {/* Industry filter */}
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
              borderRadius: 8, fontSize: 14, fontWeight: 500,
              backgroundColor: filterApplied ? "#e0f2fe" : theme.card,
              border: `1px solid ${filterApplied ? "#0369A1" : theme.border}`,
              color: filterApplied ? "#0369A1" : theme.foreground,
            }}>
              <Filter size={16} />
              {filterApplied ? "Construction" : "Industry"}
            </div>

            {/* Dropdown */}
            {filterOpen && (
              <div style={{
                position: "absolute", top: 44, left: 0, width: 200,
                backgroundColor: theme.card, borderRadius: 8,
                border: `1px solid ${theme.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                padding: 4, opacity: filterOpacity, zIndex: 50,
              }}>
                {["All Industries", "Construction", "Nursing", "Agriculture", "Industry", "Hospitality"].map((opt, i) => (
                  <div key={opt} style={{
                    padding: "8px 12px", fontSize: 13, borderRadius: 4,
                    backgroundColor: opt === "Construction" && frame >= 200 ? "#e0f2fe" : "transparent",
                    color: opt === "Construction" && frame >= 200 ? "#0369A1" : theme.foreground,
                    fontWeight: opt === "Construction" && frame >= 200 ? 600 : 400,
                  }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
            borderRadius: 8, fontSize: 14, backgroundColor: theme.card,
            border: `1px solid ${theme.border}`, color: theme.foreground,
          }}>
            Status
          </div>
        </div>

        {/* Table */}
        <div style={{
          borderRadius: 0, overflow: "hidden", backgroundColor: theme.card,
        }}>
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.5fr 0.8fr 0.8fr 1fr 1.2fr 1fr 0.5fr",
            borderBottom: `4px solid ${theme.foreground}`, padding: "14px 16px",
          }}>
            {TABLE_HEADERS.map((h) => (
              <div key={h} style={{ fontSize: 13, fontWeight: 500, color: theme.foreground }}>{h}</div>
            ))}
          </div>

          {/* Data rows */}
          {candidates.slice(0, 7).map((c, i) => {
            const rowEnter = spring({ frame: frame - (showFiltered ? 235 : 40) - i * 4, fps, config: { damping: 100 } });
            return (
              <div key={c.id} style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 0.5fr 0.8fr 0.8fr 1fr 1.2fr 1fr 0.5fr",
                padding: "14px 16px", borderBottom: `2px solid rgba(226,232,240,0.5)`,
                opacity: rowEnter, transform: `translateY(${(1 - rowEnter) * 10}px)`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.first_name} {c.last_name}</div>
                <div style={{ fontSize: 13 }}>{c.national_id}</div>
                <div style={{ fontSize: 13 }}>{c.passport_number}</div>
                <div style={{ fontSize: 13 }}>{c.age}</div>
                <div style={{ fontSize: 13 }}>{c.industry}</div>
                <div style={{ fontSize: 13 }}>{c.profession}</div>
                <div style={{ fontSize: 13 }}>{c.company}</div>
                <div><StatusBadge status={c.status} /></div>
                <div style={{ fontSize: 13, color: theme.mutedForeground }}>{c.updated}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Eye size={14} color={theme.mutedForeground} />
                  <Pencil size={14} color={theme.mutedForeground} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 16, fontSize: 13, color: theme.mutedForeground,
        }}>
          <span>Showing 1-{candidates.length > 7 ? 7 : candidates.length} of {showFiltered ? "5" : "847"} candidates</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["←", "1", "2", "3", "...", "34", "→"].map((p, i) => (
              <span key={i} style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6, fontSize: 13, fontWeight: p === "1" ? 600 : 400,
                backgroundColor: p === "1" ? theme.primary : "transparent",
                color: p === "1" ? theme.primaryForeground : theme.foreground,
                border: p === "1" ? "none" : `1px solid ${theme.border}`,
              }}>{p}</span>
            ))}
          </div>
        </div>
      </AppShell>

      {/* Export toast */}
      {showToast && (
        <div style={{
          position: "absolute", top: 20, right: 20,
          backgroundColor: "#15803d", color: "white", padding: "12px 24px",
          borderRadius: 8, fontSize: 14, fontWeight: 500,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          opacity: toastEnter, transform: `translateY(${(1 - toastEnter) * -20}px)`,
        }}>
          ✓ Export complete — 5 candidates exported
        </div>
      )}

      <SceneTitle title="Complete Lifecycle Management" subtitle="CANDIDATES" startFrame={10} />

      <FeatureCallout
        startFrame={350}
        features={[
          { icon: "📝", label: "40+ Candidate Fields" },
          { icon: "🔍", label: "Search Name, ID, Passport" },
          { icon: "🏭", label: "Industry → Profession Mapping" },
          { icon: "🔒", label: "Auto Blacklist Check" },
          { icon: "📤", label: "CSV & PDF Export" },
          { icon: "⚡", label: "Age Auto-Calculated" },
        ]}
      />

      <AnimatedCursor path={cursorPath} clickFrames={clickFrames} />
      <OverlayText text="Complete Lifecycle. From First Contact to Arrival." startFrame={360} duration={80} />
    </AbsoluteFill>
  );
};
