import { MinimalCompanyLoading } from "@/components/minimal-company-loading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Searching Company Intelligence | KREV AI",
  description: "Live autonomous company research and positioning discovery in progress.",
};

export default async function AuditLoadingPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; url?: string }>;
}) {
  const { company, url } = await searchParams;

  return (
    <MinimalCompanyLoading
      initialCompany={company || "Stripe"}
      initialUrl={url || "https://stripe.com"}
    />
  );
}
