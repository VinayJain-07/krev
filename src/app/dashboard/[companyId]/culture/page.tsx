import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Brand } from "@/components/brand";
import { CulturalIntelligencePanel } from "@/components/cultural-intelligence-panel";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export default async function CulturePage({ params }: { params: Promise<{ companyId: string }> }) {
  const user = await requireUser();
  const { companyId } = await params;
  const company = await db.company.findFirst({ where: { id: companyId, userId: user.id }, select: { id: true, name: true } });
  if (!company) notFound();
  return <main className="culture-shell"><header className="culture-header"><Brand /><nav><Link href={`/dashboard/${company.id}`}><ArrowLeft size={15} /> Back to dashboard</Link><Link href={`/dashboard/${company.id}/reporting`}><BarChart3 size={15} /> Reporting</Link></nav></header><CulturalIntelligencePanel companyId={company.id} companyName={company.name} /></main>;
}
