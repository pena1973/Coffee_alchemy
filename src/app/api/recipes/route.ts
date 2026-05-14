import { NextResponse } from "next/server";
import { createRecipe, listRecipes } from "@/lib/recipe-store";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ recipes: listRecipes(user.id) });
  } catch {
    return NextResponse.json({ recipes: [] }, { status: 401 });
  }
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required to save recipes" }, { status: 401 });
  }
  const body = await request.json();
  const recipe = createRecipe({
    userId: user.id,
    title: body.title,
    badge: body.badge ?? "coffee craft",
    ingredients: body.ingredients ?? [],
    steps: body.steps ?? [],
    metrics: body.metrics ?? [],
    prepared: false,
    rating: null,
    inMenu: false,
  });
  return NextResponse.json({ recipe }, { status: 201 });
}
