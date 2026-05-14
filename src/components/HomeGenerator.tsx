"use client";

import { FormEvent, useState } from "react";

type Recipe = {
  id?: string;
  title: string;
  badge?: string;
  ingredients: string[];
  steps: string[];
  metrics: [string, string][];
  prepared?: boolean;
  rating?: number | null;
  inMenu?: boolean;
};

const variantLabels = [
  { id: "milder", label: "Чуть мягче: больше сливочности и на полтона слаще." },
  { id: "brighter", label: "Чуть ярче: больше кофейной горечи и меньше сладости." },
  { id: "lighter", label: "Чуть легче: меньше сливочности и ниже калорийность." },
];

function clamp(value: number) {
  return Math.max(0, Math.min(5, value));
}

function localRecipe(form: FormData, variant?: string): Recipe {
  const temperature = String(form.get("temperature") ?? "hot");
  const size = Number(form.get("size") ?? 250);
  const barName = String(form.get("barName") ?? "").trim();
  const aroma = String(form.get("aroma") ?? "ванилью и карамелью");
  let creaminess = Number(form.get("creaminess") ?? 3);
  let sweetness = Number(form.get("sweetness") ?? 3);
  let bitterness = Number(form.get("bitterness") ?? 3);
  let salt = Number(form.get("salt") ?? 1);
  let calories = Number(form.get("calories") ?? 3);

  if (variant === "milder") {
    creaminess = clamp(creaminess + 1);
    sweetness = clamp(sweetness + 1);
  }
  if (variant === "brighter") {
    bitterness = clamp(bitterness + 1);
    sweetness = clamp(sweetness - 1);
    salt = clamp(salt + 1);
  }
  if (variant === "lighter") {
    creaminess = clamp(creaminess - 1);
    calories = clamp(calories - 1);
    salt = clamp(salt - 1);
  }

  const base = barName ? barName.split(/\s+/)[0] : "Авторский";
  const title = `${variant ? "Вариант " : ""}${base} ${temperature === "cold" ? "айс" : "латте"}`;
  const coffeeMl = temperature === "cold" ? Math.round(size * 0.34) : Math.round(size * 0.28);
  const milkMl = Math.max(40, Math.round((size * (creaminess + 2)) / 10));
  const syrupMl = sweetness * 6;
  const saltLine = salt > 1 ? `${salt - 1} щепотка соли` : "без соли";

  return {
    title,
    badge: "coffee craft",
    ingredients: [`${coffeeMl} мл кофе`, `${milkMl} мл молочной части`, `${syrupMl} мл сладкого акцента`, saltLine, `Аромат: ${aroma}`],
    steps:
      temperature === "cold"
        ? ["Охлади стакан и добавь лед.", "Смешай кофе со сладким акцентом.", "Добавь молочную часть, соль и заверши ароматом."]
        : ["Приготовь концентрированный кофе.", "Прогрей и взбей молочную часть.", "Смешай основу, сладость, соль и аромат."],
    metrics: [
      ["Объем", `${size} мл`],
      ["Калории", `≈ ${Math.round(size * 0.16 + sweetness * 24 + creaminess * 38)} ккал`],
      ["Аромат", aroma],
      ["Сливочность", `${creaminess}/5`],
      ["Сладость", `${sweetness}/5`],
      ["Горечь", `${bitterness}/5`],
      ["Соль", `${salt}/5`],
    ],
  };
}

export function HomeGenerator() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);
  const [variant, setVariant] = useState<string | undefined>();

  function makeRecipe(nextVariant?: string) {
    const form = document.querySelector<HTMLFormElement>("#recipeForm");
    if (!form) return;
    setVariant(nextVariant);
    setRecipe(localRecipe(new FormData(form), nextVariant));
    setSaved(false);
  }

  async function onGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    makeRecipe();
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
    else window.location.href = "/login";
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
                  <select name="size" defaultValue="250">
                    <option value="180">180 мл</option>
                    <option value="250">250 мл</option>
                    <option value="350">350 мл</option>
                    <option value="450">450 мл</option>
                  </select>
                </label>
                <label className="control">
                  <span>Название бара</span>
                  <input name="barName" type="text" placeholder="Например, Cofyz" />
                </label>
              </div>
              <div className="slider-grid">
                {["calories:Калорийность", "creaminess:Сливочность", "sweetness:Сладость", "bitterness:Горечь", "salt:Соль"].map((item) => {
                  const [name, label] = item.split(":");
                  return (
                    <label className="control" key={name}>
                      <span>{label}</span>
                      <input type="range" name={name} min="0" max="5" defaultValue="3" />
                    </label>
                  );
                })}
              </div>
              <label className="control aroma-control">
                <span>Аромат</span>
                <select name="aroma">
                  <option value="ванилью и карамелью">Ваниль и карамель</option>
                  <option value="корицей и какао">Корица и какао</option>
                  <option value="кардамоном и медом">Кардамон и мед</option>
                  <option value="лесным орехом">Лесной орех</option>
                  <option value="кокосом и лаймом">Кокос и лайм</option>
                  <option value="лавандой и белым шоколадом">Лаванда и белый шоколад</option>
                </select>
              </label>
              <div className="actions">
                <button className="primary-button" type="submit">
                  Сгенерировать
                </button>
              </div>
              {recipe ? (
                <div className="generator-variants">
                  <h3>Еще 3 варианта</h3>
                  <div className="variants">
                    {variant ? (
                      <button className="variant base-variant" type="button" onClick={() => makeRecipe()}>
                        Вернуться к основному варианту
                      </button>
                    ) : null}
                    {variantLabels.map((item) => (
                      <button className="variant" key={item.id} type="button" onClick={() => makeRecipe(item.id)}>
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
                <span className="steam-icon">☕</span>
                <h2>Первый рецепт без регистрации</h2>
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
                <div className="metrics">{recipe.metrics.map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
                <h3>Состав</h3>
                <ul className="ingredient-list">{recipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
                <h3>Приготовление</h3>
                <ol className="steps">{recipe.steps.map((item) => <li key={item}>{item}</li>)}</ol>
              </article>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
