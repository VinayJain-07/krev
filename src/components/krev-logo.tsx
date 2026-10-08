import Image from "next/image";

export function KrevLogo({ inverse = false, className = "", compact = false }: { inverse?: boolean; className?: string; compact?: boolean }) {
  return (
    <Image
      src={inverse ? "/krev-ai-logo-inverse.svg" : "/krev-ai-logo.svg"}
      alt="KREV AI"
      width={compact ? 116 : 156}
      height={compact ? 25 : 34}
      priority={compact}
      className={`krev-logo ${compact ? "krev-logo-compact" : ""} ${className}`.trim()}
    />
  );
}
