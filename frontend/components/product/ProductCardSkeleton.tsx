export function ProductCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex flex-row h-28 sm:h-32 rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
        <div className="w-28 sm:w-36 h-full bg-gray-200 flex-shrink-0" />
        <div className="flex flex-col flex-1 p-3 justify-between">
          <div className="space-y-2">
            <div className="h-3.5 w-3/4 bg-gray-200 rounded-full" />
            <div className="h-3.5 w-1/2 bg-gray-200 rounded-full" />
          </div>
          <div className="h-4 w-24 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-3.5 w-full bg-gray-200 rounded-full" />
        <div className="h-3.5 w-2/3 bg-gray-200 rounded-full" />
        <div className="h-4 w-1/2 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
