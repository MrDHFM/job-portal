/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Copy,
  ExternalLink,
  X,
  Send,
  RefreshCw,
  ClipboardCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type Platform = "telegram" | "instagram" | "linkedin" | "x";

type SocialStatus = {
  platform: Platform;
  status:
    | "PENDING"
    | "PUBLISHED"
    | "FAILED"
    | "MANUAL_READY";
  externalPostId?: string | null;
  externalPostUrl?: string | null;
  postContent?: string | null;
  errorMessage?: string | null;
  postedAt?: string | null;
};

type ManualPost = {
  platform: "linkedin" | "x";
  content: string;
  jobUrl: string;
};

type Props = {
  jobId: number;
  jobTitle: string;
};

const platformConfig = {
  telegram: {
    label: "Telegram",
    short: "TG",
    description: "Automatic publishing",
  },
  instagram: {
    label: "Instagram",
    short: "IG",
    description: "Automatic publishing",
  },
  linkedin: {
    label: "LinkedIn",
    short: "IN",
    description: "Automatic publishing (Company Page)",
  },
  x: {
    label: "X",
    short: "X",
    description: "Manual publishing",
  },
};

function StatusIcon({ status }: { status: SocialStatus["status"] }) {
  if (status === "PUBLISHED") {
    return (
      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
    );
  }

  if (status === "FAILED") {
    return (
      <XCircle className="h-4 w-4 text-red-500 shrink-0" />
    );
  }

  if (status === "MANUAL_READY") {
    return (
      <ClipboardCheck className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
    );
  }

  return (
    <Clock3 className="h-4 w-4 text-amber-500 shrink-0" />
  );
}

function StatusBadge({ status }: { status: SocialStatus["status"] }) {
  const styles = {
    PUBLISHED:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED:
      "bg-red-50 text-red-700 border-red-200",
    MANUAL_READY:
      "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-primary)]/30",
    PENDING:
      "bg-amber-50 text-amber-700 border-amber-200",
  };

  const labels = {
    PUBLISHED: "Published",
    FAILED: "Failed",
    MANUAL_READY: "Ready to Post",
    PENDING: "Pending",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      <StatusIcon status={status} />
      {labels[status]}
    </span>
  );
}

