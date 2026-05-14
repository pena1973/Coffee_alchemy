import type { RecipeRequest } from "@/types";

type GeneratedRecipe = {
  title: string;
  badge: string;
  ingredients: string[];
  steps: string[];
  metrics: [string, string][];
};

const fallbackModel = "llama3.3-70b-instruct";

export async function generateRecipeWithDO(input: RecipeRequest): Promise<GeneratedRecipe> {
  const apiKey = process.env.MODEL_ACCESS_KEY;
  if (!apiKey) {
    return localRecipe(input);
  }

  const baseUrl = process.env.DO_INFERENCE_BASE_URL ?? "https://inference.do-ai.run/v1";
  const model = process.env.DO_RECIPE_MODEL ?? fallbackModel;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.75,
      max_completion_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "Ты кофейный технолог. Возвращай только валидный JSON без markdown. Схема: {\"title\":string,\"badge\":string,\"ingredients\":string[],\"steps\":string[],\"metrics\":[[string,string]]}.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Создай авторский рецепт кофе на русском языке.",
            input,
            constraints: [
              "Название должно учитывать barName, если он задан.",
              "Рецепт должен быть реалистичным для кофейни.",
              "metrics должны включать объем, калории, аромат, сливочность, сладость, горечь.",
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

  return JSON.parse(content) as GeneratedRecipe;
}

function localRecipe(input: RecipeRequest): GeneratedRecipe {
  const coffeeMl = input.temperature === "cold" ? Math.round(input.sizeMl * 0.34) : Math.round(input.sizeMl * 0.28);
  const milkMl = Math.max(40, Math.round((input.sizeMl * (input.creaminess + 2)) / 10));
  const syrupMl = input.sweetness * 6;
  const base = input.barName?.trim().split(/\s+/)[0] || "Авторский";

  return {
    title: `${base} ${input.temperature === "cold" ? "айс" : "латте"}`,
    badge: "coffee craft",
    ingredients: [`${coffeeMl} мл кофе`, `${milkMl} мл молочной части`, `${syrupMl} мл сладкого акцента`, `Аромат: ${input.aroma}`],
    steps:
      input.temperature === "cold"
        ? ["Охладите стакан и добавьте лед.", "Смешайте кофе со сладким акцентом.", "Добавьте молочную часть и завершите ароматом."]
        : ["Приготовьте концентрированный кофе.", "Прогрейте и взбейте молочную часть.", "Смешайте основу, сладость и аромат."],
    metrics: [
      ["Объем", `${input.sizeMl} мл`],
      ["Калории", `≈ ${Math.round(input.sizeMl * 0.16 + input.sweetness * 24 + input.creaminess * 38)} ккал`],
      ["Аромат", input.aroma],
      ["Сливочность", `${input.creaminess}/5`],
      ["Сладость", `${input.sweetness}/5`],
      ["Горечь", `${input.bitterness}/5`],
    ],
  };
}
