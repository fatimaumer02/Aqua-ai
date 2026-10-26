// Triggers a real browser file download from in-memory data.
// Used by Export Report / Download Report buttons across the dashboard.
// No backend yet - this packages the current mock data client-side;
// swap the `content` builder for a real API response when ready.
export function downloadTextFile(filename, content, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename, data) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json");
}

// Real CSV (opens correctly in Excel/Sheets) - used for "Download Excel".
export function downloadCSV(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  downloadTextFile(filename, csv, "text/csv");
}

// Plain-text report summary - used for "Download PDF". Note: this is a real
// downloadable .txt file, not an actual PDF binary; true PDF generation
// needs a library or backend service, which isn't wired up yet.
export function downloadReportText(filename, lines) {
  downloadTextFile(filename, lines.join("\n"), "text/plain");
}

// Native share sheet where available (mobile browsers, some desktop), with a
// clipboard-copy fallback everywhere else - both paths are real, working
// user actions, not placeholders.
export async function shareOrCopy(title, text) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch {
      return "cancelled";
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return "copied";
  }
  return "unsupported";
}
