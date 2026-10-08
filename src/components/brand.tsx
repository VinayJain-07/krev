import Link from "next/link";
import { KrevLogo } from "./krev-logo";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link className={`brand ${inverse ? "brand-inverse" : ""}`} href="/" aria-label="KREV AI home">
      <KrevLogo inverse={inverse} compact />
    </Link>
  );
}
