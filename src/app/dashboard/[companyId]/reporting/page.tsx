import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, FilePlus2, RotateCcw } from "lucide-react";
import { Brand } from "@/components/brand";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export default async function ReportingPage({ params }: PageProps<"/dashboard/[companyId]/reporting">) {
  const user = await requireUser();
  const { companyId } = await params;
  const company = await db.company.findFirst({ where: { id: companyId, userId: user.id }, include: { reports: { orderBy: { createdAt: "desc" } }, chatAttachments: { where: { remembered: true }, select: { id: true } } } });
  if (!company) notFound();
  return <main className="reporting-shell"><header><Brand /><Link href={`/dashboard/${company.id}`}>← Back to terminal</Link></header><section className="reporting-hero"><p className="eyebrow">REPORTING</p><h1>Client-ready intelligence,<br /><span>one click away.</span></h1><p>Generate branded reports from the same company documents, audit history, agent recommendations, and {company.chatAttachments.length} uploaded source {company.chatAttachments.length === 1 ? "document" : "documents"} already in KREV AI.</p><button type="button" disabled title="Live report generation will be enabled after the first company audit"><FilePlus2 size={16} /> Generate report</button></section><section className="report-list"><div className="report-list-heading"><div><h2>Generated reports</h2><p>Monthly Summary is the installed placeholder template.</p></div><span>{company.reports.length} files</span></div>{company.reports.length ? company.reports.map((report) => <article key={report.id}><div className="report-icon">PDF</div><div><strong>{report.template}</strong><small>{new Date(report.createdAt).toLocaleDateString()} · {report.format.toUpperCase()}</small></div><a href={report.fileUrl} download><Download size={15} /> Download</a><button type="button" disabled><RotateCcw size={14} /> Regenerate</button></article>) : <div className="empty-reports"><FilePlus2 size={24} /><strong>No reports yet</strong><p>The working template pipeline will appear here after generation is enabled.</p></div>}</section><div className="accent-bar" /></main>;
}
