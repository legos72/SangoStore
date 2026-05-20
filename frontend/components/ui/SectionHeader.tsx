import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  center?: boolean;
  accent?: "gold" | "forest";
}

export function SectionHeader({
  label,
  title,
  subtitle,
  href,
  hrefLabel = "Voir tout",
  center = false,
  accent = "gold",
}: SectionHeaderProps) {
  const accentColor = accent === "gold" ? "#D4961E" : "#1B3A2D";

  return (
    <div className={`flex items-start justify-between gap-4 ${center ? "flex-col items-center text-center" : ""}`}>
      <div className={center ? "flex flex-col items-center" : ""}>
        {label && (
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="inline-block w-4 h-[3px] rounded-full flex-shrink-0"
              style={{ background: accentColor }}
            />
            <span
              className="text-[10px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: accentColor }}
            >
              {label}
            </span>
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {href && !center && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors mt-1"
          style={{ color: accentColor }}
        >
          {hrefLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
      {href && center && (
        <Link
          href={href}
          className="btn-outline-orange text-sm mt-4"
        >
          {hrefLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
