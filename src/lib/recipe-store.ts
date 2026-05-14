import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { Recipe } from "@/types";

type RecipeRow = {
  id: string;
  user_id: string;
  title: string;
  badge: string;
  ingredients_json: string;
  steps_json: string;
  metrics_json: string;
  prepared: 0 | 1;
  rating: number | null;
  in_menu: 0 | 1;
  created_at: string;
};

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    badge: row.badge,
    ingredients: JSON.parse(row.ingredients_json),
    steps: JSON.parse(row.steps_json),
    metrics: JSON.parse(row.metrics_json),
    prepared: Boolean(row.prepared),
    rating: row.rating,
    inMenu: Boolean(row.in_menu),
    createdAt: row.created_at,
  };
}

export function listRecipes(userId?: string): Recipe[] {
  const rows = userId
    ? (db.prepare("select * from recipes where user_id = ? order by created_at desc").all(userId) as RecipeRow[])
    : (db.prepare("select * from recipes order by created_at desc").all() as RecipeRow[]);
  return rows.map(rowToRecipe);
}

export function createRecipe(input: Omit<Recipe, "id" | "createdAt">): Recipe {
  const id = randomUUID();
  db.prepare(
    `insert into recipes
      (id, user_id, title, badge, ingredients_json, steps_json, metrics_json, prepared, rating, in_menu)
     values
      (@id, @userId, @title, @badge, @ingredients, @steps, @metrics, @prepared, @rating, @inMenu)`,
  ).run({
    id,
    userId: input.userId,
    title: input.title,
    badge: input.badge,
    ingredients: JSON.stringify(input.ingredients),
    steps: JSON.stringify(input.steps),
    metrics: JSON.stringify(input.metrics),
    prepared: input.prepared ? 1 : 0,
    rating: input.rating,
    inMenu: input.inMenu ? 1 : 0,
  });
  return listRecipes(input.userId).find((recipe) => recipe.id === id)!;
}

export function updateRecipe(id: string, userId: string, patch: Partial<Pick<Recipe, "prepared" | "rating" | "inMenu">>) {
  const existing = listRecipes(userId).find((recipe) => recipe.id === id);
  if (!existing) return null;
  db.prepare("update recipes set prepared = @prepared, rating = @rating, in_menu = @inMenu where id = @id and user_id = @userId").run({
    id,
    userId,
    prepared: (patch.prepared ?? existing.prepared) ? 1 : 0,
    rating: patch.rating === undefined ? existing.rating : patch.rating,
    inMenu: (patch.inMenu ?? existing.inMenu) ? 1 : 0,
  });
  return listRecipes(userId).find((recipe) => recipe.id === id) ?? null;
}

export function deleteRecipe(id: string, userId: string) {
  db.prepare("delete from recipes where id = ? and user_id = ?").run(id, userId);
}
