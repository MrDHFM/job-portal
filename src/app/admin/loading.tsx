import { DashboardCardSkeleton, TableSkeleton } from "../../components/Skeletons";


export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="app-card p-6 h-24 app-skeleton" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>

      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
