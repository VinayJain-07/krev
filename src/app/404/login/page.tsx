import Link from "next/link";
import { redirect } from "next/navigation";
import { fourOhFourSignIn } from "../actions";
import { hasAdminSession } from "@/lib/admin/session";

export default async function FourOhFourLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await hasAdminSession()) redirect("/404");
  const { error } = await searchParams;
  const message = error === "locked"
    ? "Too many attempts. Try again in 15 minutes."
    : error === "config"
      ? "Admin access is not configured. Set ADMIN_PASSWORD or a bcrypt ADMIN_PASSWORD_HASH in Render and redeploy."
      : error === "invalid"
        ? "That admin password is incorrect."
        : null;

  return <main className="admin-login-shell">
    <section className="admin-login-card">
      <span className="admin-eyebrow">KREV AI · PRIVATE ACCESS</span>
      <h1>Admin activity</h1>
      <p>View new registrations, company additions, sign-ins, and workspace activity.</p>
      <form action={fourOhFourSignIn}>
        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required minLength={4} autoFocus placeholder="Enter access password" />
        <p style={{ fontSize: "11px", color: "#8a7e91", margin: "8px 0 0" }}>Use the private admin credential configured for this deployment.</p>
        {message && <p className="admin-form-error" role="alert">{message}</p>}
        <button type="submit">Open admin activity</button>
      </form>
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
        <Link href="/" style={{ color: "#79429c", textDecoration: "none", fontWeight: 600 }}>← Back to app</Link>
        <small style={{ color: "#928497", fontSize: "11px" }}>Access expires after 8 hours</small>
      </div>
    </section>
  </main>;
}
