import { NextResponse } from "next/server";
import { deleteIngredient, getIngredient, saveIngredient, saveUserIngredientSettings } from "@/lib/ingredient-store";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 403 });
  }
  const { id } = await context.params;
  const body = await request.json();
  const existing = getIngredient(id);
  if (!existing) return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });

  if (body.scope === "site" && user.role === "admin") {
    const ingredient = saveIngredient({ ...existing, ...body, id, ownerUserId: existing.ownerUserId, isDefault: existing.isDefault });
    return NextResponse.json({ ingredient });
  }

  if (existing.ownerUserId === user.id && !existing.isDefault) {
    const ingredient = saveIngredient({ ...existing, ...body, id, ownerUserId: user.id, isDefault: false });
    return NextResponse.json({ ingredient });
  }

  saveUserIngredientSettings(user.id, id, {
    calories: body.calories,
    cost: body.cost,
    available: body.available,
    hidden: body.hidden,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 403 });
  }
  const { id } = await context.params;
  const siteScope = new URL(request.url).searchParams.get("scope") === "site";
  const existing = getIngredient(id);
  if (!existing) return NextResponse.json({ ok: true });
  if (existing.ownerUserId !== user.id && !(user.role === "admin" && siteScope)) {
    return NextResponse.json({ error: "Cannot delete default ingredient from personal catalog" }, { status: 403 });
  }
  deleteIngredient(id);
  return NextResponse.json({ ok: true });
}
