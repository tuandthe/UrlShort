export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="h-64 rounded-xl border bg-card animate-pulse md:col-span-2 lg:col-span-3" />
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="h-6 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
