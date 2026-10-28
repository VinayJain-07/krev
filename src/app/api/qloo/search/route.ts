import { z } from "zod";
import { requireApiUser } from "@/lib/auth-helpers";
import { QlooConfigurationError, QlooRequestError, searchEntities } from "@/lib/qloo/client";
import type { QlooEntityType } from "@/lib/qloo/types";

const querySchema = z.object({
  q: z.string().trim().min(2).max(120),
  type: z.enum(["artist", "movie", "tv_show", "brand", "place", "destination", "book", "podcast", "videogame"]).optional(),
  take: z.coerce.number().int().min(1).max(10).optional(),
});

function errorResponse(error: unknown) {
  if (error instanceof QlooConfigurationError) return Response.json({ ok: false, error: error.message, source: "unavailable" }, { status: 503 });
  if (error instanceof QlooRequestError) return Response.json({ ok: false, error: error.message, source: "qloo" }, { status: error.status });
  return Response.json({ ok: false, error: "Qloo search failed. Try again shortly.", source: "qloo" }, { status: 502 });
}
export async function GET(request: Request) {
  const user = await requireApiUser();
  if (!user) return Response.json({ ok: false, error: "Sign in to use cultural intelligence." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const parsed = querySchema.safeParse({ q: params.get("q") ?? "", type: params.get("type") ?? undefined, take: params.get("take") ?? undefined });
  if (!parsed.success) return Response.json({ ok: false, error: "Enter at least two characters to search." }, { status: 400 });
  try {
    const type = parsed.data.type as QlooEntityType | undefined;
    const entities = await searchEntities({ query: parsed.data.q, type, take: parsed.data.take });
    return Response.json({ ok: true, entities, source: "qloo-live" });
  } catch (error) {
    return errorResponse(error);
  }
}

