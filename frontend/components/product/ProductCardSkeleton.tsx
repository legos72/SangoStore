function Bone({ className }: { className?: string }) {
  return <div className={`shimmer-bg rounded-full ${className ?? ""}`} />;
}

export function ProductCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex flex-row rounded-2xl overflow-hidden bg-[#FDFCF8] border border-[#EAE2D2] shadow-card">
        <div className="w-28 sm:w-36 self-stretch shimmer-bg flex-shrink-0" />
        <div className="flex flex-col flex-1 px-3 py-3 gap-1.5">
          <div className="flex items-center gap-1.5">
            <Bone className="h-2.5 w-2.5" />
            <Bone className="h-2 w-14" />
          </div>
          <Bone className="h-3 w-3/4" />
          <Bone className="h-3 w-1/2" />
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <Bone className="h-4 w-20" />
            <div className="shimmer-bg rounded-xl h-8 w-20 flex-shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-[#FDFCF8] border border-[#EAE2D2] shadow-card">
      {/* Image */}
      <div className="shimmer-bg flex-shrink-0" style={{ aspectRatio: "4/3" }} />

      {/* Content */}
      <div className="px-3 pt-2.5 pb-3 space-y-2">
        {/* Flag + category */}
        <div className="flex items-center gap-1">
          <Bone className="h-2.5 w-2.5" />
          <Bone className="h-2 w-14" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-3/4" />
        </div>

        {/* Price */}
        <Bone className="h-4 w-20" />

        {/* Buttons */}
        <div className="flex gap-1.5 pt-1">
          <div className="shimmer-bg rounded-xl h-9 w-9 flex-shrink-0" />
          <div className="shimmer-bg rounded-xl h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}