export default function SocialMediaPostManager({
  jobId,
  jobTitle,
}: Props) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [statuses, setStatuses] = useState<SocialStatus[]>([]);

  const [manualPosts, setManualPosts] = useState<{
    linkedin?: ManualPost;
    x?: ManualPost;
  }>({});

  const [activePlatform, setActivePlatform] = useState<
    "linkedin" | "x" | null
  >(null);

  const [copiedPlatform, setCopiedPlatform] = useState<
    "linkedin" | "x" | null
  >(null);

  const [markingPlatform, setMarkingPlatform] = useState<
    "linkedin" | "x" | null
  >(null);

  const [retryingPlatform, setRetryingPlatform] = useState<
    Platform | null
  >(null);

  const loadSocialPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/jobs/${jobId}/social-posts`,
        {
          cache: "no-store",
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error || "Failed to load social media status."
        );
      }

      setStatuses(json.data.statuses || []);

      setManualPosts({
        linkedin: json.data.linkedin,
        x: json.data.x,
      });
    } catch (error) {
      console.error(
        "Failed to load social media posts:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSocialPosts();
    }
  }, [open, jobId]);

  const getStatus = (
    platform: Platform
  ): SocialStatus => {
    const existing = statuses.find(
      (item) => item.platform === platform
    );

    if (existing) {
      return existing;
    }

    return {
      platform,
      status:
        platform === "linkedin" || platform === "x"
          ? "MANUAL_READY"
          : "PENDING",
    };
  };

  const copyPost = async (
    platform: "linkedin" | "x"
  ) => {
    const post = manualPosts[platform];

    if (!post?.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(post.content);

      setCopiedPlatform(platform);

      setTimeout(() => {
        setCopiedPlatform(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy post:", error);
    }
  };

  const markAsPosted = async (
    platform: "linkedin" | "x"
  ) => {
    try {
      setMarkingPlatform(platform);

      const postUrl = window.prompt(
        `Optional: paste the ${platform === "linkedin" ? "LinkedIn" : "X"} post URL.\n\nLeave empty if you don't want to save it.`
      );

      if (postUrl === null) {
        return;
      }

      const response = await fetch(
        `/api/admin/jobs/${jobId}/social-posts/${platform}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            externalPostUrl:
              postUrl.trim() || null,
          }),
        }
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error || "Failed to update status."
        );
      }

      await loadSocialPosts();
    } catch (error) {
      console.error(
        "Failed to mark social post:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update social post."
      );
    } finally {
      setMarkingPlatform(null);
    }
  };

  const openPost = (
    url?: string | null
  ) => {
    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const retryPlatform = async (
    platform: "telegram" | "instagram" | "linkedin"
  ) => {
    try {
      setRetryingPlatform(platform);

      const response = await fetch(
        `/api/admin/jobs/${jobId}/social-posts/${platform}`,
        { method: "POST" }
      );

      const json = await response.json();

      if (!response.ok && !json.data) {
        throw new Error(
          json.error || "Failed to retry publishing."
        );
      }

      await loadSocialPosts();

      if (!json.success) {
        alert(
          json.error ||
            `${platform} retry did not succeed. Check the error details on the card.`
        );
      }
    } catch (error) {
      console.error(
        `Failed to retry ${platform}:`,
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to retry publishing."
      );
    } finally {
      setRetryingPlatform(null);
    }
  };

  const renderPlatformIcon = (
    platform: Platform
  ) => {
    if (platform === "telegram") {
      return (
        <div className="h-9 w-9 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
          <Send className="h-4 w-4" />
        </div>
      );
    }

    if (platform === "instagram") {
      return (
        <div className="h-9 w-9 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center">
          <span className="font-bold text-sm">IG</span>
        </div>
      );
    }

    if (platform === "linkedin") {
      return (
        <div className="h-9 w-9 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] flex items-center justify-center">
          <span className="font-bold text-sm">in</span>
        </div>
      );
    }

    return (
      <div className="h-9 w-9 rounded-md bg-neutral-100 text-neutral-900 flex items-center justify-center font-black text-sm">
        𝕏
      </div>
    );
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary-light)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--color-primary-dark)] hover:opacity-80 transition-colors"
        title="Manage social media publishing"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-50" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" />
        </span>

        Social
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-md bg-[var(--color-primary)] text-white flex items-center justify-center">
                    <Send className="h-4 w-4" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    Social Distribution
                  </span>
                </div>

                <h2 className="text-lg font-black text-neutral-950 dark:text-white truncate">
                  Social Media Publishing
                </h2>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                  {jobTitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadSocialPosts}
                  disabled={loading}
                  className="h-9 w-9 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-md border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-145px)] p-6">
              {loading && statuses.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)] mb-3" />

                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Loading social media status...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Automatic platforms */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />

                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Automatic Publishing
                      </span>

                      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(
                        [
                          "telegram",
                          "instagram",
                          "linkedin",
                        ] as Platform[]
                      ).map((platform) => {
                        const status =
                          getStatus(platform);

                        return (
                          <div
                            key={platform}
                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {renderPlatformIcon(
                                  platform
                                )}

                                <div>
                                  <p className="text-sm font-extrabold text-neutral-900 dark:text-white">
                                    {
                                      platformConfig[
                                        platform
                                      ].label
                                    }
                                  </p>

                                  <p className="text-[10px] text-neutral-500">
                                    {
                                      platformConfig[
                                        platform
                                      ].description
                                    }
                                  </p>
                                </div>
                              </div>

                              <StatusBadge
                                status={
                                  status.status
                                }
                              />
                            </div>

                            {status.status ===
                              "FAILED" &&
                              status.errorMessage && (
                                <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
                                  <div className="flex gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />

                                    <p className="text-xs leading-5 text-red-700">
                                      {
                                        status.errorMessage
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}

                            {status.status ===
                              "FAILED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  retryPlatform(
                                    platform as
                                      | "telegram"
                                      | "instagram"
                                      | "linkedin"
                                  )
                                }
                                disabled={
                                  retryingPlatform ===
                                  platform
                                }
                                className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
                              >
                                {retryingPlatform ===
                                platform ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                Retry
                              </button>
                            )}

                            {status.externalPostUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  openPost(
                                    status.externalPostUrl
                                  )
                                }
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:opacity-80"
                              >
                                View published post
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Manual platforms */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />

                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Manual Publishing
                      </span>

                      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {(["linkedin", "x"] as const).map((platform) => {
                        const status =
                          getStatus(platform);

                        const post =
                          manualPosts[platform];

                        const isActive =
                          activePlatform ===
                          platform;

                        return (
                          <div
                            key={platform}
                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                          >
                            {/* Platform header */}
                            <div className="flex items-center justify-between gap-3 p-4 bg-neutral-50 dark:bg-neutral-900">
                              <div className="flex items-center gap-3">
                                {renderPlatformIcon(
                                  platform
                                )}

                                <div>
                                  <p className="text-sm font-extrabold text-neutral-900 dark:text-white">
                                    {
                                      platformConfig[
                                        platform
                                      ].label
                                    }
                                  </p>

                                  <p className="text-[10px] text-neutral-500">
                                    Ready-to-copy
                                    manual post
                                  </p>
                                </div>
                              </div>

                              <StatusBadge
                                status={
                                  status.status
                                }
                              />
                            </div>

                            {/* Post */}
                            <div className="p-4">
                              {post?.content ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePlatform(
                                        isActive
                                          ? null
                                          : platform
                                      )
                                    }
                                    className="w-full text-left"
                                  >
                                    <div
                                      className={`rounded-md border bg-white dark:bg-neutral-950 p-4 transition-all ${
                                        isActive
                                          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]"
                                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                      }`}
                                    >
                                      <pre className="whitespace-pre-wrap font-sans text-xs leading-5 text-neutral-700 dark:text-neutral-300">
                                        {post.content}
                                      </pre>
                                    </div>
                                  </button>

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyPost(
                                          platform
                                        )
                                      }
                                      className="inline-flex items-center gap-2 rounded-md bg-neutral-950 dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-neutral-950 hover:opacity-90 transition-opacity"
                                    >
                                      {copiedPlatform ===
                                      platform ? (
                                        <>
                                          <CheckCircle2 className="h-4 w-4" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-4 w-4" />
                                          Copy Post
                                        </>
                                      )}
                                    </button>

                                    {status.status !==
                                      "PUBLISHED" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          markAsPosted(
                                            platform
                                          )
                                        }
                                        disabled={
                                          markingPlatform ===
                                          platform
                                        }
                                        className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                      >
                                        {markingPlatform ===
                                        platform ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4" />
                                        )}

                                        Mark as Posted
                                      </button>
                                    )}

                                    {status.externalPostUrl && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openPost(
                                            status.externalPostUrl
                                          )
                                        }
                                        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-primary-light)] px-4 py-2.5 text-xs font-bold text-[var(--color-primary-dark)] hover:opacity-80"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                        View Post
                                      </button>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="py-8 text-center">
                                  <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)] mx-auto mb-2" />

                                  <p className="text-xs text-neutral-500">
                                    Generating manual
                                    post...
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-[10px] text-neutral-500">
                  Telegram &amp; Instagram publish automatically. LinkedIn
                  posts automatically once configured, and always has a
                  ready-to-copy manual option below too. X remains manual
                  by design.
                </p>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}