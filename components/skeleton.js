export function TableSkeleton({ rows = 5, cols = 5, dark = false }) {
  const bg = dark ? "bg-white/10" : "bg-gray-200";

  return (
    <div className="animate-pulse">
      <div className={`h-10 ${bg} rounded-lg mb-4 w-1/3`} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className={`h-8 ${bg} rounded-lg flex-1`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3, dark = false }) {
  const bg = dark ? "bg-white/10" : "bg-gray-200";

  return (
    <div className={`animate-pulse grid grid-cols-1 sm:grid-cols-3 gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${bg} rounded-xl p-6 h-24`} />
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 3, dark = false }) {
  const bg = dark ? "bg-white/10" : "bg-gray-200";

  return (
    <div className="animate-pulse space-y-4">
      <div className={`h-6 ${bg} rounded w-1/4 mb-6`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className={`h-12 ${bg} rounded-lg`} />
        ))}
      </div>
      <div className={`h-12 ${bg} rounded-lg w-32`} />
    </div>
  );
}
