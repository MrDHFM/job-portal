"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, Key, Mail, AlertTriangle, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please input both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Authentication failed. Check your credentials.");
      }

      // Success - Redirect to admin dashboard
      window.location.href = "/admin";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl max-w-md w-full p-8 space-y-6 animate-in fade-in duration-250">
        
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mx-auto">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Admin Portal</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Secure sign-in for platform managers and editor workflows.
          </p>
        </div>

        {/* Demo Credentials Notice */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/50 rounded-xl p-4 text-xs space-y-1">
          <span className="font-bold text-blue-800 dark:text-blue-300 block flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Auditor Test Account:
          </span>
          <p className="text-neutral-600 dark:text-neutral-400">Email: <strong className="text-neutral-800 dark:text-white">admin@jobportal.com</strong></p>
          <p className="text-neutral-600 dark:text-neutral-400">Password: <strong className="text-neutral-800 dark:text-white">admin</strong></p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-3.5 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jobportal.com"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-850 dark:text-neutral-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4.5 w-4.5 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-850 dark:text-neutral-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold py-3 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              {loading ? "Authenticating session..." : "Login Securely"}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-neutral-500 hover:text-blue-600 font-medium">
            &larr; Back to Public Directory
          </Link>
        </div>

      </div>
    </div>
  );
}
