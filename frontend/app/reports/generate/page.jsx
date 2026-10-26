"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText, ShieldCheck, ClipboardCheck, Settings2, Check, CheckCircle2,
  Download, Share2, ArrowRight, Droplets, X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import { REPORT_TYPE_OPTIONS, STREAMS } from "@/lib/mockData";
import { addLocalItem, STORAGE_KEYS, getLocalList } from "@/lib/localStore";
import { downloadReportText, downloadCSV, shareOrCopy } from "@/lib/download";
import WizardShell from "@/components/layout/WizardShell";
import { SelectInput, TextInput } from "@/components/ui/FormField";

const STEPS = ["Report Type", "Filters", "Preview", "Generate"];
const TYPE_ICON = { summary: FileText, risk: ShieldCheck, compliance: ClipboardCheck, custom: Settings2 };

const SECTIONS = [
  { key: "observations", label: "Executive Summary", copy: "Overview and key highlights", icon: FileText },
  { key: "observations", label: "Stream Overview", copy: "Summary of selected streams", icon: Droplets },
  { key: "observations", label: "Water Quality Summary", copy: "Key water quality metrics", icon: ShieldCheck },
  { key: "insights", label: "Risk Analysis", copy: "Risk distribution and trends", icon: ShieldCheck },
  { key: "observations", label: "Alerts Summary", copy: "Important alerts during period", icon: ClipboardCheck },
  { key: "biodiversity", label: "Biodiversity Overview", copy: "Biological health indicators", icon: Droplets },
  { key: "insights", label: "Key Insights & Recommendations", copy: "Actionable insights and next steps", icon: FileText },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function GenerateReport() {
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);
  const router = useRouter();

  const allStreams = useMemo(() => [...getLocalList(STORAGE_KEYS.streams), ...STREAMS], []);

  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState("Custom Range");
  const [from, setFrom] = useState("2026-05-18");
  const [to, setTo] = useState(todayISO());
  const [selectedStreams, setSelectedStreams] = useState(allStreams.slice(0, 1).map((s) => s.id));
  const [riskLevel, setRiskLevel] = useState("All Levels");
  const [dataType, setDataType] = useState("All Data");
  const [include, setInclude] = useState({ observations: true, insights: true, biodiversity: true });
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const selectedType = REPORT_TYPE_OPTIONS.find((r) => r.key === reportType);
  const streamNames = allStreams.filter((s) => selectedStreams.includes(s.id)).map((s) => s.name);
  const visibleSections = SECTIONS.filter((s) => include[s.key]);

  function toggleStream(id) {
    setSelectedStreams((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function goNext() { setStep((s) => Math.min(s + 1, 4)); }
  function goBack() { setStep((s) => Math.max(s - 1, 1)); }

  const recordCount = streamNames.length * 26; // illustrative, matches mock cadence

  function handleGenerate() {
    setGenerating(true);
    const record = {
      name: selectedType?.name || "Report",
      range: `${from} - ${to}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      streams: streamNames,
      recordCount,
    };
    setTimeout(() => {
      addLocalItem(STORAGE_KEYS.reports, record);
      setGenerating(false);
      setGenerated(true);
      setStep(4);
    }, 900);
  }

  function handleDownloadPDF() {
    downloadReportText(`aquaguard-${reportType}-report-${todayISO()}.txt`, [
      "AquaGuard AI - " + (selectedType?.name || "Report"),
      `Date range: ${from} to ${to}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Streams included: ${streamNames.join(", ") || "None selected"}`,
      `Records included: ${recordCount}`,
      "",
      "Sections included:",
      ...visibleSections.map((s) => `- ${s.label}: ${s.copy}`),
    ]);
  }

  function handleDownloadExcel() {
    downloadCSV(`aquaguard-${reportType}-report-${todayISO()}.csv`, [
      ["Report Type", "Date Range", "Generated On", "Streams Included", "Records Included"],
      [selectedType?.name, `${from} - ${to}`, new Date().toLocaleString(), streamNames.join("; "), recordCount],
    ]);
  }

  async function handleShare() {
    const result = await shareOrCopy(
      `AquaGuard AI - ${selectedType?.name}`,
      `${selectedType?.name} (${from} to ${to}) - ${streamNames.length} streams, ${recordCount} records.`
    );
    setShareStatus(result);
    setTimeout(() => setShareStatus(""), 2500);
  }

  return (
    <WizardShell
      t={t}
      active="/reports"
      title="Generate Report"
      subtitle="Urban Stream Health"
      backHref="/reports"
      backLabel="Back to Reports"
      steps={STEPS}
      currentStep={step}
    >
      {step === 1 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: "0 0 16px" }}>Select Report Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REPORT_TYPE_OPTIONS.map((r) => {
              const Icon = TYPE_ICON[r.key];
              const active = reportType === r.key;
              return (
                <button
                  key={r.key} type="button" onClick={() => setReportType(r.key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, padding: 16, borderRadius: 12, cursor: "pointer", textAlign: "left",
                    border: `1.5px solid ${active ? t.good : t.border}`,
                    background: active ? t.goodSoft : t.surfaceRaised,
                  }}
                >
                  <Icon size={18} color={active ? t.good : t.textMuted} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? t.good : t.textPrimary }}>{r.name}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 18, background: t.surfaceRaised, border: `1px solid ${t.borderSoft}`, borderRadius: 10, padding: 14 }}>
            <p style={{ fontSize: 11, color: t.textMuted, fontFamily: "var(--font-mono)", margin: "0 0 6px" }}>REPORT DESCRIPTION</p>
            <p style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.6, margin: 0 }}>{selectedType?.copy}</p>
          </div>
          <StepFooterInline t={t} mode={mode} onNext={goNext} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: "0 0 16px" }}>Filter Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <SelectInput t={t} label="Date Range" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              {["Custom Range", "Last 7 Days", "Last 30 Days", "Last 90 Days"].map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
            <div>
              <label style={{ fontSize: 12, color: t.textSecondary, display: "block", marginBottom: 5, fontWeight: 500 }}>Streams</label>
              <div style={{ border: `1px solid ${t.border}`, borderRadius: 8, padding: 10, maxHeight: 120, overflowY: "auto", background: t.surfaceRaised }}>
                {allStreams.map((s) => (
                  <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: t.textPrimary, padding: "4px 0", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedStreams.includes(s.id)} onChange={() => toggleStream(s.id)} />
                    {s.name}
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span style={{ fontSize: 11, color: t.textMuted }}>{selectedStreams.length} selected</span>
                <button type="button" onClick={() => setSelectedStreams([])} style={{ fontSize: 11, color: t.primary, background: "none", border: "none", cursor: "pointer" }}>Clear All</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <TextInput t={t} label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <TextInput t={t} label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <SelectInput t={t} label="Risk Level" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
              {["All Levels", "High", "Medium", "Low"].map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
            <SelectInput t={t} label="Data Type" value={dataType} onChange={(e) => setDataType(e.target.value)}>
              {["All Data", "Observations Only", "Alerts Only"].map((o) => <option key={o}>{o}</option>)}
            </SelectInput>
          </div>

          <div>
            <label style={{ fontSize: 12, color: t.textSecondary, display: "block", marginBottom: 8, fontWeight: 500 }}>Include</label>
            <div className="flex flex-wrap gap-4">
              {[["observations", "Observations"], ["insights", "AI Insights"], ["biodiversity", "Biodiversity"]].map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: t.textPrimary, cursor: "pointer" }}>
                  <input type="checkbox" checked={include[key]} onChange={(e) => setInclude((v) => ({ ...v, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <StepFooterInline t={t} mode={mode} onBack={goBack} onNext={goNext} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: t.textPrimary, margin: "0 0 16px" }}>Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-5">
            <div style={{ background: `linear-gradient(160deg, ${t.primarySoft}, ${t.surfaceRaised})`, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: t.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Droplets size={12} color={mode === "dark" ? "#0B1417" : "#fff"} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: t.textPrimary, fontFamily: "var(--font-display)" }}>AquaGuard AI</span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: t.textPrimary, margin: "0 0 6px", lineHeight: 1.25 }}>{selectedType?.name}</p>
                <p style={{ fontSize: 11, color: t.textSecondary, margin: 0 }}>{from} - {to}</p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, color: t.textMuted, fontFamily: "var(--font-mono)", margin: "0 0 10px" }}>PREVIEW CONTENT</p>
              <div className="flex flex-col gap-2.5">
                {visibleSections.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: t.textMuted }}>No sections selected - go back and check at least one "Include" option.</p>
                ) : visibleSections.map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: t.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <s.icon size={13} color={t.primary} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: t.textPrimary, margin: 0 }}>{s.label}</p>
                      <p style={{ fontSize: 11.5, color: t.textSecondary, margin: "1px 0 0" }}>{s.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <StepFooterInline t={t} mode={mode} onBack={goBack} onNext={handleGenerate} nextLabel={generating ? "Generating..." : "Generate Report"} nextIcon={ArrowRight} submitting={generating} />
        </div>
      )}

      {step === 4 && generated && (
        <div className="text-center">
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: t.goodSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={30} color={t.good} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: t.textPrimary, margin: "0 0 4px" }}>Report Generated Successfully!</h3>
          <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 24px" }}>Your report is ready to download.</p>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4 text-left max-w-xl mx-auto mb-6">
            <div style={{ background: t.surfaceRaised, border: `1px solid ${t.borderSoft}`, borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 11, color: t.textMuted, fontFamily: "var(--font-mono)", margin: "0 0 10px" }}>REPORT SUMMARY</p>
              {[
                ["Report Type", selectedType?.name],
                ["Date Range", `${from} - ${to}`],
                ["Generated On", new Date().toLocaleString()],
                ["Streams Included", `${streamNames.length} Streams`],
                ["Records Included", `${recordCount} Observations`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span style={{ fontSize: 12, color: t.textSecondary }}>{label}</span>
                  <span style={{ fontSize: 12.5, color: t.textPrimary, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: `linear-gradient(160deg, ${t.primarySoft}, ${t.surfaceRaised})`, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Droplets size={12} color={t.primary} />
                <span style={{ fontSize: 10, fontWeight: 600, color: t.textPrimary }}>AquaGuard AI</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, margin: "10px 0 0" }}>{selectedType?.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button onClick={handleDownloadPDF} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: mode === "dark" ? "#0B1417" : "#fff", background: t.good, border: "none", borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>
              <Download size={13} /> Download PDF
            </button>
            <button onClick={handleDownloadExcel} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: t.textPrimary, background: "transparent", border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>
              <Download size={13} /> Download Excel
            </button>
            <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#fff", background: t.chartBlue, border: "none", borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>
              <Share2 size={13} /> Share Report
            </button>
          </div>
          {shareStatus && (
            <p style={{ fontSize: 11.5, color: t.textMuted, marginTop: 10 }}>
              {shareStatus === "copied" ? "Link copied to clipboard." : shareStatus === "shared" ? "Shared successfully." : shareStatus === "cancelled" ? "Share cancelled." : "Sharing isn't supported in this browser."}
            </p>
          )}

          <Link href="/reports" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: t.textSecondary, textDecoration: "none", marginTop: 20 }}>
            ← Back to Reports
          </Link>
        </div>
      )}
    </WizardShell>
  );
}

function StepFooterInline({ t, mode, onBack, onNext, nextLabel = "Next", nextIcon: NextIcon = ArrowRight, submitting }) {
  return (
    <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: `1px solid ${t.borderSoft}` }}>
      {onBack ? (
        <button type="button" onClick={onBack} style={{ fontSize: 12.5, fontWeight: 500, color: t.textSecondary, background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "9px 16px", cursor: "pointer" }}>
          ← Previous
        </button>
      ) : <span />}
      <button
        type="button" onClick={onNext} disabled={submitting}
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: mode === "dark" ? "#0B1417" : "#fff", background: t.good, border: "none", borderRadius: 8, padding: "9px 18px", cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1 }}
      >
        {nextLabel} <NextIcon size={14} />
      </button>
    </div>
  );
}