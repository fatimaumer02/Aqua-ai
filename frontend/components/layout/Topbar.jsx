"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, Sun, Moon, X, AlertTriangle, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getTheme, riskColor } from "@/lib/theme";
import { fetchAlerts, alertToUi } from "@/lib/api";

export default function Topbar({ title, subtitle, onMenuClick, actions }) {
  const { mode, accent, toggleMode } = useTheme();
  const t = getTheme(mode, accent);
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts()
      .then((data) => setAlerts(data.map(alertToUi)))
      .catch((err) => console.error("Failed to load alerts:", err));
  }, []);

  function handleSignOut() {
    signOut();
    router.push("/sign-in");
  }

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/streams?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: t.navBg, backdropFilter: "blur(10px)", borderBottom: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <button
            onClick={onMenuClick}
            className="flex lg:hidden"
            style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 8, color: t.textPrimary, cursor: "pointer", padding: 6, flexShrink: 0 }}
            aria-label="Open menu"
          >
            <Menu size={17} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: t.textPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
            {subtitle && <p style={{ margin: "2px 0 0", fontSize: 12.5, color: t.textSecondary }}>{subtitle}</p>}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {actions}

          {searchOpen ? (
            <form onSubmit={submitSearch} style={{ display: "flex", alignItems: "center", gap: 6, background: t.surfaceRaised, border: `1px solid ${t.border}`, borderRadius: 9, padding: "0 10px", height: 34 }}>
              <Search size={14} color={t.textMuted} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="Search streams..."
                style={{ background: "transparent", border: "none", outline: "none", color: t.textPrimary, fontSize: 12.5, width: 140 }}
              />
              <button type="button" onClick={() => { setSearchOpen(false); setQuery(""); }} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", display: "flex" }} aria-label="Close search">
                <X size={13} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Search">
              <Search size={15} />
            </button>
          )}

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
              aria-label="Notifications"
            >
              <Bell size={15} />
              {alerts.length > 0 && <span style={{ position: "absolute", top: 6, right: 7, width: 6, height: 6, borderRadius: "50%", background: t.bad }} />}
            </button>

            {notifOpen && (
              <>
                <div onClick={() => setNotifOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                <div style={{ position: "absolute", right: 0, top: 42, width: 300, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.25)", zIndex: 31, overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.borderSoft}`, fontSize: 12.5, fontWeight: 600, color: t.textPrimary }}>
                    Notifications
                  </div>
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {alerts.length === 0 && (
                      <p style={{ margin: 0, padding: "14px", fontSize: 12, color: t.textMuted, textAlign: "center" }}>
                        No alerts right now.
                      </p>
                    )}
                    {alerts.map((a) => (
                      <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${t.borderSoft}` }}>
                        <AlertTriangle size={14} color={riskColor(t, a.level)} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{a.stream}</p>
                          <p style={{ margin: "1px 0 0", fontSize: 11.5, color: t.textSecondary }}>{a.note}</p>
                          <p style={{ margin: "1px 0 0", fontSize: 10, color: t.textMuted, fontFamily: "var(--font-mono)" }}>{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/alerts"
                    onClick={() => setNotifOpen(false)}
                    style={{ display: "block", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 600, color: t.primary, textDecoration: "none" }}
                  >
                    View all alerts
                  </Link>
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleMode}
            style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Toggle theme"
          >
            {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* User menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.border}`, background: t.primarySoft, color: t.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}
              aria-label="User menu"
            >
              {initial}
            </button>

            {userMenuOpen && (
              <>
                <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
                <div style={{ position: "absolute", right: 0, top: 42, width: 200, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.25)", zIndex: 31, overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${t.borderSoft}` }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: t.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", color: t.bad, fontSize: 12.5, fontWeight: 500, cursor: "pointer", textAlign: "left" }}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
