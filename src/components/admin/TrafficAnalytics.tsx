/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Eye, MousePointerClick, Users, Globe, Search, Clock } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { TableSkeleton } from "@/components/Skeletons";

type TrafficSource = {
  source: string;
  views?: number;
  applyClicks?: number;
};

type JobPerformance = {
  jobId: number;
  title: string;
  slug: string;
  createdAt: string;
  views: number;
  applyClicks: number;
  instagram: number;
  telegram: number;
  linkedin: number;
  x: number;
  google: number;
  direct: number;
};

type Props = {
  totalTraffic: number;
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  trafficSources: TrafficSource[];
};

const JOB_PERFORMANCE_PER_PAGE = 10;

const sourceLabels: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  x: "X",
  google: "Google",
  bing: "Bing",
  facebook: "Facebook",
  direct: "Direct",
  referral: "Referral",
  other: "Other",
};

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrafficAnalytics({
  totalTraffic,
  totalViews,
  totalClicks,
  uniqueVisitors,
  trafficSources,
}: Props) {
  const [jobPerformance, setJobPerformance] = useState<JobPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("latest");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const loadJobPerformance = (requestedPage = page, requestedSort = sort, requestedSearch = search) => {
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(requestedPage));
    params.set("limit", String(JOB_PERFORMANCE_PER_PAGE));
    params.set("sort", requestedSort);
    if (requestedSearch) params.set("search", requestedSearch);

    fetch(`/api/admin/analytics/job-performance?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setJobPerformance(
            (json.data || []).map((row: any) => ({
              jobId: row.job_id,
              title: row.title,
              slug: row.slug,
              createdAt: row.created_at,
              views: row.views,
              applyClicks: row.apply_clicks,
              instagram: row.instagram,
              telegram: row.telegram,
              linkedin: row.linkedin,
              x: row.x,
              google: row.google,
              direct: row.direct,
            })),
          );

          setPage(json.pagination?.page || requestedPage);
          setTotalPages(json.pagination?.totalPages || 1);
          setTotal(json.pagination?.total || 0);
        }
      })
      .catch((e) =>
        console.error("Failed to load job performance:", e),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobPerformance(1, sort, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search]);

  // Debounce the search box.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // --- Recent Activity feed (individual view/apply events, not
  // aggregated stats — "which job just got a view, from where, when") ---
  const [recentActivity, setRecentActivity] = useState<
    {
      id: number;
      event_type: string;
      source: string;
      created_at: string;
      job_id: number;
      job_title: string;
      job_slug: string;
      company_name: string;
    }[]
  >([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityFilter, setActivityFilter] = useState("");

  const ACTIVITY_PER_PAGE = 15;

  const loadRecentActivity = (requestedPage = activityPage, requestedFilter = activityFilter) => {
    setActivityLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(requestedPage));
    params.set("limit", String(ACTIVITY_PER_PAGE));
    if (requestedFilter) params.set("eventType", requestedFilter);

    fetch(`/api/admin/analytics/recent-activity?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setRecentActivity(json.data || []);
          setActivityPage(json.pagination?.page || requestedPage);
          setActivityTotalPages(json.pagination?.totalPages || 1);
          setActivityTotal(json.pagination?.total || 0);
        }
      })
      .catch((e) => console.error("Failed to load recent activity:", e))
      .finally(() => setActivityLoading(false));
  };

  useEffect(() => {
    loadRecentActivity(1, activityFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityFilter]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-neutral-900 dark:text-white">
          Traffic Intelligence
        </h2>

        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Understand where candidates are coming from and which jobs are
          generating engagement.
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Total Traffic"
          value={totalTraffic}
          icon={<Globe className="h-5 w-5" />}
        />

        <Metric
          label="Job Views"
          value={totalViews}
          icon={<Eye className="h-5 w-5" />}
        />

        <Metric
          label="Apply Clicks"
          value={totalClicks}
          icon={<MousePointerClick className="h-5 w-5" />}
        />

        <Metric
          label="Unique Visitors"
          value={uniqueVisitors}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Traffic Sources */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-5">
          <h3 className="font-bold text-neutral-900 dark:text-white">
            Traffic Sources
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            Where visitors are coming from.
          </p>
        </div>

        <div className="space-y-4">
          {trafficSources.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">
              No traffic data yet.
            </p>
          ) : (
            trafficSources.map((item, index) => {
              const total = trafficSources.reduce(
                (sum, current) => sum + (current.views ?? 0),
                0,
              );

              const percentage =
                total > 0 ? Math.round(((item.views ?? 0) / total) * 100) : 0;

              return (
                <div key={`${item.source}-${index}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">
                      {sourceLabels[item.source] || item.source}
                    </span>

                    <span className="font-semibold text-neutral-500">
                      {(item.views ?? 0).toLocaleString()} views
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                    <span>{percentage}% of traffic</span>

                    <span>
                      {(item.applyClicks ?? 0).toLocaleString()} apply clicks
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Job performance */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 p-6 dark:border-neutral-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">
              Job Performance
            </h3>

            <p className="mt-1 text-xs text-neutral-500">
              Views, applications and traffic sources for each job.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search job title..."
                className="app-input pl-8 py-2 text-sm w-full sm:w-56"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm text-neutral-800 dark:text-neutral-300 outline-none"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
              <option value="views">Most views</option>
              <option value="applies">Most applies</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={JOB_PERFORMANCE_PER_PAGE} columns={9} />
            </div>
          ) : jobPerformance.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-400">
              {search ? "No jobs match your search." : "No job performance data yet."}
            </p>
          ) : (
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
                  <th className="p-4 pl-6">Job</th>

                  <th className="p-4 text-center">Views</th>

                  <th className="p-4 text-center">Applies</th>

                  <th className="p-4 text-center">Instagram</th>

                  <th className="p-4 text-center">Telegram</th>

                  <th className="p-4 text-center">LinkedIn</th>

                  <th className="p-4 text-center">X</th>

                  <th className="p-4 text-center">Google</th>

                  <th className="p-4 text-center">Direct</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {jobPerformance.map((job, index) => (
                  <tr
                    key={`${job.jobId ?? "job"}-${index}`}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-950"
                  >
                    <td className="max-w-[260px] p-4 pl-6">
                      <div className="truncate font-bold text-neutral-900 dark:text-white">
                        {job.title}
                      </div>

                      <div className="mt-1 text-[10px] text-neutral-400">
                        Job #{job.jobId}
                        {job.createdAt && (
                          <>
                            {" · "}
                            {new Date(job.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-center font-bold">
                      {(job.views ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4 text-center font-bold">
                      {(job.applyClicks ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4 text-center">{job.instagram}</td>

                    <td className="p-4 text-center">{job.telegram}</td>

                    <td className="p-4 text-center">{job.linkedin}</td>

                    <td className="p-4 text-center">{job.x}</td>

                    <td className="p-4 text-center">{job.google}</td>

                    <td className="p-4 text-center">{job.direct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && jobPerformance.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={JOB_PERFORMANCE_PER_PAGE}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              loadJobPerformance(nextPage);
            }}
          />
        )}
      </div>

      {/* Recent Activity — a live feed of individual visitor events
          (which job, what kind of event, where from, when), distinct
          from the aggregated stats above and from the admin Audit
          Logs (which tracks admin actions, not visitor traffic). */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 p-6 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--color-primary)]" />
              Recent Activity
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Live feed of views and apply clicks, per job, as they happen.
            </p>
          </div>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border rounded-md px-3 py-2 text-sm text-neutral-800 dark:text-neutral-300 outline-none"
          >
            <option value="">All activity</option>
            <option value="VIEW">Views only</option>
            <option value="APPLY_CLICK">Apply clicks only</option>
          </select>
        </div>

        <div className="p-3">
          {activityLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="app-skeleton h-12 w-full" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="py-12 text-center text-sm text-neutral-400">
              No activity yet.
            </p>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {recentActivity.map((event) => {
                const isView = event.event_type === "VIEW";

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                        isView
                          ? "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      }`}
                    >
                      {isView ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <MousePointerClick className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 dark:text-neutral-100 truncate">
                        <span className="font-bold">
                          {isView ? "New view" : "Apply click"}
                        </span>{" "}
                        on{" "}
                        <a
                          href={`/jobs/detail/${event.job_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[var(--color-primary)] hover:underline"
                        >
                          {event.job_title}
                        </a>
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {event.company_name} · {sourceLabels[event.source] || event.source}
                      </p>
                    </div>

                    <span className="shrink-0 text-[11px] text-neutral-400 whitespace-nowrap">
                      {timeAgo(event.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!activityLoading && recentActivity.length > 0 && (
          <Pagination
            page={activityPage}
            totalPages={activityTotalPages}
            total={activityTotal}
            limit={ACTIVITY_PER_PAGE}
            onPageChange={(nextPage) => {
              setActivityPage(nextPage);
              loadRecentActivity(nextPage);
            }}
          />
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)]">
          {icon}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-black text-neutral-900 dark:text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
