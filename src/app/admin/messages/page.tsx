/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  CheckCircle2,
  Circle,
  Trash2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalMessages, setTotalMessages] = useState(0);

  const MESSAGES_PER_PAGE = 20;

const loadMessages = (
  requestedPage = page,
) => {
  setLoading(true);

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(requestedPage),
  );

  params.set(
    "limit",
    String(MESSAGES_PER_PAGE),
  );

  fetch(
    `/api/admin/messages?${params.toString()}`,
  )
    .then((res) => res.json())
    .then((json) => {
      if (json.success) {
        setMessages(
          json.data || [],
        );

        setPage(
          json.pagination?.page ||
            requestedPage,
        );

        setTotalPages(
          json.pagination?.totalPages ||
            1,
        );

        setTotalMessages(
          json.pagination?.total || 0,
        );
      }
    })
    .catch((e) =>
      console.error(
        "Error loading messages:",
        e,
      ),
    )
    .finally(() =>
      setLoading(false),
    );
};

useEffect(() => {
  loadMessages(1);
}, []);

  const handleToggleRead = async (id: number, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentRead }),
      });
      const json = await res.json();
      if (json.success) {
        loadMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleResolved = async (id: number, currentResolved: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: !currentResolved }),
      });
      const json = await res.json();
      if (json.success) {
        loadMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message inquiry?"))
      return;

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        loadMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border p-6 rounded-2xl shadow-xs">
        <h1 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Mail className="h-6 w-6 text-blue-600" /> Contact Inquiries
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Review and resolve feedback or questions submitted by portal visitors.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl animate-pulse">
          Loading inquiries...
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-dashed rounded-2xl p-16 text-center">
          <Mail className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            No messages registered
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Incoming communications from the Contact Us form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl border transition-all ${
                msg.isRead
                  ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  : "bg-blue-50/20 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider">
                    From: {msg.name} ({msg.email})
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-850 dark:text-neutral-100 mt-1">
                    {msg.subject}
                  </h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Submitted:{" "}
                    {new Date(msg.createdAt || msg.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-1.5 flex-wrap shrink-0">
                  <button
                    onClick={() => handleToggleRead(msg.id, msg.isRead)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      msg.isRead
                        ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-850 dark:text-neutral-300"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {msg.isRead ? "Mark Unread" : "Mark Read"}
                  </button>

                  <button
                    onClick={() => handleToggleResolved(msg.id, msg.isResolved)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      msg.isResolved
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-300"
                    }`}
                  >
                    {msg.isResolved ? "Resolved ✓" : "Mark Resolved"}
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 rounded-lg text-neutral-400 cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading &&
  messages.length > 0 && (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <Pagination
        page={page}
        totalPages={totalPages}
        total={totalMessages}
        limit={MESSAGES_PER_PAGE}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          loadMessages(nextPage);
        }}
      />
    </div>
  )}
    </div>
  );
}
