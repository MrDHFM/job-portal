"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, Mail, MapPin, Globe } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="flex h-14 mb-4 items-center gap-[10px] shrink-0"
              aria-label="CareerDiscoverJobs Home"
            >
              <Image
                src="/images/logo.png"
                alt="CareerDiscoverJobs"
                width={220}
                height={80}
                priority
                className="h-14 w-auto object-contain"
              />
              <Image
                src="/images/name.png"
                alt="CareerDiscoverJobs"
                width={220}
                height={80}
                priority
                className=""
              />
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-sm">
              Discover verified careers, remote jobs, public service
              notifications, on-site walk-ins, and high-impact private company
              positions. Built on raw, genuine enterprise data.
            </p>
            <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-500">
              <Link
                href="https://linkedin.com"
                target="_blank"
                className="hover:text-blue-600 transition-colors"
                title="LinkedIn"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="hover:text-blue-400 transition-colors"
                title="Twitter / X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                title="Contact Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Jobs Segment */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Browse Jobs
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/jobs"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  All Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs/it"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  IT Sector Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs/government"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Government Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs/internships"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Internships
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs/walk-ins"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Walk-In Drives
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs/remote"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Remote Openings
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Segment */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Company Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Categories List
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-neutral-400 hover:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-400"
                >
                  Employer Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Segment */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Legal Info
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-10 border-neutral-200 dark:border-neutral-900" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {currentYear} CareerDiscover Job Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" /> International Quality Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
