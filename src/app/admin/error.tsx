"use client";

export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="admin-login-shell">
    <section className="admin-login-card" role="alert">
      <span className="admin-eyebrow">SMARK CONNECT · OWNER VIEW</span>
      <h1>Activity is temporarily unavailable</h1>
      <p>The dashboard could not reach its data. Check that the database is running, then try again.</p>
      <button type="button" className="admin-retry" onClick={retry}>Try again</button>
    </section>
  </main>;
}
