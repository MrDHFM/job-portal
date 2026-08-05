import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminJobForm from "@/components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminNewJobPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Publish New Career Vacancy</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Complete the form fields below to list a genuine corporate position.
        </p>
      </div>

      <AdminJobForm />
    </div>
  );
}
