import { NextResponse } from "next/server";
import { deleteUserWithData, requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  try {
    deleteUserWithData(id, admin.id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось удалить пользователя." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
