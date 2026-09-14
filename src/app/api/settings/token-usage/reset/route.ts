import { requireApiUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function POST() {
  const user = await requireApiUser();
  if (!user) return Response.json({ error: "Sign in to reset recorded token usage." }, { status: 401 });

  const updated = await db.user.update({
    where: { id: user.id },
    data: { tokenUsed: 0 },
    select: { tokenUsed: true },
  });
  return Response.json(updated);
}
