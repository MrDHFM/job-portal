/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Layers,
  FileText,
  Mail,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../theme-provider";

type AdminSidebarProps = {
  session: {
    userId: number;
    email: string;
    name: string;
    role: string;
  };
};

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages/unread-count", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUnreadMessages(Number(data.count) || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
    }
  }, []);

  useEffect(() => {
    // Get count immediately when admin loads
    fetchUnreadMessages();

    // Check for new messages every 10 seconds
    const interval = window.setInterval(() => {
      fetchUnreadMessages();
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [fetchUnreadMessages]);

  const menuItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
      badge: 0,
    },
    {
      label: "Jobs Management",
      href: "/admin/jobs",
      icon: <Briefcase className="h-4 w-4" />,
      badge: 0,
    },
    {
      label: "Companies",
      href: "/admin/companies",
      icon: <Building2 className="h-4 w-4" />,
      badge: 0,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: <Layers className="h-4 w-4" />,
      badge: 0,
    },
    {
      label: "Applications",
      href: "/admin/applications",
      icon: <FileText className="h-4 w-4" />,
      badge: 0,
    },
    {
      label: "Contact Messages",
      href: "/admin/messages",
      icon: <Mail className="h-4 w-4" />,
      badge: unreadMessages,
    },
    {
      label: "Portal Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
      badge: 0,
    },
  ];

  useEffect(() => {
    const handleMessagesChanged = () => {
      fetchUnreadMessages();
    };

    window.addEventListener("admin-messages-changed", handleMessagesChanged);

    return () => {
      window.removeEventListener(
        "admin-messages-changed",
        handleMessagesChanged,
      );
    };
  }, [fetchUnreadMessages]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/admin/login";
      }
    } catch (e) {
      console.error("Failed to log out:", e);
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex h-16 items-center justify-between px-4 bg-neutral-900 text-white border-b border-neutral-800 w-full sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-1.5">
          <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="font-bold tracking-tight text-sm">
            CareerDiscover Admin
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 text-neutral-300 hover:text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 text-neutral-300 hover:text-white"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Links Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-neutral-900 text-white z-40 border-b border-neutral-800 p-4 space-y-2 animate-in slide-in-from-top duration-200">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-neutral-400 hover:bg-neutral-850 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>

                {item.badge > 0 && (
                  <span
                    className={`min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? "bg-white text-[var(--color-primary)]"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <hr className="border-neutral-800 my-2" />
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}

      {/* Desktop Sidebar (Left Panel) */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-900 text-white min-h-screen border-r border-neutral-800 shrink-0 p-5 justify-between">
        <div className="space-y-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 pb-4 border-b border-neutral-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="text-base font-extrabold tracking-tight">
              Career<span className="text-[var(--color-primary)]">Discover</span>
            </span>
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 bg-neutral-850/50 p-3 rounded-md border border-neutral-800">
            <div className="h-9 w-9 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] flex items-center justify-center border border-[var(--color-primary)]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="truncate text-xs">
              <p className="font-extrabold text-neutral-100">
                {session.name || "Administrator"}
              </p>
              <p className="text-[10px] text-neutral-400 uppercase font-black tracking-wider mt-0.5">
                {session.role}
              </p>
            </div>
          </div>

          {/* Menu Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-md"
                      : "text-neutral-400 hover:bg-neutral-850 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    {item.icon}

                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.badge > 0 && (
                    <span
                      className={`min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isActive
                          ? "bg-white text-[var(--color-primary)]"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-4 border-t border-neutral-800 text-xs">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-400 hover:text-white font-bold cursor-pointer"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" /> Use Light Theme
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-400" /> Use Dark Theme
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign Out Portal
          </button>
        </div>
      </aside>
    </>
  );
}
