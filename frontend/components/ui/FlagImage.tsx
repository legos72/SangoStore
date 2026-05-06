"use client";

interface FlagImageProps {
  code: string;
  size?: "sm" | "md";
  className?: string;
}

export function FlagImage({ code, size = "sm", className }: FlagImageProps) {
  if (!code || code.length !== 2) return <span>🌍</span>;
  const lower = code.toLowerCase();
  const w = size === "sm" ? 20 : 24;
  const h = size === "sm" ? 15 : 18;
  return (
    <img
      src={`https://flagcdn.com/${w}x${h}/${lower}.png`}
      srcSet={`https://flagcdn.com/${w * 2}x${h * 2}/${lower}.png 2x`}
      width={w}
      height={h}
      alt={code}
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", borderRadius: 2 }}
    />
  );
}
