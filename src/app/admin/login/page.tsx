import { redirect } from "next/navigation";
import { adminSignIn } from "../actions";
import { hasAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await hasAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  const message = error === "locked"
    ? "Too many attempts. Try again in 15 minutes."
    : error === "config"
      ? "Admin access has not been configured on this server."
      : error === "invalid"
        ? "That password is incorrect."
        : null;

  return <main className="admin-login-shell">
    <section className="admin-login-card">
      <span className="admin-eyebrow">SMARK CONNECT · PRIVATE ACCESS</span>
      <h1>Admin activity</h1>
      <p>View account sign-ins, company interest, and recent workspace activity.</p>
      <form action={adminSignIn}>
        <label htmlFor="admin-password">Admin password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required minLength={8} autoFocus />
        {message && <p className="admin-form-error" role="alert">{message}</p>}
        <button type="submit">Open dashboard</button>
      </form>
      <small>Access expires after eight hours.</small>
    </section>
  </main>;
}
