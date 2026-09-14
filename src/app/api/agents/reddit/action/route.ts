import "server-only";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { extractCompanyMemory } from "@/lib/reddit/company-memory";
import { generateRedditReplyVariants } from "@/lib/reddit/writer";
import type { EvaluatedRedditOpportunity } from "@/lib/reddit/scorer";
import type { Prisma } from "@prisma/client";

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to update opportunity." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { companyId, opportunityId, action, selectedVariantId, customDraft, opportunity } = body;

  if (!companyId || !opportunityId || !action) {
    return Response.json({ error: "Missing required fields (companyId, opportunityId, action)." }, { status: 400 });
  }

  const company = await db.company.findFirst({
    where: { id: companyId, userId: user.id },
    select: { id: true },
  });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });

  // Get current agent config
  const existingConfig = await db.agentConfig.findUnique({
    where: {
      companyId_agentType: {
        companyId: company.id,
        agentType: "REDDIT",
      },
    },
  });

  const currentConfig = existingConfig?.config && typeof existingConfig.config === "object" && !Array.isArray(existingConfig.config)
    ? (existingConfig.config as Record<string, unknown>)
    : {};

  const currentCompleted = Array.isArray(currentConfig.completedOpportunities)
    ? currentConfig.completedOpportunities.filter((v): v is string => typeof v === "string")
    : [];

  const currentDismissed = Array.isArray(currentConfig.dismissedOpportunities)
    ? currentConfig.dismissedOpportunities.filter((v): v is string => typeof v === "string")
    : [];

  const feedbackLog = Array.isArray(currentConfig.feedbackLog)
    ? (currentConfig.feedbackLog as Array<Record<string, unknown>>)
    : [];

  let newCompleted = [...currentCompleted];
  let newDismissed = [...currentDismissed];
  const newFeedback = [
    ...feedbackLog,
    {
      opportunityId,
      action,
      timestamp: new Date().toISOString(),
      variantId: selectedVariantId,
    },
  ];

  if (action === "replied" || action === "approve") {
    if (!newCompleted.includes(opportunityId)) {
      newCompleted.push(opportunityId);
    }
    // Remove from dismissed if previously dismissed
    newDismissed = newDismissed.filter((id) => id !== opportunityId);
  } else if (action === "dismiss") {
    if (!newDismissed.includes(opportunityId)) {
      newDismissed.push(opportunityId);
    }
    newCompleted = newCompleted.filter((id) => id !== opportunityId);
  }

  const updatedConfig = {
    ...currentConfig,
    completedOpportunities: newCompleted,
    dismissedOpportunities: newDismissed,
    feedbackLog: newFeedback.slice(-100), // Keep last 100 feedback entries
  } as Prisma.InputJsonValue;

  await db.agentConfig.upsert({
    where: {
      companyId_agentType: {
        companyId: company.id,
        agentType: "REDDIT",
      },
    },
    create: {
      companyId: company.id,
      agentType: "REDDIT",
      config: updatedConfig,
    },
    update: {
      config: updatedConfig,
    },
  });

  // Handle regeneration action if requested
  if (action === "regenerate" && opportunity) {
    const memory = await extractCompanyMemory(company.id);
    const regeneratedVariants = generateRedditReplyVariants(opportunity as EvaluatedRedditOpportunity, memory);
    return Response.json({
      success: true,
      action,
      opportunityId,
      replyVariants: regeneratedVariants,
      completedOpportunities: newCompleted,
      dismissedOpportunities: newDismissed,
    });
  }

  return Response.json({
    success: true,
    action,
    opportunityId,
    completedOpportunities: newCompleted,
    dismissedOpportunities: newDismissed,
  });
}
