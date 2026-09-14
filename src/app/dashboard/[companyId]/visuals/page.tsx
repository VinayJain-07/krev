import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { reportStudioFrameworks } from "@/lib/documents/studio-frameworks";
import { FrameworkStudio } from "@/components/framework-studio";

export default async function VisualStudioPage({ params, searchParams }: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ document?: string }>;
}) {
  const user = await requireUser();
  const { companyId } = await params;
  const { document: focusDocumentId } = await searchParams;
  const company = await db.company.findFirst({
    where: { id: companyId, userId: user.id },
    select: { id: true, name: true, documents: { select: { id: true, title: true, contentMarkdown: true }, orderBy: { updatedAt: "desc" } } },
  });
  if (!company) notFound();
  return <FrameworkStudio companyId={company.id} companyName={company.name} reportFrameworks={reportStudioFrameworks(company.documents)} focusDocumentId={focusDocumentId} />;
}
