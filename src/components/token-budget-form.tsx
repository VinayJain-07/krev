"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function TokenBudgetForm({ initialBudget, tokenUsed }: { initialBudget: number; tokenUsed: number }) {
  const router = useRouter();
  const [budget, setBudget] = useState(String(initialBudget));
  const [used, setUsed] = useState(tokenUsed);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<"save" | "reset" | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("save");
    setMessage("");
    try {
      const response = await fetch("/api/settings/token-budget", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenBudget: Number(budget) }) });
      const result = await response.json() as { tokenBudget?: number; error?: string };
      if (!response.ok || result.tokenBudget === undefined) throw new Error(result.error ?? "The token limit could not be updated.");
      setBudget(String(result.tokenBudget));
      setMessage("Token limit saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The token limit could not be updated.");
    } finally {
      setPending(null);
    }
  }

  async function resetUsage() {
    setPending("reset");
    setMessage("");
    try {
      const response = await fetch("/api/settings/token-usage/reset", { method: "POST" });
      const result = await response.json() as { tokenUsed?: number; error?: string };
      if (!response.ok || result.tokenUsed === undefined) throw new Error(result.error ?? "Recorded token usage could not be reset.");
      setUsed(result.tokenUsed);
      setConfirmReset(false);
      setMessage("Recorded token usage reset to 0.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recorded token usage could not be reset.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-[#11101d] p-6 text-slate-100 shadow-xl sm:p-8">
      <form onSubmit={save} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Workspace token limit</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">{used.toLocaleString()} estimated tokens recorded. Set the limit to 0 for no application-level cap.</p>
        </div>
        <label htmlFor="token-budget" className="block text-xs font-semibold text-slate-300">Token limit</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="token-budget"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={budget}
            onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))}
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[0.05] px-4 text-sm text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
          />
          <button type="submit" disabled={pending !== null} className="h-11 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white hover:bg-purple-500 disabled:cursor-wait disabled:opacity-50">
            {pending === "save" ? "Saving…" : "Save limit"}
          </button>
        </div>
      </form>

      <div className="mt-7 border-t border-white/10 pt-6">
        <h3 className="text-sm font-semibold text-white">Recorded usage</h3>
        <p className="mt-2 text-xs leading-5 text-slate-400">Resetting starts a new application-level usage count. It does not reset your AI provider&apos;s billing or erase generated work.</p>
        {confirmReset ? (
          <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
            <p className="text-xs leading-5 text-amber-100">Reset the recorded count from {used.toLocaleString()} to 0?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={resetUsage} disabled={pending !== null} className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#1a1420] hover:bg-amber-400 disabled:cursor-wait disabled:opacity-50">
                {pending === "reset" ? "Resetting…" : "Confirm reset"}
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} disabled={pending !== null} className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-50">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => { setMessage(""); setConfirmReset(true); }} disabled={pending !== null || used === 0} className="mt-4 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-amber-400/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40">
            Reset token usage
          </button>
        )}
      </div>
      {message && <p role="status" className="mt-4 text-xs text-slate-300">{message}</p>}
    </div>
  );
}
