export default function CompanyProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="app-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="app-skeleton h-16 w-16 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="app-skeleton h-5 w-1/2" />
            <div className="app-skeleton h-3 w-1/3" />
          </div>
        </div>
        <div className="app-skeleton h-4 w-full" />
        <div className="app-skeleton h-4 w-2/3" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="app-card p-6 h-20 app-skeleton" />
        ))}
      </div>
    </div>
  );
}
