export default function JobDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="app-card p-6 sm:p-8 space-y-4">
        <div className="app-skeleton h-6 w-2/3" />
        <div className="app-skeleton h-4 w-1/3" />
        <div className="flex gap-3">
          <div className="app-skeleton h-6 w-20" />
          <div className="app-skeleton h-6 w-24" />
          <div className="app-skeleton h-6 w-20" />
        </div>
      </div>

      <div className="app-card p-6 sm:p-8 space-y-3">
        <div className="app-skeleton h-4 w-full" />
        <div className="app-skeleton h-4 w-full" />
        <div className="app-skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}
