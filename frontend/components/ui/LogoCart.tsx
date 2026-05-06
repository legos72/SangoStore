interface LogoCartProps {
  className?: string;
  size?: number;
}

export function LogoCart({ className, size = 36 }: LogoCartProps) {
  const id = "rca-clip";
  return (
    <svg
      viewBox="0 0 48 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <clipPath id={id}>
          {/* Basket interior shape */}
          <polygon points="11,11 41,11 39,31 13,31" />
        </clipPath>
      </defs>

      {/* ── RCA flag stripes clipped to basket interior ── */}
      {/* Blue */}
      <rect x="8" y="11" width="36" height="5" fill="#003082" clipPath={`url(#${id})`} />
      {/* White */}
      <rect x="8" y="16" width="36" height="5" fill="#F5F5F5" clipPath={`url(#${id})`} />
      {/* Green */}
      <rect x="8" y="21" width="36" height="5" fill="#289728" clipPath={`url(#${id})`} />
      {/* Yellow */}
      <rect x="8" y="26" width="36" height="5" fill="#FFCD00" clipPath={`url(#${id})`} />
      {/* Red vertical stripe (center) */}
      <rect x="21" y="11" width="6" height="20" fill="#BC0026" clipPath={`url(#${id})`} />

      {/* Gold star (top-left of basket) */}
      <text x="15.5" y="19" fontSize="7" fill="#FFCD00" textAnchor="middle" dominantBaseline="middle">
        ★
      </text>

      {/* ── Cart frame in gold ── */}
      {/* Handle + left side going into basket */}
      <path
        d="M2,4 L8,4 Q9.5,4 10,7 L13,31 L39,31 L43,11 L10,11"
        stroke="#C8960C"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Basket top bar */}
      <line x1="10" y1="11" x2="43" y2="11" stroke="#C8960C" strokeWidth="2.8" strokeLinecap="round" />
      {/* Vertical bar dividers inside basket */}
      <line x1="20" y1="11" x2="18.5" y2="31" stroke="#C8960C" strokeWidth="1.2" opacity="0.6" />
      <line x1="28" y1="11" x2="27" y2="31" stroke="#C8960C" strokeWidth="1.2" opacity="0.6" />
      <line x1="36" y1="11" x2="35.5" y2="31" stroke="#C8960C" strokeWidth="1.2" opacity="0.6" />

      {/* ── Wheels ── */}
      <circle cx="19" cy="38" r="4" fill="#289728" stroke="#C8960C" strokeWidth="1.8" />
      <circle cx="19" cy="38" r="1.2" fill="#C8960C" />
      <circle cx="34" cy="38" r="4" fill="#289728" stroke="#C8960C" strokeWidth="1.8" />
      <circle cx="34" cy="38" r="1.2" fill="#C8960C" />
    </svg>
  );
}
