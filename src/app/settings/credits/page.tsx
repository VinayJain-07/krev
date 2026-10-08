import { AIConnectionForm } from "@/components/ai-connection-form";
import { SettingsShell } from "@/components/settings-shell";
import { requireUser } from "@/lib/auth-helpers";
import { TokenBudgetForm } from "@/components/token-budget-form";

export default async function CreditsSettingsPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; reason?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const returnTo = query.returnTo?.startsWith("/") && !query.returnTo.startsWith("//") ? query.returnTo : "/";
  const recoveryReason = query.reason === "model" ? "model" as const : null;
  return <SettingsShell active="Credits"><div className="settings-heading"><p className="eyebrow">CREDITS & API</p><h2>Your AI provider</h2><p>All live generation uses your own provider account. KREV AI never includes a shared platform key.</p></div><AIConnectionForm returnTo={returnTo} initialProvider={user.llmProvider ?? "anthropic"} initialModel={user.llmModel} currentPreview={user.llmKeyPreview} recoveryReason={recoveryReason} /><TokenBudgetForm initialBudget={user.tokenBudget} tokenUsed={user.tokenUsed} /></SettingsShell>;
}
