import type { AgentType, Prisma } from "@prisma/client";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { runAgentAnalysis } from "@/lib/nodes/runner";
import { AGENT_DEFINITIONS } from "@/lib/nodes/registry";

const allowedAgents = AGENT_DEFINITIONS.map((agent) => agent.type) as [string, ...string[]];
const schema = z.object({ companyId: z.string().min(1), agentType: z.enum(allowedAgents) });
const completionSchema = schema.extend({ opportunityKey: z.string().min(1).max(700), completed: z.boolean() });

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to run an agent." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Choose a valid agent." }, { status: 400 });
  try {
    const result = await runAgentAnalysis({ companyId: parsed.data.companyId, userId: user.id, agentType: parsed.data.agentType as never });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The agent could not run." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to update an agent opportunity." }, { status: 401 });
  const parsed = completionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Choose a valid agent opportunity." }, { status: 400 });
  const company = await db.company.findFirst({ where: { id: parsed.data.companyId, userId: user.id }, select: { id: true } });
  if (!company) return Response.json({ error: "Company not found." }, { status: 404 });
  const agentType = parsed.data.agentType as AgentType;
  const existing = await db.agentConfig.findUnique({ where: { companyId_agentType: { companyId: company.id, agentType } } });
  const currentConfig = existing?.config && typeof existing.config === "object" && !Array.isArray(existing.config) ? existing.config as Record<string, unknown> : {};
  const currentCompleted = Array.isArray(currentConfig.completedOpportunities) ? currentConfig.completedOpportunities.filter((value): value is string => typeof value === "string") : [];
  const completedOpportunities = parsed.data.completed
    ? Array.from(new Set([...currentCompleted, parsed.data.opportunityKey]))
    : currentCompleted.filter((key) => key !== parsed.data.opportunityKey);
  const config = { ...currentConfig, completedOpportunities } as Prisma.InputJsonValue;
  await db.agentConfig.upsert({
    where: { companyId_agentType: { companyId: company.id, agentType } },
    create: { companyId: company.id, agentType, config },
    update: { config },
  });
  return Response.json({ completedOpportunities });
}
