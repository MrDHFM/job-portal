export type ExpirableJob = {
  status?: string | null;
  applicationDeadline?: Date | string | null;
  expiresAt?: Date | string | null;
};

export function isJobExpired(job: ExpirableJob): boolean {
  if (job.status === "EXPIRED") {
    return true;
  }

  const now = Date.now();

  if (job.applicationDeadline) {
    const deadline = new Date(job.applicationDeadline);

    if (
      !Number.isNaN(deadline.getTime()) &&
      deadline.getTime() < now
    ) {
      return true;
    }
  }

  if (job.expiresAt) {
    const expiresAt = new Date(job.expiresAt);

    if (
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt.getTime() < now
    ) {
      return true;
    }
  }

  return false;
}