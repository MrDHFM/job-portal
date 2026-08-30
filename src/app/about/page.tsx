import React from "react";
import Link from "next/link";
import { Briefcase, ShieldCheck, HeartHandshake, Eye, Users } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-neutral-50 dark:bg-neutral-950 py-16 border-b border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
            About CareerDiscover
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
            We are a mission-driven, international-quality career board committed to 100% genuine jobs, zero mock seeding, and transparent hiring metrics.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white">
                Our Non-Negotiable Standard: Real Verified Postings
              </h2>
              <p className="mt-4 text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Many modern career platforms suffer from ghost listings, outdated index scraping, and synthetic salary counts designed to artificially inflate platform traffic. At CareerDiscover, we run a zero-tolerance policy against fake entries.
              </p>
              <p className="mt-4 text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Every single vacancy listed on this portal is hand-crafted and published by authorized employer administrators, backed by real live contracts, clear eligibility criteria, and transparent response cycles.
              </p>
              <div className="mt-8">
                <Link
                  href="/jobs"
                  className="app-button-primary gap-2 rounded-md px-5 py-3 text-sm shadow-md"
                >
                  Browse Genuine Openings <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: <ShieldCheck className="h-6 w-6 text-[var(--color-primary)]" />,
                  title: "100% Verified",
                  desc: "Every company and job is manually checked and published by authorized personnel."
                },
                {
                  icon: <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
                  title: "Metric Transparency",
                  desc: "Real view and apply counts dynamically retrieved from actual candidate interactions."
                },
                {
                  icon: <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
                  title: "Multi-Sector Matrix",
                  desc: "Support for Private, IT, Non-IT, Government, Internships and Walk-In recruitment drives."
                },
                {
                  icon: <HeartHandshake className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
                  title: "Trust First",
                  desc: "We prioritize user data privacy. No third-party list sharing or hidden trackers."
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750 hover:shadow-md transition-all"
                >
                  <div className="mb-3 p-2.5 bg-white dark:bg-neutral-900 rounded-md inline-block border border-neutral-150 dark:border-neutral-700">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-neutral-50 dark:bg-neutral-950 py-16 border-t border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Our Mission in Action</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xl mx-auto mb-10">
            Delivering clean, fast, international-quality hiring workflows to candidates and recruiters worldwide.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Data Seeding", value: "0%" },
              { label: "Spam Tolerance", value: "Zero" },
              { label: "Verified Sectors", value: "6+" },
              { label: "Dynamic Tracking", value: "Active" }
            ].map((stat, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <span className="block text-3xl font-extrabold text-[var(--color-primary)] mb-1">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
