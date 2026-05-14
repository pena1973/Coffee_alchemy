"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Ingredient } from "@/types";

const categories = ["Кофе", "Молочная часть", "Сиропы", "Сладость и баланс", "Специи", "Финиш"];
const pageSize = 10;

const icon = {
  save: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 15h10l1-15" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
  ),
  hide: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" /><path d="M9.9 4.2A9.9 9.9 0 0 1 12 4c5 0 8.6 4 10 8a14 14 0 0 1-2.1 3.8" /><path d="M6.6 6.6A13.6 13.6 0 0 0 2 12c1.4 4 5 8 10 8a9.9 9.9 0 0 0 5.4-1.6" /></svg>
  ),
  show: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
  ),
};

function formPayload(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? ""),
    category: String(data.get("category") ?? "Кофе"),
    aroma: String(data.get("aroma") ?? ""),
    cost: Number(data.get("cost") ?? 0),
    calories: Number(data.get("calories") ?? 1),
    creaminess: Number(data.get("creaminess") ?? 1),
    sweetness: Number(data.get("sweetness") ?? 1),
    bitterness: Number(data.get("bitterness") ?? 1),
    salt: Number(data.get("salt") ?? 1),
    available: data.get("available") === "on",
    hidden: data.get("hidden") === "on",
  };
}

export function AdminIngredientsClient({ initialIngredients }: { initialIngredients: Ingredient[] }) {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    return ingredients.filter((item) => {
      const matchesQuery = [item.name, item.category, item.aroma].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [ingredients, query, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function refresh() {
    const response = await fetch("/api/ingredients?scope=site", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    setIngredients(data.ingredients);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = event.currentTarget;
    const payload = formPayload(target);
    if (!payload.name.trim() || !payload.aroma.trim()) {
      setFormError("Заполни название и аромат ингредиента.");
      target.querySelector<HTMLInputElement>("input:invalid")?.focus();
      return;
    }
    setFormError("");
    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, scope: "site" }),
    });
    if (response.ok) {
      target.reset();
      setPage(1);
      await refresh();
    }
  }

  async function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const target = event.currentTarget;
    await fetch(`/api/ingredients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formPayload(target), scope: "site" }),
    });
    await refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/ingredients/${id}?scope=site`, { method: "DELETE" });
    await refresh();
  }

  async function toggleHidden(item: Ingredient) {
    await fetch(`/api/ingredients/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, scope: "site", hidden: !item.hidden, available: item.hidden ? item.available : false }),
    });
    await refresh();
  }

  function resetPage(next: () => void) {
    next();
    setPage(1);
  }

  return (
    <>
      <form className="admin-add-form" onSubmit={create} noValidate>
        <label>Название<input name="name" aria-required="true" placeholder="Например, сироп лаванда" /></label>
        <label>Категория<select name="category" defaultValue="Кофе">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Аромат<input name="aroma" aria-required="true" placeholder="ваниль, цветы, орехи" /></label>
        <label>Стоимость, ₽<input name="cost" type="number" min="0" defaultValue="120" /></label>
        <label>Калорийность<input name="calories" type="number" min="0" max="5" defaultValue="1" /></label>
        <label>Сливочность<input name="creaminess" type="number" min="0" max="5" defaultValue="1" /></label>
        <label>Сладость<input name="sweetness" type="number" min="0" max="5" defaultValue="1" /></label>
        <label>Горечь<input name="bitterness" type="number" min="0" max="5" defaultValue="1" /></label>
        <label>Соль<input name="salt" type="number" min="0" max="5" defaultValue="1" /></label>
        <label className="check-row"><input name="available" type="checkbox" defaultChecked /> Есть в наличии</label>
        {formError ? <p className="form-message admin-form-message" role="alert">{formError}</p> : null}
        <button className="primary-button" type="submit">Добавить ингредиент</button>
      </form>

      <div className="catalog-toolbar admin-toolbar">
        <label>Поиск<input value={query} onChange={(event) => resetPage(() => setQuery(event.target.value))} placeholder="кофе, сироп, корица..." /></label>
        <label>Категория<select value={category} onChange={(event) => resetPage(() => setCategory(event.target.value))}><option value="all">Все</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>

      <div className="admin-edit-list">
        {pageItems.map((ingredient) => (
          <form className={`admin-edit-row ${ingredient.hidden ? "hidden-ingredient" : ""}`} onSubmit={(event) => save(event, ingredient.id)} key={ingredient.id}>
            <label>Название<input name="name" aria-required="true" defaultValue={ingredient.name} /></label>
            <label>Категория<select name="category" defaultValue={ingredient.category}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Аромат<input name="aroma" aria-required="true" defaultValue={ingredient.aroma} /></label>
            <label>Цена<input name="cost" type="number" min="0" defaultValue={ingredient.cost} /></label>
            <label>Ккал<input name="calories" type="number" min="0" max="5" defaultValue={ingredient.calories} /></label>
            <label>Слив.<input name="creaminess" type="number" min="0" max="5" defaultValue={ingredient.creaminess} /></label>
            <label>Слад.<input name="sweetness" type="number" min="0" max="5" defaultValue={ingredient.sweetness} /></label>
            <label>Горечь<input name="bitterness" type="number" min="0" max="5" defaultValue={ingredient.bitterness} /></label>
            <label>Соль<input name="salt" type="number" min="0" max="5" defaultValue={ingredient.salt} /></label>
            <label className="check-row"><input name="available" type="checkbox" defaultChecked={ingredient.available} /> Есть</label>
            <input name="hidden" type="checkbox" defaultChecked={ingredient.hidden} hidden readOnly />
            <div className="admin-row-actions">
              <button className="icon-action" type="submit" title="Сохранить" aria-label="Сохранить">{icon.save}</button>
              <button className="icon-action" type="button" onClick={() => toggleHidden(ingredient)} title={ingredient.hidden ? "Показать" : "Скрыть"} aria-label={ingredient.hidden ? "Показать" : "Скрыть"}>{ingredient.hidden ? icon.show : icon.hide}</button>
              <button className="icon-action" type="button" onClick={() => remove(ingredient.id)} title="Удалить" aria-label="Удалить">{icon.delete}</button>
            </div>
          </form>
        ))}
      </div>

      {filtered.length > pageSize ? (
        <div className="catalog-pagination">
          <span>{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} из {filtered.length}</span>
          <div className="pagination-buttons">
            <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Назад</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
              <button type="button" key={item} className={item === currentPage ? "active" : ""} onClick={() => setPage(item)}>{item}</button>
            ))}
            <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Вперед</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
