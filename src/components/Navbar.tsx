"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Heart,
  Sun,
  Moon,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "@/app/theme-provider";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if admin session cookie exists
  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.user) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  // Read saved jobs count from local storage to show on badge
  useEffect(() => {
    const updateSavedCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("saved-jobs") || "[]");
        setSavedCount(saved.length);
      } catch (e) {
        setSavedCount(0);
      }
    };

    updateSavedCount();
    window.addEventListener("storage", updateSavedCount);
    const interval = setInterval(updateSavedCount, 2000);

    return () => {
      window.removeEventListener("storage", updateSavedCount);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { label: "Find Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies" },
    { label: "Categories", href: "/categories" },
    { label: "Internships", href: "/jobs/internships" },
    { label: "Walk-Ins", href: "/jobs/walk-ins" },
    { label: "Govt Jobs", href: "/jobs/government" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex h-14 items-center gap-[10px] shrink-0"
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/saved-jobs"
            className="relative p-2 text-neutral-600 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400"
            title="Saved Jobs"
          >
            <Heart className="h-5 w-5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-neutral-600 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400 rounded-lg bg-neutral-100 dark:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Render Admin Portal button only if logged in as admin */}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-all"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-neutral-600 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400 rounded-lg bg-neutral-100 dark:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-b border-neutral-200 bg-white px-4 pt-2 pb-4 dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2 border-neutral-100 dark:border-neutral-800" />
            <div className="flex flex-col gap-2 px-3">
              <Link
                href="/saved-jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between py-2 text-neutral-700 dark:text-neutral-300 font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" /> Saved Jobs
                </span>
                {savedCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {savedCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 py-2 text-blue-600 dark:text-blue-400 font-semibold"
                >
                  <ShieldAlert className="h-5 w-5 text-blue-600" /> Admin
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
