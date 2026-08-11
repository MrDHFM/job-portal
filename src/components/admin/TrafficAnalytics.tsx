"use client";

import { Eye, MousePointerClick, Users, Globe } from "lucide-react";

type TrafficSource = {
  source: string;
  views?: number;
  applyClicks?: number;
};

type JobPerformance = {
  jobId: number;
  title: string;
  slug: string;
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
  jobPerformance: JobPerformance[];
};

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

export default function TrafficAnalytics({
  totalTraffic,
  totalViews,
  totalClicks,
  uniqueVisitors,
  trafficSources,
  jobPerformance,
}: Props) {
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
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
                      className="h-full rounded-full bg-blue-600 transition-all"
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
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
          <h3 className="font-bold text-neutral-900 dark:text-white">
            Job Performance
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            Views, applications and traffic sources for each job.
          </p>
        </div>

        <div className="overflow-x-auto">
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
        </div>
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
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
