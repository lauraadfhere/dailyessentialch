"use client";

export type ReportRow = {
  title: string;
  slug: string;
  category: string;
  locale: string;
  status: string;
  publishedAt: string;
};

const headers: (keyof ReportRow)[] = ["title", "slug", "category", "locale", "status", "publishedAt"];

function escapeCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function DownloadReportButton({ rows, filename }: { rows: ReportRow[]; filename: string }) {
  function download() {
    const lines = [headers.join(","), ...rows.map((row) => headers.map((key) => escapeCell(row[key])).join(","))];
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex items-center gap-2 rounded-[3px] bg-[#007185] px-4 py-2 text-[14px] font-medium text-white shadow-sm transition hover:bg-[#005a6b]"
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
      Download report
    </button>
  );
}
