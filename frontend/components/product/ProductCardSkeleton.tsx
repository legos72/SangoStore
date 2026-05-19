function Bone({ className }: { className?: string }) {
  return <div className={`shimmer-bg rounded-full ${className ?? ""}`} />;
}

export function ProductCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex flex-row rounded-xl overflow-hidden bg-white border border-gray-100/80">
        <div className="w-28 sm:w-36 self-stretch shimmer-bg flex-shrink-0" />
        <div className="flex flex-col flex-1 px-3 py-2.5 gap-1.5">
          <div className="flex items-center gap-1.5">
            <Bone className="h-2.5 w-2.5" />
            <Bone className="h-2 w-14" />
          </div>
          <Bone className="h-3 w-3/4" />
          <Bone className="h-3 w-1/2" />
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <Bone className="h-4 w-20" />
            <div className="shimmer-bg rounded-lg h-8 w-20 flex-shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100/80">
      {/* Image — aspect-square identique à la vraie card */}
      <div className="aspect-square shimmer-bg flex-shrink-0" />

      {/* Content */}
      <div className="px-3 pt-2 pb-2 space-y-1.5">
        {/* Flag + category */}
        <div className="flex items-center gap-1">
          <Bone className="h-2.5 w-2.5" />
          <Bone className="h-2 w-12" />
        </div>

        {/* Title — 2 lignes */}
        <div className="space-y-1">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>

        {/* Price */}
        <Bone className="h-3.5 w-16" />
      </div>

      {/* Bouton — border-t identique à la card */}
      <div className="border-t border-gray-100/80 px-3 py-2 flex items-center justify-between">
        <Bone className="h-3 w-3" />
        <Bone className="h-3 w-10" />
      </div>
    </div>
  );
}
