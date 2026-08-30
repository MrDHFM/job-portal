/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ShieldAlert,
  XCircle,
  RefreshCw,
} from "lucide-react";

import type { InstagramTokenHealth } from "@/lib/social/instagram-token";

type Props = {
  health: InstagramTokenHealth;
};

function formatDate(timestamp: number | null): string | null {
  if (!timestamp) return null;

  // Pin to a fixed timezone so the same token doesn't appear to expire
  // at different times depending on which admin/device is viewing it.
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(timestamp * 1000));
}

function expiryLabel(
  timestamp: number | null,
  health: InstagramTokenHealth,
): string {
  const formatted = formatDate(timestamp);

  if (formatted) return formatted;

  // Meta responded successfully but returned no expiry — this is normal
  // for some long-lived Page/Instagram tokens that don't expire on a
  // fixed schedule, not a data problem. Distinguish that from a genuine
  // "we couldn't check" case (config missing / API error / offline).
  const metaRespondedSuccessfully =
    health.status === "healthy" ||
    health.status === "warning" ||
    health.status === "critical" ||
    health.status === "expired";

  return metaRespondedSuccessfully
    ? "No fixed expiry"
    : "Unknown — could not verify";
}

function getStatusStyles(status: InstagramTokenHealth["status"]) {
  switch (status) {
    case "healthy":
      return {
        wrapper:
          "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20",
        icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
        text: "text-emerald-700 dark:text-emerald-400",
      };

    case "warning":
      return {
        wrapper:
          "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20",
        icon: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
        text: "text-amber-700 dark:text-amber-400",
      };

    case "temporary_unavailable":
      return {
        wrapper:
          "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/20",
        icon: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
        text: "text-amber-700 dark:text-amber-400",
      };

    case "critical":
    case "expired":
    case "error":
      return {
        wrapper:
          "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/20",
        icon: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
        text: "text-red-700 dark:text-red-400",
      };

    default:
      return {
        wrapper:
          "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900",
        icon: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
        text: "text-neutral-700 dark:text-neutral-300",
      };
  }
}

export default function InstagramTokenHealth({ health }: Props) {
  const [toastVisible, setToastVisible] = useState(false);

  const styles = getStatusStyles(health.status);

  useEffect(() => {
    if (
      health.status === "warning" ||
      health.status === "critical" ||
      health.status === "expired" ||
      health.status === "temporary_unavailable"
    ) {
      setToastVisible(true);

      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [health.status]);

  if (!health.configured) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
            <div className="h-9 w-9 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center">
              <span className="font-bold text-sm">IG</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">
              Instagram Token Monitoring
            </h3>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {health.message}
            </p>

            <p className="mt-2 text-xs text-neutral-400">
              Add META_APP_ID and META_APP_SECRET to enable automatic
              monitoring.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon =
    health.status === "healthy"
      ? CheckCircle2
      : health.status === "warning"
        ? AlertTriangle
        : health.status === "temporary_unavailable"
          ? RefreshCw
          : health.status === "critical"
            ? ShieldAlert
            : health.status === "expired"
              ? XCircle
              : Clock3;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-lg border p-5 shadow-sm ${styles.wrapper}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 text-white shadow-lg">
              <div className="h-9 w-9 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center">
                <span className="font-bold text-sm">IG</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-900 dark:text-white">
                  Instagram Connection
                </h3>

                <StatusIcon className={`h-4 w-4 ${styles.text}`} />
              </div>

              <p className={`mt-1 text-sm font-medium ${styles.text}`}>
                {health.message}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-200">
            <span
              className={`h-2 w-2 rounded-full ${
                health.status === "healthy"
                  ? "bg-emerald-500"
                  : health.status === "warning" ||
                      health.status === "critical" ||
                      health.status === "temporary_unavailable"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
            />

            {health.status === "healthy"
              ? "Connected"
              : health.status === "warning"
                ? "Token expiring soon"
                : health.status === "critical"
                  ? "Renew token soon"
                  : health.status === "expired"
                    ? "Token expired"
                    : health.status === "temporary_unavailable"
                      ? "Meta check temporarily unavailable"
                      : "Needs attention"}
          </div>
        </div>

        {/* Dates */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-white/70 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Token expires
            </p>

            <p className="mt-1 font-bold text-neutral-900 dark:text-white">
              {expiryLabel(health.expiresAt, health)}
            </p>

            {health.expiresInDays !== null && (
              <p className={`mt-1 text-xs font-semibold ${styles.text}`}>
                {health.expiresInDays <= 0
                  ? "Expired"
                  : `${health.expiresInDays} days remaining`}
              </p>
            )}
          </div>

          <div className="rounded-md border border-white/70 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Data access expires
            </p>

            <p className="mt-1 font-bold text-neutral-900 dark:text-white">
              {expiryLabel(health.dataAccessExpiresAt, health)}
            </p>

            {health.dataAccessExpiresInDays !== null && (
              <p className="mt-1 text-xs font-semibold text-neutral-500">
                {health.dataAccessExpiresInDays <= 0
                  ? "Expired"
                  : `${health.dataAccessExpiresInDays} days remaining`}
              </p>
            )}
          </div>
        </div>

        {/* Action */}
        {(health.status === "warning" ||
          health.status === "critical" ||
          health.status === "expired") && (
          <div className="mt-4 rounded-md border border-current/10 bg-white/50 p-3 text-sm dark:bg-black/10">
            <strong>Action required:</strong> Renew your Meta/Instagram access
            token before automatic Instagram publishing stops.
          </div>
        )}
      </div>

      {/* Toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-[100] w-[min(420px,calc(100vw-2rem))] animate-in slide-in-from-right-5 fade-in duration-300">
          <div
            className={`rounded-lg border p-4 shadow-2xl backdrop-blur-xl ${styles.wrapper}`}
          >
            <div className="flex gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${styles.icon}`}
              >
                <StatusIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-neutral-900 dark:text-white">
                  {health.status === "temporary_unavailable"
                    ? "Instagram Status Check"
                    : "Instagram Token Alert"}
                </p>

                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {health.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setToastVisible(false)}
                className="text-neutral-400 transition hover:text-neutral-700 dark:hover:text-white"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
