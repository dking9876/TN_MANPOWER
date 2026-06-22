import React from "react";
import {
  LayoutDashboard, Users, Bell, UserCog, Settings, LogOut, ChevronLeft,
} from "lucide-react";
import { theme } from "../lib/theme";

interface AppShellProps {
  children: React.ReactNode;
  activePage: "dashboard" | "candidates" | "alerts" | "documents" | "settings";
  alertCount?: number;
  fontFamily: string;
  headingFontFamily: string;
}

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "Candidates", icon: Users, page: "candidates" },
  { label: "Alerts", icon: Bell, page: "alerts", showBadge: true },
];

const ADMIN = [
  { label: "User Management", icon: UserCog, page: "users" },
  { label: "Settings", icon: Settings, page: "settings" },
];

export const AppShell: React.FC<AppShellProps> = ({
  children, activePage, alertCount = 23, fontFamily, headingFontFamily,
}) => {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", fontFamily, color: theme.foreground }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, height: "100%", display: "flex", flexDirection: "column",
        backgroundColor: theme.background, borderRight: `1px solid ${theme.sidebarBorder}`,
      }}>
        {/* Brand */}
        <div style={{
          display: "flex", alignItems: "center", height: 64, padding: "0 20px",
          borderBottom: `1px solid rgba(203,213,225,0.5)`, gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6, fontSize: 14, fontWeight: 700,
            background: "linear-gradient(135deg, #0F172A, #0369A1, #1e3a5f)",
            color: theme.primaryForeground,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}>
            TN
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "0.025em" }}>
            T.N Manpower
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((item) => {
            const active = item.page === activePage;
            return (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", fontSize: 14, fontWeight: 500, borderRadius: 6,
                backgroundColor: active ? theme.muted : "transparent",
                borderLeft: active ? `2px solid ${theme.primary}` : "2px solid transparent",
                color: active ? theme.foreground : theme.mutedForeground,
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}>
                <item.icon size={16} strokeWidth={2} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.showBadge && alertCount > 0 && (
                  <span style={{
                    backgroundColor: theme.destructive, color: "white", borderRadius: 4,
                    padding: "1px 6px", fontSize: 10, fontWeight: 700, lineHeight: "16px",
                  }}>
                    {alertCount}
                  </span>
                )}
              </div>
            );
          })}

          {/* Separator */}
          <div style={{ height: 1, backgroundColor: theme.sidebarBorder, margin: "12px 0" }} />
          <div style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
            color: "rgba(2,6,23,0.4)", fontWeight: 500, padding: "0 12px", marginBottom: 4,
          }}>
            Admin
          </div>
          {ADMIN.map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", fontSize: 14, fontWeight: 500, borderRadius: 6,
              color: theme.mutedForeground, borderLeft: "2px solid transparent",
            }}>
              <item.icon size={16} strokeWidth={2} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${theme.sidebarBorder}`, padding: "8px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 4, fontSize: 12, fontWeight: 600,
              backgroundColor: theme.muted, color: theme.foreground,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              D
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Daniel Admin</div>
              <div style={{ fontSize: 10, color: "rgba(2,6,23,0.5)" }}>ADMIN</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 4px" }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              padding: "6px 8px", fontSize: 12, color: theme.mutedForeground, borderRadius: 4,
            }}>
              <LogOut size={14} /> Sign out
            </div>
            <div style={{ padding: "6px 8px", color: theme.mutedForeground }}>
              <ChevronLeft size={14} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1, overflow: "hidden", backgroundColor: theme.background, padding: "24px 32px",
      }}>
        {children}
      </main>
    </div>
  );
};
