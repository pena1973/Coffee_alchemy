import { NextResponse } from "next/server";
import { z } from "zod";
import { generateRecipeWithDO } from "@/lib/do-inference";
import { createRecipe } from "@/lib/recipe-store";
import type { RecipeRequest, TasteScale } from "@/types";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

const taste = z.coerce.number().int().min(0).max(5);

const schema = z.object({
  barName: z.string().optional(),
  temperature: z.enum(["hot", "cold"]),
  sizeMl: z.coerce.number().int().min(120).max(600),
  calories: taste,
  creaminess: taste,
  sweetness: taste,
  bitterness: taste,
  salt: taste.default(1),
  aroma: z.string().min(1),
  saveToMenu: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const parsed = schema.parse(await request.json());
  const input: RecipeRequest = {
    barName: parsed.barName,
    temperature: parsed.temperature,
    sizeMl: parsed.sizeMl,
    calories: parsed.calories as TasteScale,
    creaminess: parsed.creaminess as TasteScale,
    sweetness: parsed.sweetness as TasteScale,
    bitterness: parsed.bitterness as TasteScale,
    salt: parsed.salt as TasteScale,
    aroma: parsed.aroma,
  };
  const generated = await generateRecipeWithDO(input);

  if (!parsed.saveToMenu) {
    return NextResponse.json({ recipe: generated });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required to save recipes" }, { status: 401 });
  }

  const recipe = createRecipe({
    userId: user.id,
    ...generated,
    prepared: false,
    rating: null,
    inMenu: true,
  });

  return NextResponse.json({ recipe }, { status: 201 });
}
