"use client";

import { useEffect, useRef, useState } from "react";
import { CustomSelect } from "@/components/CustomSelect";
import type { Recipe } from "@/types";

const ratingOptions = [
  { value: "", label: "Без оценки" },
  ...[1, 2, 3, 4, 5].map((rating) => ({ value: String(rating), label: String(rating) })),
];

export function MenuClient({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const pendingRecipeHandled = useRef(false);

  useEffect(() => {
    if (pendingRecipeHandled.current) return;
    pendingRecipeHandled.current = true;

    const pendingRecipe = window.localStorage.getItem("pendingCoffeeRecipe");
    if (!pendingRecipe) return;

    async function savePendingRecipe() {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: pendingRecipe,
      });
      if (!response.ok) return;
      const data = await response.json();
      window.localStorage.removeItem("pendingCoffeeRecipe");
      setRecipes((items) => [data.recipe, ...items]);
    }

    void savePendingRecipe();
  }, []);

  async function patch(id: string, body: Partial<Pick<Recipe, "prepared" | "rating" | "inMenu">>) {
    const response = await fetch(`/api/recipes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) {
      const data = await response.json();
      setRecipes((items) => items.map((item) => (item.id === id ? data.recipe : item)));
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (response.ok) setRecipes((items) => items.filter((item) => item.id !== id));
  }

  return (
    <section className="menu-board">
      <div className="menu-table-wrap">
        <table className="menu-table">
          <thead><tr><th>Рецепт</th><th>Приготовлено (оценка)</th><th>В меню</th><th /></tr></thead>
          <tbody>
            {recipes.length ? recipes.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  <details>
                    <summary>Состав и шаги</summary>
                    <div className="menu-details">
                      <h3>Состав</h3><ul>{item.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
                      <h3>Приготовление</h3><ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    </div>
                  </details>
                </td>
                <td>
                  <label className="table-check"><input type="checkbox" checked={item.prepared} onChange={(event) => patch(item.id, { prepared: event.target.checked })} /> приготовлено</label>
                  <CustomSelect className="rating-select" options={ratingOptions} value={item.rating === null ? "" : String(item.rating)} onValueChange={(nextRating) => patch(item.id, { rating: nextRating ? Number(nextRating) : null })} />
                </td>
                <td><label className="table-check compact-check"><input type="checkbox" checked={item.inMenu} onChange={(event) => patch(item.id, { inMenu: event.target.checked })} /></label></td>
                <td><button className="small-button" type="button" onClick={() => remove(item.id)}>Удалить</button></td>
              </tr>
            )) : <tr><td colSpan={4}>Меню пока пустое.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
