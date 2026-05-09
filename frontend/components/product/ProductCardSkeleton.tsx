function Bone({ className }: { className?: string }) {
  return <div className={`shimmer-bg rounded-full ${className ?? ""}`} />;
}

function BoneRect({ className }: { className?: string }) {
  return <div className={`shimmer-bg rounded-xl ${className ?? ""}`} />;
}

export function ProductCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="flex flex-row rounded-2xl overflow-hidden bg-white border border-gray-100">
        <div className="w-32 sm:w-44 self-stretch shimmer-bg flex-shrink-0" />
        <div className="flex flex-col flex-1 px-3 py-2.5 gap-2">
          <div className="flex items-center gap-2">
            <Bone className="h-3 w-3" />
            <Bone className="h-2.5 w-16" />
          </div>
          <div className="space-y-1.5">
            <Bone className="h-3.5 w-3/4" />
            <Bone className="h-3.5 w-1/2" />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3">
            <Bone className="h-5 w-24" />
            <BoneRect className="h-8 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100">
      {/* Image area */}
      <div className="h-[130px] sm:h-[155px] shimmer-bg flex-shrink-0" />

      {/* Content */}
      <div className="px-2.5 pt-2 pb-2.5 space-y-2">
        {/* Flag + category */}
        <div className="flex items-center gap-1.5">
          <Bone className="h-3 w-3" />
          <Bone className="h-2 w-14" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
        </div>

        {/* Price + button */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="space-y-1">
            <Bone className="h-4 w-20" />
            <Bone className="h-2.5 w-14" />
          </div>
          <BoneRect className="h-7 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
