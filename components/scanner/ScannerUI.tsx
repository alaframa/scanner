// components/scanner/ScannerUI.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { submitDeployment } from "@/lib/actions/deployments";
import { enqueue, flushQueue } from "@/lib/queue";
import { triggerFlash } from "@/components/ui/FlashOverlay";
import { QrScanner } from "@/components/scanner/QrScanner";
import { SessionBadge } from "@/components/scanner/SessionBadge";
import { ScannedList } from "@/components/scanner/ScannedList";
import { playBeep } from "@/lib/audio";

interface ScannerUIProps {
  username: string;
  role: string;
}

export type ScanMode = "desk" | "user";

export interface ScannedAsset {
  id: string;
  serial: string;
  timestamp: number;
}

export function ScannerUI({ username, role }: ScannerUIProps) {
  const [mode, setMode] = useState<ScanMode>("desk");
  const [deskNumber, setDeskNumber] = useState<string>("");
  const [userCode, setUserCode] = useState<string>("");
  const [scanned, setScanned] = useState<ScannedAsset[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const manualRef = useRef<HTMLInputElement>(null);

  // Background queue flush every 10s
  useEffect(() => {
    const interval = setInterval(() => flushQueue(), 10_000);
    return () => clearInterval(interval);
  }, []);

  function showStatus(msg: string) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  const handleScan = useCallback(
    (serial: string) => {
      const normalized = serial.trim().toUpperCase();
      if (!normalized) return;

      const duplicate = scanned.find((a) => a.serial === normalized);
      if (duplicate) {
        playBeep(300, 120);
        if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
        showStatus(`DUPLICATE: ${normalized}`);
        return;
      }

      playBeep(880, 80);
      if (navigator.vibrate) navigator.vibrate(50);
      triggerFlash("success");

      setScanned((prev) => [
        { id: crypto.randomUUID(), serial: normalized, timestamp: Date.now() },
        ...prev,
      ]);
      showStatus(`ADDED: ${normalized}`);
    },
    [scanned],
  );

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScan(manualInput);
    setManualInput("");
    manualRef.current?.focus();
  }

  function removeAsset(id: string) {
    setScanned((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleDeploy() {
    if (scanned.length === 0) return;
    if (mode === "desk" && !deskNumber.trim()) {
      showStatus("DESK NUMBER REQUIRED");
      return;
    }
    if (mode === "user" && !userCode.trim()) {
      showStatus("USER CODE REQUIRED");
      return;
    }

    setIsPending(true);

    const payload = {
      mode,
      deskNumber: mode === "desk" ? deskNumber.trim() : undefined,
      userCode: mode === "user" ? userCode.trim().toUpperCase() : undefined,
      serials: scanned.map((a) => a.serial),
      deployedBy: username,
      deployedAt: new Date().toISOString(),
    };

    try {
      const result = await submitDeployment(payload);
      if (result.success) {
        triggerFlash("success");
        playBeep(880, 200);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setScanned([]);
        setDeskNumber("");
        setUserCode("");
        showStatus(`DEPLOYED ${payload.serials.length} ASSET(S)`);
      } else {
        throw new Error(result.error);
      }
    } catch {
      // Offline — enqueue
      enqueue(payload);
      triggerFlash("error");
      playBeep(300, 300);
      showStatus("QUEUED OFFLINE — WILL RETRY");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 flex-shrink-0"
            style={{
              background: "#f0ff44",
              clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
            }}
          />
          <span
            className="text-xs tracking-[0.25em] uppercase text-[#888]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            AssetTrack
          </span>
        </div>
        <SessionBadge username={username} role={role} />
      </header>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6 gap-5">
        {/* Mode Toggle */}
        <div
          className="card-surface rounded flex overflow-hidden"
          role="group"
          aria-label="Scan mode"
        >
          {(["desk", "user"] as ScanMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-150 ${
                mode === m
                  ? "bg-[#f0ff44] text-black font-bold"
                  : "text-[#888] hover:text-[#f5f5f5]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {m === "desk" ? "📋 Desk Mode" : "👤 User Mode"}
            </button>
          ))}
        </div>

        {/* Target input */}
        <div className="card-surface rounded p-4 space-y-3">
          <label
            className="block text-xs text-[#888] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {mode === "desk" ? "Desk Number" : "User Code"}
          </label>
          <input
            type={mode === "desk" ? "number" : "text"}
            value={mode === "desk" ? deskNumber : userCode}
            onChange={(e) =>
              mode === "desk"
                ? setDeskNumber(e.target.value)
                : setUserCode(e.target.value)
            }
            className="input-industrial w-full px-4 py-3 rounded text-sm"
            placeholder={mode === "desk" ? "e.g. 42" : "e.g. EMP-0042"}
            autoCapitalize="characters"
          />
        </div>

        {/* QR Scanner toggle */}
        <button
          onClick={() => setShowScanner((v) => !v)}
          className={`w-full py-4 rounded text-sm tracking-[0.15em] uppercase border transition-all duration-150 ${
            showScanner
              ? "border-[#f0ff44] text-[#f0ff44] bg-[rgba(240,255,68,0.05)]"
              : "btn-ghost"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {showScanner ? "◼ Stop Camera" : "▶ Start QR Scanner"}
        </button>

        {showScanner && (
          <div className="card-surface rounded overflow-hidden">
            <QrScanner onScan={handleScan} />
          </div>
        )}

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            ref={manualRef}
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="input-industrial flex-1 px-4 py-3 rounded text-sm"
            placeholder="Manual serial entry..."
            autoCapitalize="characters"
          />
          <button type="submit" className="btn-ghost px-5 py-3 rounded text-xs">
            ADD
          </button>
        </form>

        {/* Status message */}
        {statusMsg && (
          <div
            className="text-center text-xs py-2 tracking-widest animate-pulse"
            style={{
              fontFamily: "var(--font-mono)",
              color:
                statusMsg.startsWith("DUPLICATE") ||
                statusMsg.startsWith("QUEUED")
                  ? "#ff4444"
                  : "#44ff88",
            }}
          >
            {statusMsg}
          </div>
        )}

        {/* Scanned list */}
        <ScannedList items={scanned} onRemove={removeAsset} />

        {/* Deploy button */}
        <button
          onClick={handleDeploy}
          disabled={isPending || scanned.length === 0}
          className="btn-accent w-full py-5 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
        >
          {isPending ? "DEPLOYING..." : `SUBMIT DEPLOYMENT (${scanned.length})`}
        </button>
      </div>
    </div>
  );
}
