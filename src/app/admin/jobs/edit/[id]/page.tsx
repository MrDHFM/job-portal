import React from "react";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import AdminJobForm from "@/components/AdminJobForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditJobPage(props: Props) {
  const params = await props.params;
  const id = parseInt(params.id);
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Retrieve job data
  const results = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (results.length === 0) {
    return notFound();
  }

  const job = results[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Edit Job Posting</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Modify corporate details, application routing, or status parameters.
        </p>
      </div>

      <AdminJobForm initialData={job} jobId={job.id} />
    </div>
  );
}
