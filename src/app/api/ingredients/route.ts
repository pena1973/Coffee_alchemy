import { NextResponse } from "next/server";
import { currentUser, requireUser } from "@/lib/auth";
import { listCatalogIngredients, listIngredients, saveIngredient } from "@/lib/ingredient-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await currentUser();
  const url = new URL(request.url);
  const adminScope = url.searchParams.get("scope") === "site" && user?.role === "admin";
  const source = adminScope ? listIngredients({ includeHidden: true }) : listCatalogIngredients(user?.id);
  const ingredients = source.map((ingredient) => {
    if (user) return ingredient;
    const { cost: _cost, available: _available, hidden: _hidden, ownerUserId: _ownerUserId, isDefault: _isDefault, ...publicIngredient } = ingredient;
    return publicIngredient;
  });
  return NextResponse.json({ ingredients });
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 403 });
  }
  const body = await request.json();
  const siteScope = body.scope === "site" && user.role === "admin";
  const ingredient = saveIngredient({
    ...body,
    ownerUserId: siteScope ? null : user.id,
    isDefault: siteScope,
    hidden: siteScope ? body.hidden : false,
  });
  return NextResponse.json({ ingredient }, { status: 201 });
}
