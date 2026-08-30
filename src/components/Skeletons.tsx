// Reusable skeleton loaders (Part 22).
// All of these are built on the `.app-skeleton` shimmer defined in
// globals.css, so a single animation/color change there updates every
// loading state in the app consistently.

export function JobCardSkeleton() {
  return (
    <div className="app-card p-6 space-y-3">
      <div className="flex gap-4">
        <div className="app-skeleton h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="app-skeleton h-4 w-1/3" />
          <div className="app-skeleton h-3 w-1/4" />
        </div>
      </div>
      <div className="app-skeleton h-3 w-full" />
      <div className="app-skeleton h-3 w-2/3" />
    </div>
  );
}

export function JobListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="app-card p-6 space-y-3">
      <div className="app-skeleton h-10 w-10" />
      <div className="app-skeleton h-4 w-2/3" />
      <div className="app-skeleton h-3 w-1/2" />
      <div className="app-skeleton h-3 w-1/3" />
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="app-card p-6 space-y-3">
      <div className="app-skeleton h-10 w-10" />
      <div className="app-skeleton h-4 w-1/2" />
      <div className="app-skeleton h-3 w-1/3" />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="app-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="app-skeleton h-3 w-20" />
        <div className="app-skeleton h-8 w-8" />
      </div>
      <div className="app-skeleton h-7 w-16" />
      <div className="app-skeleton h-3 w-24" />
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="app-card overflow-hidden">
      <table className="app-table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c}>
                  <div className="app-skeleton h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApplicationSkeleton() {
  return (
    <div className="app-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="app-skeleton h-4 w-1/3" />
        <div className="app-skeleton h-5 w-16" />
      </div>
      <div className="app-skeleton h-3 w-1/2" />
      <div className="app-skeleton h-3 w-1/4" />
    </div>
  );
}

export function SocialPostSkeleton() {
  return (
    <div className="app-card p-4 flex items-center gap-3">
      <div className="app-skeleton h-8 w-8" />
      <div className="flex-1 space-y-2">
        <div className="app-skeleton h-3 w-1/3" />
        <div className="app-skeleton h-3 w-1/4" />
      </div>
      <div className="app-skeleton h-5 w-16" />
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="app-card p-6 sm:p-8 space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="app-skeleton h-3 w-24" />
          <div className="app-skeleton h-10 w-full" />
        </div>
      ))}
      <div className="app-skeleton h-10 w-32" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-6">
      <div className="app-skeleton h-8 w-1/3" />
      <div className="app-skeleton h-4 w-1/2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="app-skeleton h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
