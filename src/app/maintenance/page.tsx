"use client"

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ApiResponse = {
  isOn?: boolean;
  IsOn?: boolean;
  remainingSeconds?: number | null;
  RemainingSeconds?: number | null;
  endsAt?: string | null;
  EndsAt?: string | null;
  message?: string | null;
  Message?: string | null;
  updatedAt?: string | null;
  UpdatedAt?: string | null;
};

function formatCountdown(sec: number | null) {
  if (sec === null) return "--:--:--";
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (hours > 0) return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function humanizeSeconds(sec: number | null) {
  if (sec === null) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""} ${m} min`;
  if (m > 0) return `${m} minute${m > 1 ? "s" : ""}`;
  return `${sec} second${sec > 1 ? "s" : ""}`;
}

export default function MaintenancePage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOn, setIsOn] = useState<boolean | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const initialTotalRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const redirectRef = useRef<number | null>(null);

  const parseApi = (data: ApiResponse) => {
    const on = data.isOn ?? data.IsOn ?? false;
    const rem = (data.remainingSeconds ?? data.RemainingSeconds) ?? null;
    const end = data.endsAt ?? data.EndsAt ?? null;
    const msg = data.message ?? data.Message ?? null;
    const upd = data.updatedAt ?? data.UpdatedAt ?? null;
    return { on, rem, end, msg, upd };
  };

  const fetchStatus = async () => {
    try {
      setError(null);
      const res = await fetch(`http://localhost:5157/api/maintenance/status`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json: ApiResponse = await res.json();
      const { on, rem, end, msg, upd } = parseApi(json);
      setIsOn(on);
      setRemaining(rem);
      setEndsAt(end);
      setMessage(msg);
      setUpdatedAt(upd);

      // If we can calculate total duration do it once (used for progress)
      if (on && end && upd && initialTotalRef.current === null) {
        const endD = new Date(end);
        const updD = new Date(upd);
        const total = Math.max(1, Math.round((endD.getTime() - updD.getTime()) / 1000));
        if (total > 0) initialTotalRef.current = total;
      }
    } catch (e) {
      setError("Unable to load maintenance status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = window.setInterval(fetchStatus, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isOn && remaining !== null && remaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => (r !== null ? Math.max(0, r - 1) : r));
      }, 1000);
    }

    if (remaining === 0) {
      fetchStatus();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOn, remaining]);

  // Auto-redirect when maintenance is off
  useEffect(() => {
    if (isOn === false) {
      redirectRef.current = window.setTimeout(() => {
        router.push("/");
      }, 3000);
    } else {
      if (redirectRef.current) {
        clearTimeout(redirectRef.current);
        redirectRef.current = null;
      }
    }
    return () => {
      if (redirectRef.current) clearTimeout(redirectRef.current);
    };
  }, [isOn, router]);

  const formatLocalEndsAt = (iso?: string | null) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return iso;
    }
  };

  const percent = initialTotalRef.current && remaining !== null && initialTotalRef.current > 0
    ? Math.max(0, Math.min(100, Math.round((1 - (remaining / initialTotalRef.current)) * 100)))
    : null;

  return (
    <main style={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 48, flexDirection: "column" }}>
      <div style={{ maxWidth: 900, width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: 8, fontSize: 36 }}>We'll be back soon</h1>
        <p style={{ marginTop: 0, marginBottom: 18, color: "#374151" }}>We're performing scheduled maintenance to improve the site. Thank you for your patience.</p>

        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading status…</p>
        ) : error ? (
          <div style={{ padding: 20, background: "#fff5f5", borderRadius: 8, color: "#b91c1c" }}>
            <p>{error}</p>
            <button onClick={() => { setLoading(true); fetchStatus(); }} style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6 }}>Retry</button>
          </div>
        ) : isOn ? (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 54, fontWeight: 700, marginBottom: 6 }}>{formatCountdown(remaining)}</div>
            <div style={{ color: "#6b7280", marginBottom: 12 }}>
              {remaining === null ? (endsAt ? `Resumes at ${formatLocalEndsAt(endsAt)}` : "Expected end time not specified") : `Estimated time left: ${humanizeSeconds(remaining)}`}
            </div>

            {percent !== null ? (
              <div style={{ margin: "18px 0" }}>
                <div style={{ height: 12, background: "#e6eef0", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg,#06b6d4,#0ea5a4)", transition: "width 400ms ease" }} />
                </div>
                <div style={{ marginTop: 8, color: "#374151" }}>{percent}% complete</div>
              </div>
            ) : null}

            {message ? <div style={{ marginTop: 12, color: "#374151" }}>{message}</div> : null}

            <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => fetchStatus()} style={{ padding: "10px 16px", borderRadius: 8, background: "#f3f4f6", border: "1px solid #e5e7eb" }}>Refresh</button>
              <Link href="/" style={{ padding: "10px 16px", borderRadius: 8, background: "#0ea5a4", color: "#fff", textDecoration: "none" }}>Return to home</Link>
            </div>

            <div style={{ marginTop: 12, color: "#6b7280", fontSize: 13 }}>This page will automatically return to the site when maintenance completes.</div>
          </div>
        ) : (
          <div style={{ marginTop: 6 }}>
            <p style={{ color: "#10b981" }}>Service is available.</p>
            <Link href="/" style={{ color: "#0ea5a4" }}>Return to home</Link>
          </div>
        )}
      </div>
    </main>
  );
}
