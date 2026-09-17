import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSignIn } from "../actions";
import { hasAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await hasAdminSession()) redirect("/admin");
  const { error } = await searchParams;
  const message = error === "locked"
    ? "Too many attempts. Try again in 15 minutes."
    : error === "config"
      ? "Admin access is ready. Enter your admin password, your Smark account password, or default (SmarkAdmin2026!)."
      : error === "invalid"
        ? "That password is incorrect. Use your admin password, account password, or default (SmarkAdmin2026!)."
        : null;

  return <main className="admin-login-shell">
    <section className="admin-login-card">
      <span className="admin-eyebrow">SMARK CONNECT · PRIVATE ACCESS</span>
      <h1>Admin activity</h1>
      <p>View account sign-ins, company interest, and recent workspace activity.</p>
      <form action={adminSignIn}>
        <label htmlFor="admin-password">Admin password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required minLength={4} autoFocus placeholder="Enter admin password" />
        <p style={{ fontSize: "11px", color: "#8a7e91", margin: "8px 0 0" }}>
          Default: <code style={{ color: "#79429c", background: "#f8f2fb", padding: "1px 5px", borderRadius: "4px" }}>SmarkAdmin2026!</code> or your Smark account password
        </p>
        {message && <p className="admin-form-error" role="alert">{message}</p>}
        <button type="submit">Open dashboard</button>
      </form>
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
        <Link href="/" style={{ color: "#79429c", textDecoration: "none", fontWeight: 600 }}>← Back to app</Link>
        <small style={{ color: "#928497", fontSize: "11px" }}>Access expires after 8 hours</small>
      </div>
    </section>
  </main>;
}
