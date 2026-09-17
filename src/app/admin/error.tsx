"use client";

export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="admin-login-shell">
    <section className="admin-login-card" role="alert">
      <span className="admin-eyebrow">SMARK CONNECT · OWNER VIEW</span>
      <h1>Activity is temporarily unavailable</h1>
      <p>The dashboard could not reach its data. Check that the database is running, then try again.</p>
      <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <button type="button" className="admin-retry" onClick={retry} style={{ flex: 1 }}>Try again</button>
        <a href="/" className="admin-retry" style={{ flex: 1, textDecoration: "none", display: "grid", placeItems: "center", background: "#f5eff8", color: "#62366e" }}>Back to app</a>
      </div>
    </section>
  </main>;
}
