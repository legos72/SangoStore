interface LogoCartProps {
  className?: string;
  size?: number;
}

export function LogoCart({ className, size = 36 }: LogoCartProps) {
  const clip = "ss-cart";
  return (
    <svg
      viewBox="0 0 56 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        {/* Cart interior clip */}
        <clipPath id={clip}>
          <polygon points="17,11 48,11 45,31 19,31" />
        </clipPath>
        {/* Gold gradient for cart frame */}
        <linearGradient id="ss-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8B84B" />
          <stop offset="100%" stopColor="#B8820A" />
        </linearGradient>
      </defs>

      {/* ── Speed / motion lines (left side, RCA flag colors) ── */}
      <line x1="1"  y1="15" x2="13" y2="15" stroke="#BC0026" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="3"  y1="20" x2="13" y2="20" stroke="#FFCD00" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5"  y1="25" x2="14" y2="25" stroke="#003082" strokeWidth="1.6" strokeLinecap="round" />

      {/* ── RCA flag fill inside cart body ── */}
      <rect x="15" y="11" width="35" height="5"   fill="#003082"  clipPath={`url(#${clip})`} />
      <rect x="15" y="16" width="35" height="5"   fill="#EFEFEF"  clipPath={`url(#${clip})`} />
      <rect x="15" y="21" width="35" height="5"   fill="#289728"  clipPath={`url(#${clip})`} />
      <rect x="15" y="26" width="35" height="5.5" fill="#FFCD00"  clipPath={`url(#${clip})`} />
      {/* Red vertical stripe */}
      <rect x="26" y="11" width="6"  height="20"  fill="#BC0026"  clipPath={`url(#${clip})`} />

      {/* Gold star on blue band */}
      <text
        x="21" y="13.5"
        fontSize="6.5" fill="#FFCD00"
        textAnchor="middle" dominantBaseline="middle"
      >★</text>

      {/* ── Cart frame (gold gradient stroke) ── */}
      {/* Handle */}
      <path
        d="M9,5 L16,5 Q17.5,5 18,8.5 L19,31 L45,31 L49,11 L16,11"
        stroke="url(#ss-gold)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Top bar */}
      <line x1="16" y1="11" x2="49" y2="11"
        stroke="url(#ss-gold)" strokeWidth="2.8" strokeLinecap="round" />

      {/* ── Wheels ── */}
      {/* Left wheel */}
      <circle cx="24" cy="39" r="4.2" fill="#289728" stroke="url(#ss-gold)" strokeWidth="2" />
      <circle cx="24" cy="39" r="1.4" fill="#C8960C" />
      {/* Right wheel */}
      <circle cx="40" cy="39" r="4.2" fill="#289728" stroke="url(#ss-gold)" strokeWidth="2" />
      <circle cx="40" cy="39" r="1.4" fill="#C8960C" />
    </svg>
  );
}
