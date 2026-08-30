import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { getAdminSession } from "@/lib/auth";
import {
  Briefcase,
  Building2,
  Layers,
  FileText,
  Eye,
  MousePointerClick,
  ShieldCheck,
  Plus,
  Mail,
  Zap,
  TrendingUp,
  Activity,
} from "lucide-react";
import InstagramTokenHealth from "@/components/admin/InstagramTokenHealth";
import { getInstagramTokenHealth } from "@/lib/social/instagram-token";
import TrafficAnalytics from "@/components/admin/TrafficAnalytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const instagramTokenHealth = await getInstagramTokenHealth();

  // Load analytics using internal fetch to /api/admin/analytics or direct DB queries
  // Since we are server-side, querying directly is 100% standard and performant!
  let stats = {
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    expiredJobs: 0,
    totalCompanies: 0,
    totalCategories: 0,
    totalApplications: 0,
    totalMessages: 0,
    totalViews: 0,
    totalClicks: 0,
    recentLogs: [] as any[],
    totalTraffic: 0,
    uniqueVisitors: 0,
    trafficSources: [] as any[],
  };

  try {
    const { origin } = new URL(
      process.env.BACKEND_URL || "http://localhost:3000",
    );
    // Query directly from database since we are inside standard NextJS server component!
    const [
      totalJobsRes,
      publishedRes,
      draftsRes,
      expiredRes,
      companiesRes,
      categoriesRes,
      appsRes,
      messagesRes,
      sumRes,
      logsRes,
      trafficRes,
      uniqueVisitorsRes,
      trafficSourcesRes,
    ] = await Promise.all([
      db.execute(sql`SELECT count(*)::integer as count FROM jobs`),
      // "Active" means PUBLISHED *and* not past its deadline/expiry —
      // the status column alone doesn't flip automatically when a
      // deadline passes, so we check both here (matches the effective
      // status logic used in the admin jobs list and public API).
      db.execute(
        sql`SELECT count(*)::integer as count FROM jobs
            WHERE status = 'PUBLISHED'
            AND (application_deadline IS NULL OR application_deadline >= NOW())
            AND (expires_at IS NULL OR expires_at >= NOW())`,
      ),
      db.execute(
        sql`SELECT count(*)::integer as count FROM jobs WHERE status = 'DRAFT'`,
      ),
      // "Expired" includes jobs explicitly marked EXPIRED *and* PUBLISHED
      // jobs whose deadline/expiry has silently passed.
      db.execute(
        sql`SELECT count(*)::integer as count FROM jobs
            WHERE status = 'EXPIRED'
            OR (status = 'PUBLISHED' AND (
              (application_deadline IS NOT NULL AND application_deadline < NOW())
              OR (expires_at IS NOT NULL AND expires_at < NOW())
            ))`,
      ),
      db.execute(sql`SELECT count(*)::integer as count FROM companies`),
      db.execute(sql`SELECT count(*)::integer as count FROM categories`),
      db.execute(sql`SELECT count(*)::integer as count FROM applications`),
      db.execute(sql`SELECT count(*)::integer as count FROM contact_messages`),
      db.execute(
        sql`SELECT coalesce(sum(views_count), 0)::integer as views, coalesce(sum(apply_clicks_count), 0)::integer as clicks FROM jobs`,
      ),
      db.execute(
        sql`SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 6`,
      ),
      db.execute(sql`
  SELECT
    source,
    COUNT(*) FILTER (
      WHERE event_type = 'VIEW'
    )::integer AS views,

    COUNT(*) FILTER (
      WHERE event_type = 'APPLY_CLICK'
    )::integer AS apply_clicks

  FROM job_traffic_events

  GROUP BY source

  ORDER BY views DESC
`),
      db.execute(sql`
  SELECT
    COUNT(*)::integer AS total_traffic
  FROM job_traffic_events
  WHERE event_type = 'VIEW'
`),

      db.execute(sql`
  SELECT
    COUNT(DISTINCT session_id)::integer
    AS unique_visitors
  FROM job_traffic_events
  WHERE session_id IS NOT NULL
`),
    ]);

    stats.totalJobs = Number(totalJobsRes.rows[0]?.count || 0);
    stats.activeJobs = Number(publishedRes.rows[0]?.count || 0);
    stats.draftJobs = Number(draftsRes.rows[0]?.count || 0);
    stats.expiredJobs = Number(expiredRes.rows[0]?.count || 0);
    stats.totalCompanies = Number(companiesRes.rows[0]?.count || 0);
    stats.totalCategories = Number(categoriesRes.rows[0]?.count || 0);
    stats.totalApplications = Number(appsRes.rows[0]?.count || 0);
    stats.totalMessages = Number(messagesRes.rows[0]?.count || 0);
    stats.totalViews = Number(sumRes.rows[0]?.views || 0);
    stats.totalClicks = Number(sumRes.rows[0]?.clicks || 0);
    stats.recentLogs = logsRes.rows || [];
    stats.totalTraffic = Number(trafficRes.rows[0]?.total_traffic || 0);

    stats.uniqueVisitors = Number(
      uniqueVisitorsRes.rows[0]?.unique_visitors || 0,
    );

    stats.trafficSources = trafficSourcesRes.rows || [];

  } catch (e) {
    console.error("Failed to load direct DB admin analytics:", e);
  }

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      sub: "Published on portal",
      icon: <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />,
      bg: "border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30",
    },
    {
      label: "Draft Postings",
      value: stats.draftJobs,
      sub: "Pending draft approvals",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      bg: "border-amber-100 dark:border-amber-950 bg-amber-50/10",
    },
    {
      label: "Hiring Companies",
      value: stats.totalCompanies,
      sub: "Registered employers",
      icon: <Building2 className="h-5 w-5 text-emerald-500" />,
      bg: "border-emerald-100 dark:border-emerald-950 bg-emerald-50/10",
    },
    {
      label: "Applications Received",
      value: stats.totalApplications,
      sub: "Internal resumes",
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      bg: "border-purple-100 dark:border-purple-950 bg-purple-50/10",
    },
    {
      label: "Total Views",
      value: stats.totalViews,
      sub: "Aggregate detail loads",
      icon: <Eye className="h-5 w-5 text-indigo-500" />,
      bg: "border-indigo-100 dark:border-indigo-950 bg-indigo-50/10",
    },
    {
      label: "Apply Clicks",
      value: stats.totalClicks || 0,
      sub: "Aggregate CTA click loads",
      icon: <MousePointerClick className="h-5 w-5 text-pink-500" />,
      bg: "border-pink-100 dark:border-pink-950 bg-pink-50/10",
    },
  ];

  return (
    <div className="space-y-8">
      <InstagramTokenHealth health={instagramTokenHealth} />
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            Welcome Back, {session.name}!
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Logged in as{" "}
            <strong className="text-neutral-750 dark:text-neutral-300 font-extrabold">
              {session.email}
            </strong>{" "}
            • Role:{" "}
            <span className="app-badge app-badge-primary text-[10px] uppercase tracking-widest">
              {session.role}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/jobs/new"
            className="app-button-primary rounded-md px-4 py-2.5 text-xs shadow-md"
          >
            <Plus className="h-4 w-4" /> Create New Job
          </Link>
          <Link
            href="/"
            target="_blank"
            className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 rounded-md px-4 py-2.5 text-xs font-bold transition-all"
          >
            View Public Portal &rarr;
          </Link>
        </div>
      </div>

      {/* Analytics Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-6 flex items-start gap-4 shadow-sm bg-white dark:bg-neutral-900 transition-all ${card.bg}`}
          >
            <div className="p-3 bg-white dark:bg-neutral-800 rounded-md border border-neutral-100 dark:border-neutral-750 shadow-xs">
              {card.icon}
            </div>
            <div>
              <span className="block text-xs font-bold uppercase text-neutral-400 tracking-wider">
                {card.label}
              </span>
              <span className="block text-2xl font-black text-neutral-900 dark:text-white mt-1 leading-none">
                {card.value.toLocaleString()}
              </span>
              <span className="block text-[11px] text-neutral-500 mt-1.5">
                {card.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <TrafficAnalytics
        totalTraffic={stats.totalTraffic}
        totalViews={stats.totalViews}
        totalClicks={stats.totalClicks}
        uniqueVisitors={stats.uniqueVisitors}
        trafficSources={stats.trafficSources}
      />

      {/* Dashboard split content: Quick Actions & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Operations panel */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b pb-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" /> Quick Operations
          </h2>
          <div className="grid grid-cols-1 gap-2.5 text-xs font-bold text-neutral-750 dark:text-neutral-300">
            <Link
              href="/admin/companies"
              className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-[var(--color-primary-light)]/40 dark:bg-neutral-850 dark:hover:bg-neutral-800 border rounded-md transition-all"
            >
              <span>🏢 Manage Registered Companies</span>
              <span className="bg-neutral-200 dark:bg-neutral-750 px-2 py-0.5 rounded text-[10px]">
                {stats.totalCompanies}
              </span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-[var(--color-primary-light)]/40 dark:bg-neutral-850 dark:hover:bg-neutral-800 border rounded-md transition-all"
            >
              <span>🗂️ Manage Industry Categories</span>
              <span className="bg-neutral-200 dark:bg-neutral-750 px-2 py-0.5 rounded text-[10px]">
                {stats.totalCategories}
              </span>
            </Link>
            <Link
              href="/admin/applications"
              className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-[var(--color-primary-light)]/40 dark:bg-neutral-850 dark:hover:bg-neutral-800 border rounded-md transition-all"
            >
              <span>📄 Inspect Incoming Resumes</span>
              <span className="bg-neutral-200 dark:bg-neutral-750 px-2 py-0.5 rounded text-[10px]">
                {stats.totalApplications}
              </span>
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-[var(--color-primary-light)]/40 dark:bg-neutral-850 dark:hover:bg-neutral-800 border rounded-md transition-all"
            >
              <span>✉️ Read Client Messages</span>
              <span className="bg-neutral-200 dark:bg-neutral-750 px-2 py-0.5 rounded text-[10px]">
                {stats.totalMessages}
              </span>
            </Link>
          </div>
        </div>

        {/* Audit logs panel */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b pb-2">
            <Activity className="h-4 w-4 text-emerald-600" /> Recent
            Administrative Audit Logs
          </h2>

          {stats.recentLogs.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-8 text-center">
              No admin logs registered yet. Activity logs appear dynamically as
              changes are committed.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentLogs.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-3 text-xs items-center p-3 bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 rounded-md"
                >
                  <div className="h-6 w-6 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-800 dark:text-neutral-100 leading-none truncate">
                      {log.action} • {log.details}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      By: {log.admin_name || log.adminName} •{" "}
                      {new Date(
                        log.created_at || log.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple direct sql execution helper since standard drizzle doesn't require complex wrappers
import { sql } from "drizzle-orm";
