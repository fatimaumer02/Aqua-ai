
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, FileText, Sparkles } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTheme } from "@/lib/theme";
import {
  REPORT_TYPES,
  REPORTS as INITIAL_REPORTS,
  STREAMS,
  ALERTS,
} from "@/lib/mockData";
import {
  getLocalList,
  STORAGE_KEYS,
} from "@/lib/localStore";
import { downloadJSON } from "@/lib/download";
import DashboardShell from "@/components/layout/DashboardShell";

export default function Reports() {
  // ================================
  // Theme
  // ================================
  const { mode, accent } = useTheme();
  const t = getTheme(mode, accent);

  // ================================
  // Component State
  // ================================
  const [tab, setTab] = useState("Summary Reports");
  const [reports, setReports] = useState(
    INITIAL_REPORTS
  );

  // ================================
  // Load locally generated reports
  // ================================
  useEffect(() => {
    const added = getLocalList(
      STORAGE_KEYS.reports
    );

    if (added.length) {
      setReports([
        ...added,
        ...INITIAL_REPORTS,
      ]);
    }
  }, []);

  // ================================
  // Download Report Type
  // ================================
  function handleDownloadType(reportType) {
    downloadJSON(
      `aquaguard-${reportType.key}-report-${new Date()
        .toISOString()
        .slice(0, 10)}.json`,
      {
        reportType: reportType.name,
        generatedAt: new Date().toISOString(),
        streams: STREAMS,
        alerts: ALERTS,
      }
    );
  }

  // ================================
  // Download Recent Report
  // ================================
  function handleDownloadRecent(report) {
    downloadJSON(
      `${report.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-${report.date
        .replace(/[\s,]+/g, "-")}.json`,
      {
        report: report.name,
        range: report.range,
        generated: report.date,
        streams:
          report.streams ||
          STREAMS.map((s) => s.name),
        alerts: ALERTS,
      }
    );
  }

  return (
    <DashboardShell
      active="/reports"
      title="Reports"
      subtitle="Generate and download reports"

      // ================================
      // Generate Report Button
      // ================================
      actions={
        <Link
          href="/reports/generate"
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold no-underline"
          style={{
            color:
              mode === "dark"
                ? "#0B1417"
                : "#fff",
            background: t.primary,
          }}
        >
          <Sparkles size={13} />
          Generate Report
        </Link>
      }
    >
      {/* ================================
          Report Tabs
      ================================= */}
      <div className="mb-[18px] flex gap-1.5">
        {[
          "Summary Reports",
          "Custom Reports",
        ].map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className="cursor-pointer rounded-lg px-3.5 py-[7px] text-[12.5px] font-medium"
            style={{
              border: `1px solid ${
                tab === tb
                  ? t.primary
                  : t.border
              }`,
              background:
                tab === tb
                  ? t.primarySoft
                  : "transparent",
              color:
                tab === tb
                  ? t.primary
                  : t.textSecondary,
            }}
          >
            {tb}
          </button>
        ))}
      </div>

      {/* ================================
          Custom Reports Tab
      ================================= */}
      {tab === "Custom Reports" ? (
        <div
          className="mb-5 rounded-[14px] border p-10 text-center"
          style={{
            background: t.surface,
            borderColor: t.border,
          }}
        >
          <p
            className="mb-[14px] mt-0 text-[13px]"
            style={{
              color: t.textSecondary,
            }}
          >
            Build a fully custom report with
            the report wizard.
          </p>

          <Link
            href="/reports/generate"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-[9px] text-[12.5px] font-semibold no-underline"
            style={{
              color:
                mode === "dark"
                  ? "#0B1417"
                  : "#fff",
              background: t.primary,
            }}
          >
            <Sparkles size={13} />
            Open Report Wizard
          </Link>
        </div>
      ) : (
        /* ================================
           Summary Report Cards
        ================================= */
        <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_TYPES.map((r) => (
            <div
              key={r.key}
              className="rounded-[14px] border p-[18px]"
              style={{
                background: t.surface,
                borderColor: t.border,
              }}
            >
              {/* Report Icon */}
              <div
                className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[9px]"
                style={{
                  background: t.primarySoft,
                }}
              >
                <FileText
                  size={16}
                  color={t.primary}
                />
              </div>

              {/* Report Name */}
              <h3
                className="mb-1.5 mt-0 font-[family-name:var(--font-display)] text-[14.5px] font-semibold"
                style={{
                  color: t.textPrimary,
                }}
              >
                {r.name}
              </h3>

              {/* Report Description */}
              <p
                className="mb-4 mt-0 text-xs leading-[1.5]"
                style={{
                  color: t.textSecondary,
                }}
              >
                {r.copy}
              </p>

              {/* Download Button */}
              <button
                onClick={() =>
                  handleDownloadType(r)
                }
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-[7px] text-xs font-semibold"
                style={{
                  color: t.primary,
                  background: "transparent",
                  border: `1px solid ${t.primary}40`,
                }}
              >
                <Download size={12} />
                Download
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================================
          Recent Reports Section
      ================================= */}
      <div
        className="rounded-[14px] border p-5"
        style={{
          background: t.surface,
          borderColor: t.border,
        }}
      >
        {/* Section Heading */}
        <h3
          className="mb-[14px] mt-0 font-[family-name:var(--font-display)] text-[15px] font-semibold"
          style={{
            color: t.textPrimary,
          }}
        >
          Recent Reports
        </h3>

        {/* ================================
            Responsive Table Wrapper
        ================================= */}
        <div className="table-scroll">
          <table className="w-full min-w-[480px] border-collapse">
            {/* ================================
                Table Header
            ================================= */}
            <thead>
              <tr className="text-left">
                {[
                  "Report",
                  "Range",
                  "Generated",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b pb-2.5 text-[11.5px] font-medium"
                    style={{
                      color: t.textMuted,
                      borderBottomColor:
                        t.borderSoft,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ================================
                Table Body
            ================================= */}
            <tbody>
              {reports.map((r, i) => (
                <tr
                  key={
                    r.name +
                    r.date +
                    i
                  }
                >
                  {/* Report Name */}
                  <td
                    className="border-b py-3 text-[13px] font-medium"
                    style={{
                      color: t.textPrimary,
                      borderBottomColor:
                        t.borderSoft,
                    }}
                  >
                    {r.name}
                  </td>

                  {/* Report Range */}
                  <td
                    className="border-b py-3 text-[12.5px]"
                    style={{
                      color:
                        t.textSecondary,
                      borderBottomColor:
                        t.borderSoft,
                    }}
                  >
                    {r.range}
                  </td>

                  {/* Generated Date */}
                  <td
                    className="border-b py-3 font-mono text-xs"
                    style={{
                      color: t.textMuted,
                      borderBottomColor:
                        t.borderSoft,
                    }}
                  >
                    {r.date}
                  </td>

                  {/* Download Action */}
                  <td
                    className="border-b py-3 text-right"
                    style={{
                      borderBottomColor:
                        t.borderSoft,
                    }}
                  >
                    <button
                      onClick={() =>
                        handleDownloadRecent(
                          r
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent text-[11.5px] font-semibold"
                      style={{
                        color: t.primary,
                      }}
                    >
                      <Download size={12} />
                      JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}

