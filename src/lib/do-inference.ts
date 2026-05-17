import type { Ingredient, RecipeRequest } from "@/types";

type VariantId = "milder" | "brighter" | "lighter";

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  source: "digitalocean" | "local";
};

export type GeneratedRecipe = {
  title: string;
  badge: string;
  ingredients: string[];
  steps: string[];
  metrics: [string, string][];
};

export type GeneratedRecipeSet = {
  recipe: GeneratedRecipe;
  variants: Array<GeneratedRecipe & { variantId: VariantId }>;
  usage: TokenUsage;
};

type CompactRecipe = {
  t: string;
  b?: string;
  i: string[];
  m: [string, string][];
};

type CompactRecipeSet = {
  s: string[];
  r: CompactRecipe;
  v: Array<CompactRecipe & { id: VariantId }>;
};

const fallbackModel = "mistral-3-14B";

function cleanJson(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function usageFromPayload(payload: { usage?: Record<string, number> }, model: string): TokenUsage {
  const usage = payload.usage ?? {};
  const promptTokens = usage.prompt_tokens ?? usage.input_tokens ?? 0;
  const completionTokens = usage.completion_tokens ?? usage.output_tokens ?? 0;

  return {
    promptTokens,
    completionTokens,
    totalTokens: usage.total_tokens ?? promptTokens + completionTokens,
    model,
    source: "digitalocean",
  };
}

function expandRecipe(recipe: CompactRecipe, steps: string[]): GeneratedRecipe {
  return {
    title: recipe.t,
    badge: recipe.b ?? "coffee craft",
    ingredients: recipe.i,
    steps,
    metrics: normalizeMetrics(recipe.m),
  };
}

function normalizeMetricLabel(label: string) {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("кал") || normalized.includes("калий")) return "Калории";
  if (normalized.includes("об")) return "Объем";
  if (normalized.includes("аромат")) return "Аромат";
  if (normalized.includes("слив")) return "Сливочность";
  if (normalized.includes("слад")) return "Сладость";
  if (normalized.includes("гор")) return "Горечь";
  if (normalized.includes("сол")) return "Соль";
  return label;
}

function normalizeMetrics(metrics: [string, string][]) {
  return metrics.map(([label, value]) => [normalizeMetricLabel(label), value] as [string, string]);
}

function expandSet(set: CompactRecipeSet, usage: TokenUsage): GeneratedRecipeSet {
  return {
    recipe: expandRecipe(set.r, set.s),
    variants: set.v.map((variant) => ({ ...expandRecipe(variant, set.s), variantId: variant.id })),
    usage,
  };
}

