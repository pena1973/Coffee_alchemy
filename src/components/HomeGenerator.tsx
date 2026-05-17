"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { CustomSelect } from "@/components/CustomSelect";

type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  source: "digitalocean" | "local";
};

type Recipe = {
  id?: string;
  title: string;
  badge?: string;
  ingredients: string[];
  steps: string[];
  metrics: [string, string][];
  usage?: TokenUsage;
  prepared?: boolean;
  rating?: number | null;
  inMenu?: boolean;
};

type RecipeVariant = Recipe & {
  variantId: "milder" | "brighter" | "lighter";
};

const barNameStorageKey = "coffeeBarName";

const variantLabels = [
  { id: "milder", label: "Чуть мягче: больше сливочности и на полтона слаще." },
  { id: "brighter", label: "Чуть ярче: больше кофейной горечи и меньше сладости." },
  { id: "lighter", label: "Чуть легче: меньше сливочности и ниже калорийность." },
] as const;

const sizeOptions = [
  { value: "180", label: "180 мл" },
  { value: "250", label: "250 мл" },
  { value: "350", label: "350 мл" },
  { value: "450", label: "450 мл" },
];

const aromaOptions = [
  { value: "ванилью и карамелью", label: "Ваниль и карамель" },
  { value: "корицей и какао", label: "Корица и какао" },
  { value: "кардамоном и медом", label: "Кардамон и мед" },
  { value: "лесным орехом", label: "Лесной орех" },
  { value: "кокосом и лаймом", label: "Кокос и лайм" },
  { value: "лавандой и белым шоколадом", label: "Лаванда и белый шоколад" },
];

function requestFromForm(form: FormData) {
  return {
    barName: String(form.get("barName") ?? ""),
    temperature: String(form.get("temperature") ?? "hot"),
    sizeMl: Number(form.get("size") ?? 250),
    calories: Number(form.get("calories") ?? 2),
    creaminess: Number(form.get("creaminess") ?? 2),
    sweetness: Number(form.get("sweetness") ?? 2),
    bitterness: Number(form.get("bitterness") ?? 1),
    salt: Number(form.get("salt") ?? 0),
    aroma: String(form.get("aroma") ?? ""),
  };
}

function attachUsage(recipe: Recipe, usage?: TokenUsage): Recipe {
  return usage ? { ...recipe, usage } : recipe;
}

