import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { getInsights, QlooConfigurationError, QlooRequestError } from "@/lib/qloo/client";
import type { QlooEntityType } from "@/lib/qloo/types";

const schema = z.object({
  filterType: z.enum(["artist", "movie", "tv_show", "brand", "place", "destination", "book", "podcast", "videogame"]),
  entityIds: z.array(z.string().trim().min(1).max(240)).max(8).optional(),
  tags: z.array(z.string().trim().min(1).max(120)).max(8).optional(),
  audience: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  take: z.number().int().min(1).max(20).optional(),
});

export async function POST(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ ok: false, error: "Sign in to use cultural intelligence." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: "Choose a valid cultural category and audience context." }, { status: 400 });
  try {
    const result = await getInsights({ ...parsed.data, filterType: parsed.data.filterType as QlooEntityType });
    return Response.json({ ok: true, insights: result.insights, raw: result.payload, source: "qloo-live" });
  } catch (error) {
    if (error instanceof QlooConfigurationError) return Response.json({ ok: false, error: error.message, source: "unavailable" }, { status: 503 });
    if (error instanceof QlooRequestError) return Response.json({ ok: false, error: error.message, source: "qloo" }, { status: error.status });
    return Response.json({ ok: false, error: "Qloo insights failed. Try again shortly.", source: "qloo" }, { status: 502 });
  }
}
