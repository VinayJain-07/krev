/**
 * Lightweight liveness endpoint for external monitors such as UptimeRobot.
 * Keep this independent from the database so a monitor can wake the web
 * service without starting an application health check or a user session.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function response() {
  return Response.json(
    { ok: true, service: "krev" },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function GET() {
  return response();
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
