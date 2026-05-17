"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CustomSelect } from "@/components/CustomSelect";
import type { Ingredient } from "@/types";

type CatalogClientProps = {
  initialIngredients: Ingredient[];
  canEdit: boolean;
};

const categories = ["Кофе", "Молочная часть", "Сиропы", "Сладость и баланс", "Специи", "Финиш"];
const emptyIngredient = { name: "", category: "Кофе", calories: 3, creaminess: 2, sweetness: 3, bitterness: 1, salt: 1, aroma: "", cost: 120, available: true };

const pageSize = 10;

function stars(value: number) {
  return `${"●".repeat(value)}${"○".repeat(5 - value)}`;
}

const icons = {
  edit: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>,
  delete: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 15h10l1-15" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>,
  hide: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 10.6A2 2 0 0 0 13.4 13.4" /><path d="M9.9 4.2A9.9 9.9 0 0 1 12 4c5 0 8.6 4 10 8a14 14 0 0 1-2.1 3.8" /><path d="M6.6 6.6A13.6 13.6 0 0 0 2 12c1.4 4 5 8 10 8a9.9 9.9 0 0 0 5.4-1.6" /></svg>,
  show: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
};

export function CatalogClient({ initialIngredients, canEdit }: CatalogClientProps) {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [showHidden, setShowHidden] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");

  useEffect(() => setIngredients(initialIngredients), [initialIngredients]);
  useEffect(() => setPage(1), [query, category, showHidden]);

  const filterCategories = useMemo(() => Array.from(new Set(ingredients.map((item) => item.category))), [ingredients]);
  const visible = ingredients.filter((item) => {
    const matchesQuery = [item.name, item.category, item.aroma].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || item.category === category;
    const matchesHidden = showHidden || !item.hidden;
    return matchesQuery && matchesCategory && matchesHidden;
  });
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function refresh() {
    const response = await fetch("/api/ingredients", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setIngredients(data.ingredients);
    }
  }

  async function saveIngredient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;
    const target = event.currentTarget;
    const form = new FormData(target);
    const payload = {
      name: String(form.get("name")),
      category: String(form.get("category")),
      calories: Number(form.get("calories")),
      creaminess: Number(form.get("creaminess")),
      sweetness: Number(form.get("sweetness")),
      bitterness: Number(form.get("bitterness")),
      salt: Number(form.get("salt")),
      aroma: String(form.get("aroma")),
      cost: Number(form.get("cost")),
      available: form.get("available") === "on",
    };
    if (!payload.name.trim() || !payload.aroma.trim()) {
      setFormError("Заполни название и аромат ингредиента.");
      target.querySelector<HTMLInputElement>("input:invalid")?.focus();
      return;
    }
    setFormError("");
    const url = editing ? `/api/ingredients/${editing.id}` : "/api/ingredients";
    const response = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) {
      target.reset();
      setEditing(null);
      await refresh();
    }
  }

  async function patchPersonal(item: Ingredient, patch: Partial<Pick<Ingredient, "calories" | "cost" | "available" | "hidden">>) {
    await fetch(`/api/ingredients/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...patch }) });
    await refresh();
  }

  async function deleteOwn(item: Ingredient) {
    if (item.isDefault || !item.ownerUserId) return;
    await fetch(`/api/ingredients/${item.id}`, { method: "DELETE" });
    await refresh();
  }

  const formKey = editing?.id ?? "new";
  const categoryOptions = categories.map((item) => ({ value: item, label: item }));
  const filterCategoryOptions = [{ value: "all", label: "Все" }, ...filterCategories.map((item) => ({ value: item, label: item }))];

  return (
    <section className={`editor-layout ${canEdit ? "" : "guest"}`}>
      {canEdit ? (
        <form className="ingredient-form" onSubmit={saveIngredient} key={formKey} noValidate>
          <div className="section-kicker">новый ингредиент</div>
          <h2>{editing ? "Редактировать" : "Добавить ингредиент"}</h2>
          <label>Название<input name="name" aria-required="true" placeholder="Например, сироп лаванда" defaultValue={editing?.name ?? emptyIngredient.name} /></label>
          <label>Категория<CustomSelect name="category" options={categoryOptions} defaultValue={editing?.category ?? emptyIngredient.category} /></label>
          <div className="slider-grid">
            <label className="control">Калорийность <input type="range" name="calories" min="0" max="5" defaultValue={editing?.calories ?? emptyIngredient.calories} /></label>
            <label className="control">Сливочность <input type="range" name="creaminess" min="0" max="5" defaultValue={editing?.creaminess ?? emptyIngredient.creaminess} /></label>
            <label className="control">Сладость <input type="range" name="sweetness" min="0" max="5" defaultValue={editing?.sweetness ?? emptyIngredient.sweetness} /></label>
            <label className="control">Горечь <input type="range" name="bitterness" min="0" max="5" defaultValue={editing?.bitterness ?? emptyIngredient.bitterness} /></label>
            <label className="control">Соль <input type="range" name="salt" min="0" max="5" defaultValue={editing?.salt ?? emptyIngredient.salt} /></label>
          </div>
          <label>Аромат<input name="aroma" aria-required="true" placeholder="ваниль, цветы, орехи" defaultValue={editing?.aroma ?? emptyIngredient.aroma} /></label>
          <label>Стоимость, ₽<input name="cost" type="number" min="0" step="1" defaultValue={editing?.cost ?? emptyIngredient.cost} /></label>
          <label className="check-row"><input name="available" type="checkbox" defaultChecked={editing?.available ?? emptyIngredient.available} /> Есть в наличии</label>
          {formError ? <p className="form-message" role="alert">{formError}</p> : null}
          <button className="primary-button" type="submit">{editing ? "Сохранить" : "Добавить"}</button>
        </form>
      ) : null}
      <section className="catalog-workspace">
        <div className="catalog-toolbar">
          <label>Поиск<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="кофе, сироп, корица..." /></label>
          <label>Категория<CustomSelect options={filterCategoryOptions} value={category} onValueChange={setCategory} /></label>
          {canEdit ? <label className="show-hidden-control"><input type="checkbox" checked={showHidden} onChange={(event) => setShowHidden(event.target.checked)} /> Показать скрытые</label> : null}
        </div>
        <div className="ingredient-table">
          {pageItems.map((item) => {
            const isOwn = Boolean(item.ownerUserId) && !item.isDefault;
            return (
              <article className={`ingredient-row ${canEdit ? "" : "public"} ${item.hidden ? "hidden-ingredient" : ""}`} key={item.id}>
                <div><strong>{item.name}</strong><span>{item.category}</span></div>
                <div className="ingredient-values">
                  <span>Ккал {item.calories}</span>
                  <span>Слив. <span className="score">{stars(item.creaminess)}</span></span>
                  <span>Соль <span className="score">{stars(item.salt)}</span></span>
                  <span>Слад. <span className="score">{stars(item.sweetness)}</span></span>
                  <span>Горечь <span className="score">{stars(item.bitterness)}</span></span>
                  <span className="aroma-value">{item.aroma}</span>
                </div>
                {canEdit ? (
                  <>
                    <div className="personal-settings">
                      <label>Ккал <input type="number" min="0" max="5" defaultValue={item.calories} onBlur={(event) => patchPersonal(item, { calories: Number(event.target.value) as Ingredient["calories"] })} /></label>
                      <label>Цена <input type="number" min="0" defaultValue={item.cost} onBlur={(event) => patchPersonal(item, { cost: Number(event.target.value) })} /></label>
                    </div>
                    <label className="availability-toggle"><input type="checkbox" checked={item.available} onChange={(event) => patchPersonal(item, { available: event.target.checked })} /> В наличии</label>
                    <div className="row-actions">
                      {isOwn ? <button className="icon-action" type="button" onClick={() => setEditing(item)} title="Редактировать" aria-label="Редактировать">{icons.edit}</button> : null}
                      <button className="icon-action" type="button" onClick={() => patchPersonal(item, { hidden: !item.hidden, available: item.hidden ? item.available : false })} title={item.hidden ? "Показать" : "Скрыть"} aria-label={item.hidden ? "Показать" : "Скрыть"}>{item.hidden ? icons.show : icons.hide}</button>
                      {isOwn ? <button className="icon-action" type="button" onClick={() => deleteOwn(item)} title="Удалить" aria-label="Удалить">{icons.delete}</button> : null}
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
        {visible.length > pageSize ? (
          <div className="catalog-pagination">
            <span>{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, visible.length)} из {visible.length}</span>
            <div className="pagination-buttons">
              <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Назад</button>
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
                <button type="button" key={item} className={item === currentPage ? "active" : ""} onClick={() => setPage(item)}>{item}</button>
              ))}
              <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Вперед</button>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  );
}
