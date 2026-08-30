import { CategoryCardSkeleton } from "@/components/Skeletons";

export default function CategoriesLoading() {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="app-skeleton h-8 w-64 mb-2" />
        <div className="app-skeleton h-4 w-96 mb-10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
