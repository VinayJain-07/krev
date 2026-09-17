import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasAdminSession } from "@/lib/admin/session";
import { adminSignOut } from "./actions";
import { AdminRefresh } from "./refresh";

const dateTime = new Intl.DateTimeFormat("en-IN", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
});

function when(date: Date | null | undefined) {
  return date ? `${dateTime.format(date)} IST` : "No recorded sign-in";
}

function recentWindowStart() {
  return new Date(Date.now() - 7 * 24 * 60 * 60_000);
}

function databaseLabel() {
  try {
    const host = new URL(process.env.DATABASE_URL ?? "").hostname;
    return ["localhost", "127.0.0.1", "[::1]"].includes(host)
      ? "Local development database"
      : "Hosted database";
  } catch {
    return "Connected database";
  }
}

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin/login");
  const sevenDaysAgo = recentWindowStart();

  let totalUsers = 0;
  let totalCompanies = 0;
  let loggedInUsers: { userId: string }[] = [];
  let recentUsers: { userId: string }[] = [];
  let users: any[] = [];
  let recentActivity: any[] = [];
  let companyViews: { companyId: string | null; _count: { companyId: number } }[] = [];

  try {
    totalUsers = await db.user.count();
  } catch {}

  try {
    totalCompanies = await db.company.count();
  } catch {}

  try {
    users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        companies: {
          take: 12,
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, normalizedDomain: true, createdAt: true },
        },
        activityEvents: {
          where: { kind: "LOGIN" },
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
        _count: { select: { companies: true } },
      },
    });
  } catch {
    try {
      users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          companies: {
            take: 12,
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, normalizedDomain: true, createdAt: true },
          },
          _count: { select: { companies: true } },
        },
      });
    } catch {}
  }

  try {
    loggedInUsers = (await (db.activityEvent as any).groupBy({ by: ["userId"], where: { kind: "LOGIN" } })) ?? [];
  } catch {}

  try {
    recentUsers = (await (db.activityEvent as any).groupBy({ by: ["userId"], where: { kind: "LOGIN", createdAt: { gte: sevenDaysAgo } } })) ?? [];
  } catch {}

  try {
    recentActivity = await db.activityEvent.findMany({
      take: 80,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kind: true,
        detail: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        company: { select: { name: true, normalizedDomain: true } },
      },
    });
  } catch {}

  try {
    companyViews = (await (db.activityEvent as any).groupBy({
      by: ["companyId"],
      where: { kind: "COMPANY_VIEWED", companyId: { not: null } },
      _count: { companyId: true },
      orderBy: { _count: { companyId: "desc" } },
      take: 12,
    })) ?? [];
  } catch {}

  let interestCompanies: any[] = [];
  try {
    const ids = companyViews.flatMap((item: any) => (item.companyId ? [item.companyId] : []));
    if (ids.length > 0) {
      interestCompanies = await db.company.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, normalizedDomain: true, user: { select: { email: true } } },
      });
    }
  } catch {}
  const companyById = new Map(interestCompanies.map((company: any) => [company.id, company]));

  return <main className="admin-shell">
    <header className="admin-header">
      <div><span className="admin-eyebrow">SMARK CONNECT / OWNER VIEW</span><h1>Registered accounts</h1><p>Every account in the connected database, when it joined, and the companies it added. Updated every 30 seconds while this tab is visible.</p><span className="admin-source">{databaseLabel()}</span></div>
      <div className="admin-header-actions"><Link href="/" className="admin-nav-back">Back to app</Link><AdminRefresh /><form action={adminSignOut}><button type="submit">Sign out</button></form></div>
    </header>

    <div className="admin-body">
      <section className="admin-stats" aria-label="Activity totals">
        <article><span>Registered users</span><strong>{totalUsers.toLocaleString()}</strong><small>Accounts in the database</small></article>
        <article><span>Users signed in</span><strong>{loggedInUsers.length.toLocaleString()}</strong><small>Since activity tracking began</small></article>
        <article><span>Active in 7 days</span><strong>{recentUsers.length.toLocaleString()}</strong><small>Unique users with a recorded sign-in</small></article>
        <article><span>Total companies</span><strong>{totalCompanies.toLocaleString()}</strong><small>Across all registered accounts</small></article>
      </section>

      <p className="admin-tracking-note">Login and company-view history starts with this update. Existing accounts and companies are included in totals, while earlier visits are unavailable.</p>

      <div className="admin-columns">
        <section className="admin-panel admin-people">
          <div className="admin-panel-heading"><div><span>ACCOUNT DIRECTORY</span><h2>All registered accounts</h2></div><small>Showing all {users.length.toLocaleString()} accounts</small></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Account</th><th>Joined on</th><th>Companies</th><th>Last sign-in</th></tr></thead><tbody>
            {users.map((user: any) => <tr key={user.id}>
              <td><strong>{user.name || "Unnamed user"}</strong><small>{user.email}</small></td>
              <td>{when(user.createdAt)}</td>
              <td><strong className="admin-company-count">{user._count.companies.toLocaleString()}</strong><div className="admin-company-tags">{user.companies.map((company: any) => <span key={company.id} title={company.normalizedDomain}>{company.name}</span>)}{user._count.companies > user.companies.length && <span>+{user._count.companies - user.companies.length} more</span>}</div></td>
              <td>{when(user.activityEvents?.[0]?.createdAt)}</td>
            </tr>)}
            {!users.length && <tr><td colSpan={4} className="admin-empty">No accounts yet.</td></tr>}
          </tbody></table></div>
        </section>

        <aside className="admin-panel admin-interest">
          <div className="admin-panel-heading"><div><span>COMPANY INTEREST</span><h2>Most viewed workspaces</h2></div></div>
          <div className="admin-interest-list">{companyViews.map((view) => {
            const company = view.companyId ? companyById.get(view.companyId) : undefined;
            if (!company) return null;
            return <div key={company.id}><span className="admin-interest-badge">{view._count.companyId}</span><div><strong>{company.name}</strong><small>{company.normalizedDomain} · {company.user.email}</small></div></div>;
          })}{!companyViews.length && <p className="admin-empty">Company views will appear after people open their dashboards.</p>}</div>
        </aside>
      </div>

      <section className="admin-panel admin-activity">
        <div className="admin-panel-heading"><div><span>RECENT EVENTS</span><h2>Activity feed</h2></div><small>Most recent {recentActivity.length} events</small></div>
        <div className="admin-activity-list">{recentActivity.map((event) => <div key={event.id}>
          <span className={`admin-event-mark admin-event-${event.kind.toLowerCase()}`} />
          <p><strong>{event.user.name || event.user.email}</strong> {event.kind === "LOGIN" ? `signed in${event.detail ? ` with ${event.detail}` : ""}` : event.kind === "COMPANY_CREATED" ? "added a company" : "opened a company workspace"}{event.company && <> · <b>{event.company.name}</b></>}<small>{event.user.email}</small></p>
          <time dateTime={event.createdAt.toISOString()}>{when(event.createdAt)}</time>
        </div>)}{!recentActivity.length && <p className="admin-empty">No activity has been recorded yet.</p>}</div>
      </section>
    </div>
  </main>;
}
