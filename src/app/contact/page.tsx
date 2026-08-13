"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [socialLinks, setSocialLinks] = useState({
    socialLinkedin: "",
    socialTwitter: "",
    socialInstagram: "",
    socialTelegram: "",
  });
  React.useEffect(() => {
    fetch("/api/settings", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setSocialLinks(json.data);
        }
      })
      .catch((error) => {
        console.error("Failed to load social links:", error);
      });
  }, []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Please fill out all required form fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(
          json.error || "An error occurred while transmitting your message.",
        );
      }

      setSuccess(json.message || "Your message was transmitted successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to communicate with our system. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="bg-neutral-50 dark:bg-neutral-950 py-16 border-b border-neutral-200 dark:border-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
            Contact Support & Recruitment
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-500 dark:text-neutral-400">
            Have questions about database postings, corporate registrations, or
            job flags? Submit an inquiry directly below.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Col: Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  Get in Touch
                </h2>
                <p className="mt-3 text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Our operations team reviews submissions round-the-clock to
                  maintain data sanitation standards on CareerDiscover. Expect
                  replies in less than 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Email Address
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      recruiting@globaljobportal.com
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750">
                  <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      HQ Address
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      100 Tech Venture Way, Suite 400, Austin, TX 78701
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750">
                  <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Phone Helpline
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                      +1 (512) 555-0199
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(socialLinks.socialLinkedin ||
              socialLinks.socialTwitter ||
              socialLinks.socialInstagram ||
              socialLinks.socialTelegram) && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                  Follow Us
                </h3>

                <div className="flex items-center gap-3">
                  {socialLinks.socialLinkedin && (
                    <a
                      href={socialLinks.socialLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <span className="font-bold text-sm">in</span>
                    </a>
                  )}

                  {socialLinks.socialTwitter && (
                    <a
                      href={socialLinks.socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X / Twitter"
                      className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <span className="font-bold text-sm">𝕏</span>
                    </a>
                  )}

                  {socialLinks.socialInstagram && (
                    <a
                      href={socialLinks.socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:text-pink-500 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </a>
                  )}

                  {socialLinks.socialTelegram && (
                    <a
                      href={socialLinks.socialTelegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Telegram"
                      className="h-10 w-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:text-sky-500 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Right Col: Form Input */}
            <div className="lg:col-span-7 bg-neutral-50 dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-150 dark:border-neutral-750">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Send an Inquiry Message
              </h2>

              {success && (
                <div className="mb-6 flex gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">Transmission Succeeded</p>
                    <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 flex gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">Validation Block</p>
                    <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Subject Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Question about government jobs"
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Detailed Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Enter your message details here..."
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-850 dark:text-neutral-50 outline-none focus:border-blue-500 resize-none"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                        Transmitting...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
