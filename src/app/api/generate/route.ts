import { NextResponse } from "next/server";
import { z } from "zod";
import { generateRecipeSetWithDO } from "@/lib/do-inference";
import { createRecipe } from "@/lib/recipe-store";
import type { RecipeRequest, TasteScale } from "@/types";
import { currentUser } from "@/lib/auth";
import { listCatalogIngredients } from "@/lib/ingredient-store";

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
  const user = await currentUser();
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
  const catalogIngredients = listCatalogIngredients(user?.id);
  const availableIngredients = catalogIngredients.filter((ingredient) => !ingredient.hidden && (!user || ingredient.available));
  let generated;
  try {
    generated = await generateRecipeSetWithDO(input, availableIngredients);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inference connection failed";
    return NextResponse.json({ error: message.includes("fetch failed") ? "Нет подключения к сервису генерации." : message }, { status: 503 });
  }

  if (!parsed.saveToMenu) {
    return NextResponse.json(generated);
  }

  if (!user) {
    return NextResponse.json({ error: "Login required to save recipes" }, { status: 401 });
  }

  const recipe = createRecipe({
    userId: user.id,
    ...generated.recipe,
    prepared: false,
    rating: null,
    inMenu: true,
  });

  return NextResponse.json({ recipe, variants: generated.variants, usage: generated.usage }, { status: 201 });
}