export async function generateRecipeSetWithDO(input: RecipeRequest, availableIngredients: Ingredient[]): Promise<GeneratedRecipeSet> {
  const apiKey = process.env.DO_INFERENCE_API_KEY ?? process.env.MODEL_ACCESS_KEY;
  const model = process.env.DO_RECIPE_MODEL ?? fallbackModel;

  if (!apiKey) {
    return localRecipeSet(input, availableIngredients, model);
  }

  const baseUrl = process.env.DO_INFERENCE_BASE_URL ?? "https://inference.do-ai.run/v1";
  const ingredientCatalog = availableIngredients.map((ingredient) => ({
    n: ingredient.name,
    c: ingredient.category,
    cal: ingredient.calories,
    cr: ingredient.creaminess,
    sw: ingredient.sweetness,
    bi: ingredient.bitterness,
    sa: ingredient.salt,
    ar: ingredient.aroma,
  }));

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.45,
      max_completion_tokens: 1500,
      messages: [
        {
          role: "system",
          content:
            "You are a professional coffee recipe developer. Return only valid minified JSON, no markdown. Compact schema: {\"s\":string[],\"r\":{\"t\":string,\"b\":string,\"i\":string[],\"m\":[[string,string]]},\"v\":[{\"id\":\"milder\"|\"brighter\"|\"lighter\",\"t\":string,\"b\":string,\"i\":string[],\"m\":[[string,string]]}]}. The shared s array is the preparation process for all recipes. It must have exactly 8 clear Russian cooking steps. Each recipe has exactly 6 ingredient lines and 7 short metrics. Variants change ingredients, balance, title and metrics, but reuse the same process.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Create one main coffee recipe and three small ready-to-use variations. Output text values in Russian.",
            input,
            availableIngredients: ingredientCatalog,
            variants: {
              milder: "softer, creamier, slightly sweeter",
              brighter: "more coffee bitterness, less sweet",
              lighter: "lower calories, less creamy",
            },
            naming: "Use barName as mood inspiration for drink titles. Do not simply copy it every time.",
            rules: [
              "Use only availableIngredients. Do not invent products.",
              "The shared steps must be detailed enough for a barista and include real verbs.",
              "Do not write steps like flavor notes or adjectives.",
              "Ingredient lines must be short with approximate amounts.",
              "Metrics must use these Russian labels exactly: Объем, Калории, Аромат, Сливочность, Сладость, Горечь, Соль. Never write Калий.",
              "Return exactly three variants with ids milder, brighter, lighter.",
            ],
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DO inference failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("DO inference returned an empty message");
  }

  const usage = usageFromPayload(payload, model);
  try {
    return expandSet(JSON.parse(cleanJson(content)) as CompactRecipeSet, usage);
  } catch {
    return { ...localRecipeSet(input, availableIngredients, model), usage };
  }
}

function byCategory(ingredients: Ingredient[], category: string) {
  return ingredients.find((ingredient) => ingredient.category.toLowerCase().includes(category.toLowerCase()));
}

function sharedSteps(input: RecipeRequest) {
  return input.temperature === "cold"
    ? [
        "Охладите стакан и подготовьте лед.",
        "Приготовьте крепкую кофейную основу.",
        "Смешайте кофе со сладким акцентом до ровного вкуса.",
        "Добавьте соль или балансирующий акцент по рецепту.",
        "Влейте молочную часть тонкой струей.",
        "Добавьте ароматный ингредиент и коротко перемешайте.",
        "Проверьте сладость и горечь перед подачей.",
        "Подавайте сразу, пока напиток остается холодным.",
      ]
    : [
        "Приготовьте крепкую кофейную основу.",
        "Смешайте кофе со сладким акцентом до растворения.",
        "Добавьте соль или балансирующий акцент по рецепту.",
        "Прогрейте молочную часть, не доводя до кипения.",
        "Взбейте молочную часть до мягкой пены.",
        "Соедините кофейную основу с молочной частью.",
        "Добавьте ароматный ингредиент и аккуратно перемешайте.",
        "Подавайте сразу, пока пена держит текстуру.",
      ];
}

function makeLocalRecipe(input: RecipeRequest, availableIngredients: Ingredient[], variant?: VariantId): Omit<GeneratedRecipe, "steps"> {
  const coffee = byCategory(availableIngredients, "кофе") ?? availableIngredients[0];
  const milk = byCategory(availableIngredients, "молоч") ?? availableIngredients[1] ?? coffee;
  const syrup = byCategory(availableIngredients, "сироп") ?? byCategory(availableIngredients, "слад") ?? availableIngredients[2] ?? coffee;
  const firstAromaWord = input.aroma.toLowerCase().split(" ")[0] ?? "";
  const accent = availableIngredients.find((ingredient) => ingredient.aroma.toLowerCase().includes(firstAromaWord)) ?? availableIngredients[3] ?? syrup;
  const creaminess = variant === "lighter" ? Math.max(0, input.creaminess - 1) : variant === "milder" ? Math.min(5, input.creaminess + 1) : input.creaminess;
  const sweetness = variant === "brighter" ? Math.max(0, input.sweetness - 1) : variant === "milder" ? Math.min(5, input.sweetness + 1) : input.sweetness;
  const bitterness = variant === "brighter" ? Math.min(5, input.bitterness + 1) : input.bitterness;
  const coffeeMl = input.temperature === "cold" ? Math.round(input.sizeMl * 0.34) : Math.round(input.sizeMl * 0.28);
  const milkMl = Math.max(40, Math.round((input.sizeMl * (creaminess + 2)) / 10));
  const syrupMl = sweetness * 6;
  const barMood = input.barName?.trim().split(/\s+/)[0] || "Авторский";
  const variantPrefix = variant === "milder" ? "Мягкий" : variant === "brighter" ? "Яркий" : variant === "lighter" ? "Легкий" : "";

  return {
    title: `${variantPrefix ? `${variantPrefix} ` : ""}${barMood} ${input.temperature === "cold" ? "айс" : "латте"}`,
    badge: "coffee craft",
    ingredients: [
      `${coffeeMl} мл: ${coffee?.name ?? "кофе"}`,
      `${milkMl} мл: ${milk?.name ?? "молочная часть"}`,
      `${syrupMl} мл: ${syrup?.name ?? "сладкий акцент"}`,
      input.salt > 0 ? `соль: ${input.salt} щепотка` : "без соли",
      `аромат: ${accent?.name ?? input.aroma}`,
      input.temperature === "cold" ? "лед: 4-5 кубиков" : "пена: 2-3 ложки",
    ],
    metrics: [
      ["Объем", `${input.sizeMl} мл`],
      ["Калории", `≈ ${Math.round(input.sizeMl * 0.16 + sweetness * 24 + creaminess * 38)} ккал`],
      ["Аромат", accent?.name ?? input.aroma],
      ["Сливочность", `${creaminess}/5`],
      ["Сладость", `${sweetness}/5`],
      ["Горечь", `${bitterness}/5`],
      ["Соль", `${input.salt}/5`],
    ],
  };
}

function withSteps(recipe: Omit<GeneratedRecipe, "steps">, steps: string[]): GeneratedRecipe {
  return { ...recipe, steps };
}

function localRecipeSet(input: RecipeRequest, availableIngredients: Ingredient[], model: string): GeneratedRecipeSet {
  const steps = sharedSteps(input);
  return {
    recipe: withSteps(makeLocalRecipe(input, availableIngredients), steps),
    variants: [
      { ...withSteps(makeLocalRecipe(input, availableIngredients, "milder"), steps), variantId: "milder" },
      { ...withSteps(makeLocalRecipe(input, availableIngredients, "brighter"), steps), variantId: "brighter" },
      { ...withSteps(makeLocalRecipe(input, availableIngredients, "lighter"), steps), variantId: "lighter" },
    ],
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model,
      source: "local",
    },
  };
}
