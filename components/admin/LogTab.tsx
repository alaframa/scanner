// components/admin/LogTab.tsx

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Download, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { getDeploymentLog } from "@/lib/actions/deployments";
import * as XLSX from "xlsx";

interface LogEntry {
  id: string;
  serial: string;
  asset_tag: string | null;
  desk_number: number;
  location: string;
  assigned_to: string | null;
  deployed_by: string;
  created_at: string;
  mode: "desk" | "user";
}

const REFRESH_INTERVAL = 5000;

export function LogTab() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isOnline, setIsOnline] = useState(true);
  const [filter, setFilter] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLog = useCallback(async () => {
    try {
      const data = await getDeploymentLog();
      setEntries(data);
      setLastRefresh(new Date());
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setLoading(false);
      setCountdown(REFRESH_INTERVAL / 1000);
    }
  }, []);

  useEffect(() => {
    fetchLog();

    intervalRef.current = setInterval(fetchLog, REFRESH_INTERVAL);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c > 1 ? c - 1 : REFRESH_INTERVAL / 1000));
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchLog]);

  const filtered = entries.filter((e) => {
    const q = filter.toLowerCase();
    return (
      e.serial.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.deployed_by.toLowerCase().includes(q) ||
      (e.assigned_to ?? "").toLowerCase().includes(q) ||
      String(e.desk_number).includes(q)
    );
  });

  const handleExport = () => {
    const rows = filtered.map((e) => ({
      "Serial Number": e.serial,
      "Asset Tag": e.asset_tag ?? "",
      "Desk #": e.desk_number,
      Location: e.location,
      "Assigned To": e.assigned_to ?? "",
      "Deployed By": e.deployed_by,
      Mode: e.mode,
      Timestamp: new Date(e.created_at).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deployments");

    const ts = new Date()
      .toISOString()
      .slice(0, 16)
      .replace("T", "_")
      .replace(":", "-");
    XLSX.writeFile(wb, `assettrack_log_${ts}.xlsx`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1f1f1f] flex-wrap gap-y-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by serial, location, user..."
          className="input-industrial flex-1 min-w-[200px] px-3 py-1.5 rounded text-sm"
        />

        <div className="flex items-center gap-2 ml-auto">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <Wifi size={12} className="text-[#44ff88]" />
            ) : (
              <WifiOff size={12} className="text-[#ff4444]" />
            )}
            <span className="font-mono text-xs text-[#888]">
              Refresh in{" "}
              <span className="text-[#f0ff44] tabular-nums">{countdown}s</span>
            </span>
          </div>

          <button
            onClick={fetchLog}
            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded text-xs"
          >
            <RefreshCw size={11} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="btn-accent flex items-center gap-1.5 px-3 py-1.5 rounded text-xs"
          >
            <Download size={11} />
            Export XLSX
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-6 px-4 py-2 border-b border-[#1f1f1f] bg-[#0d0d0d]">
        <Stat label="Total Records" value={entries.length} />
        <Stat label="Filtered" value={filtered.length} />
        {lastRefresh && (
          <span className="font-mono text-[10px] text-[#3a3a3a] ml-auto">
            Last sync: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 font-mono text-xs text-[#888] tracking-widest">
            LOADING...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-48 font-mono text-xs text-[#3a3a3a] tracking-widest">
            NO RECORDS
          </div>
        ) : (
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-[#0a0a0a] z-10">
              <tr className="border-b border-[#1f1f1f]">
                {[
                  "Serial",
                  "Desk #",
                  "Location",
                  "Assigned To",
                  "Deployed By",
                  "Mode",
                  "Timestamp",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[#888] tracking-widest uppercase text-[10px] whitespace-nowrap font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-b border-[#111] hover:bg-[#111] transition-colors ${
                    i % 2 === 0 ? "bg-[#0a0a0a]" : "bg-[#0c0c0c]"
                  }`}
                >
                  <td className="px-4 py-2.5 serial text-[#f0ff44] tracking-wider">
                    {entry.serial}
                  </td>
                  <td className="px-4 py-2.5 desk-num text-[#f5f5f5] tabular-nums">
                    {String(entry.desk_number).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-2.5 text-[#f5f5f5]">
                    {entry.location}
                  </td>
                  <td className="px-4 py-2.5 text-[#888]">
                    {entry.assigned_to ?? (
                      <span className="text-[#3a3a3a]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[#888]">
                    {entry.deployed_by}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] tracking-widest uppercase font-semibold ${
                        entry.mode === "desk" ? "pill-success" : "pill-error"
                      }`}
                    >
                      {entry.mode}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[#888] tabular-nums whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-[#3a3a3a] uppercase tracking-widest">
        {label}
      </span>
      <span className="font-mono text-sm text-[#f5f5f5] tabular-nums font-semibold">
        {value}
      </span>
    </div>
  );
}
