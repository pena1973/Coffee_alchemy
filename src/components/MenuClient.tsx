"use client";

import { useState } from "react";
import type { Recipe } from "@/types";

export function MenuClient({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);

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
                  <select className="rating-select" value={item.rating ?? ""} onChange={(event) => patch(item.id, { rating: event.target.value ? Number(event.target.value) : null })}>
                    <option value="">Без оценки</option>
                    {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                  </select>
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
