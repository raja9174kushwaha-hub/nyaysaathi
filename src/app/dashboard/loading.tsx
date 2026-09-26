export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-20 pb-12 animate-pulse">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-9 w-52 bg-muted rounded-lg mb-2" />
            <div className="h-4 w-72 bg-muted rounded" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-muted rounded-md" />
            <div className="h-10 w-32 bg-muted rounded-md" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>

        {/* Document list skeleton */}
        <div className="h-6 w-40 bg-muted rounded mb-4" />
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