export function HomeGenerator({ isRegistered }: { isRegistered: boolean }) {
  const [barName, setBarName] = useState("");
  const [baseRecipe, setBaseRecipe] = useState<Recipe | null>(null);
  const [variants, setVariants] = useState<RecipeVariant[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeVariant, setActiveVariant] = useState<string | undefined>();
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  useEffect(() => {
    setBarName(window.localStorage.getItem(barNameStorageKey) ?? "");
  }, []);

  function chooseBaseRecipe() {
    if (!baseRecipe) return;
    setRecipe(baseRecipe);
    setActiveVariant(undefined);
    setSaved(false);
  }

  function chooseVariant(variantId: RecipeVariant["variantId"]) {
    const selected = variants.find((item) => item.variantId === variantId);
    if (!selected) return;
    setRecipe(selected);
    setActiveVariant(variantId);
    setSaved(false);
  }

  async function onGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGenerating(true);
    setSaved(false);
    setGenerationError("");
    setBaseRecipe(null);
    setVariants([]);
    setRecipe(null);
    setActiveVariant(undefined);

    const form = new FormData(event.currentTarget);
    const nextBarName = String(form.get("barName") ?? "").trim();
    window.localStorage.setItem(barNameStorageKey, nextBarName);
    setBarName(nextBarName);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestFromForm(form)),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Не удалось сгенерировать рецепт.");
      }
      const data = await response.json();
      const usage = data.usage as TokenUsage | undefined;
      const nextBaseRecipe = attachUsage(data.recipe as Recipe, usage);
      const nextVariants = ((data.variants ?? []) as RecipeVariant[]).map((item) => attachUsage(item, usage) as RecipeVariant);
      setBaseRecipe(nextBaseRecipe);
      setVariants(nextVariants);
      setRecipe(nextBaseRecipe);
      setActiveVariant(undefined);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Нет подключения к сервису генерации.");
    } finally {
      setGenerating(false);
    }
  }

  async function saveRecipe() {
    if (!recipe) return;
    const title = document.querySelector<HTMLInputElement>("#recipeName")?.value.trim() || recipe.title;
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...recipe, title }),
    });
    if (response.ok) setSaved(true);
    else {
      window.localStorage.setItem("pendingCoffeeRecipe", JSON.stringify({ ...recipe, title }));
      window.location.href = "/login?next=/menu";
    }
  }

  return (
    <main>
      <section className="hero" aria-label="Генератор рецептов кофе">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-grid">
          <section className="generator-panel" aria-labelledby="generatorTitle">
            <div className="section-kicker">творческая лаборатория кофе</div>
            <h1 id="generatorTitle">Собери свой кофе</h1>
            <form className="controls" id="recipeForm" onSubmit={onGenerate}>
              <fieldset className="segmented-field">
                <legend>Температура</legend>
                <label>
                  <input type="radio" name="temperature" value="hot" defaultChecked />
                  <span>Горячий</span>
                </label>
                <label>
                  <input type="radio" name="temperature" value="cold" />
                  <span>Холодный</span>
                </label>
              </fieldset>
              <div className="inline-controls">
                <label className="control">
                  <span>Размер стакана</span>
                  <CustomSelect name="size" options={sizeOptions} defaultValue="250" />
                </label>
                <label className="control">
                  <span>Название бара</span>
                  <input name="barName" type="text" value={barName} onChange={(event) => setBarName(event.target.value)} placeholder="Например, Cofyz" />
                </label>
              </div>
              <div className="slider-grid">
                {[
                  ["calories", "Калорийность", "2"],
                  ["creaminess", "Сливочность", "2"],
                  ["sweetness", "Сладость", "2"],
                  ["bitterness", "Горечь", "1"],
                  ["salt", "Соль", "0"],
                ].map(([name, label, defaultValue]) => (
                  <label className="control" key={name}>
                    <span>{label}</span>
                    <input type="range" name={name} min="0" max="5" defaultValue={defaultValue} />
                  </label>
                ))}
              </div>
              <label className="control aroma-control">
                <span>Аромат</span>
                <CustomSelect name="aroma" options={aromaOptions} defaultValue={aromaOptions[0].value} />
              </label>
              <div className="actions">
                <button className="primary-button" disabled={generating} type="submit">
                  {generating ? <span className="button-spinner" aria-hidden="true" /> : null}
                  <span>{generating ? "Генерируем..." : "Сгенерировать"}</span>
                </button>
              </div>
              {recipe ? (
                <div className="generator-variants">
                  <h3>Еще 3 варианта</h3>
                  <div className="variants">
                    <button className={`variant base-variant ${!activeVariant ? "active-variant" : ""}`} type="button" onClick={chooseBaseRecipe}>
                      Основной вариант
                    </button>
                    {variantLabels.map((item) => (
                      <button className={`variant ${activeVariant === item.id ? "active-variant" : ""}`} key={item.id} type="button" onClick={() => chooseVariant(item.id)}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </form>
          </section>
          <section className="result-panel" aria-live="polite">
            {!recipe ? (
              <div className="result-empty">
                {generating ? (
                  <>
                    <span className="button-spinner result-spinner" aria-hidden="true" />
                    <h2>Генерируем рецепт</h2>
                    <p>Подключаемся к сервису генерации и собираем варианты напитка.</p>
                  </>
                ) : generationError ? (
                  <>
                    <span className="steam-icon">☕</span>
                    <h2>Подключение отсутствует</h2>
                    <p className="form-message result-message" role="alert">{generationError}</p>
                  </>
                ) : (
                  <>
                    <span className="steam-icon">☕</span>
                    <h2>Первый рецепт без регистрации</h2>
                  </>
                )}
                {!isRegistered && !generating && !generationError ? (
                  <Link className="primary-link result-register-link" href="/login?mode=register">
                    Зарегистрироваться
                  </Link>
                ) : null}
              </div>
            ) : (
              <article className="recipe-card" id="recipeResult">
                <div className="recipe-heading">
                  <div className="recipe-tools">
                    <button className="small-button save-recipe-button" type="button" onClick={saveRecipe}>
                      {saved ? "Сохранено" : "Сохранить рецепт"}
                    </button>
                  </div>
                  <div>
                    <div className="section-kicker">ваш рецепт</div>
                    <label className="recipe-name-field">
                      <input id="recipeName" type="text" defaultValue={recipe.title} key={recipe.title} />
                    </label>
                  </div>
                </div>
                <div className="metrics">
                  {recipe.metrics.map(([label, value]) => (
                    <div className="metric" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                <h3>Состав</h3>
                <ul className="ingredient-list">{recipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
                <h3>Приготовление</h3>
                <ol className="steps">{recipe.steps.map((item) => <li key={item}>{item}</li>)}</ol>
                {recipe.usage ? (
                  <p className="token-usage">
                    Токены: {recipe.usage.totalTokens} всего, {recipe.usage.promptTokens} запрос, {recipe.usage.completionTokens} ответ.
                  </p>
                ) : null}
              </article>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
