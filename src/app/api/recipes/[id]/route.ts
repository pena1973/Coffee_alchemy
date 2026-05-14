import { NextResponse } from "next/server";
import { deleteRecipe, updateRecipe } from "@/lib/recipe-store";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  const { id } = await context.params;
  const body = await request.json();
  const recipe = updateRecipe(id, user.id, body);
  if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  return NextResponse.json({ recipe });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }
  const { id } = await context.params;
  deleteRecipe(id, user.id);
  return NextResponse.json({ ok: true });
}
