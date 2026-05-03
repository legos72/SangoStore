export function ProductCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex flex-row rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
        <div className="w-32 sm:w-44 self-stretch bg-gray-200 flex-shrink-0" />
        <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2">
          {/* flag + category */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-200" />
            <div className="h-2.5 w-16 rounded-full bg-gray-200" />
          </div>
          {/* title */}
          <div className="space-y-1.5">
            <div className="h-3.5 w-3/4 rounded-full bg-gray-200" />
            <div className="h-3.5 w-1/2 rounded-full bg-gray-200" />
          </div>
          {/* price */}
          <div className="mt-auto space-y-1">
            <div className="h-5 w-28 rounded-full bg-gray-200" />
          </div>
          {/* button */}
          <div className="h-9 w-32 rounded-xl bg-gray-200 mt-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="px-3 pt-2.5 pb-3 space-y-2">
        {/* category chip */}
        <div className="h-2.5 w-1/4 rounded-full bg-gray-200" />
        {/* title lines */}
        <div className="h-3.5 w-full rounded-full bg-gray-200" />
        <div className="h-3.5 w-2/3 rounded-full bg-gray-200" />
        {/* price */}
        <div className="h-5 w-1/2 rounded-full bg-gray-200 mt-1" />
        {/* CTA button */}
        <div className="h-9 w-full rounded-xl bg-gray-200 mt-2" />
      </div>
    </div>
  );
}
