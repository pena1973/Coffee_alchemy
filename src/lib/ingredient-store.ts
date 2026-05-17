import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { Ingredient, TasteScale } from "@/types";

type IngredientRow = {
  id: string;
  name: string;
  category: string;
  calories: TasteScale;
  creaminess: TasteScale;
  sweetness: TasteScale;
  bitterness: TasteScale;
  salt: TasteScale;
  aroma: string;
  cost: number;
  available: 0 | 1;
  hidden: 0 | 1;
  is_default: 0 | 1;
  owner_user_id: string | null;
};

type IngredientInput = Partial<Ingredient> & Pick<Ingredient, "name" | "category" | "aroma">;

function rowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    calories: row.calories,
    creaminess: row.creaminess,
    sweetness: row.sweetness,
    bitterness: row.bitterness,
    salt: row.salt,
    aroma: row.aroma,
    cost: row.cost,
    available: Boolean(row.available),
    hidden: Boolean(row.hidden),
    isDefault: Boolean(row.is_default),
    ownerUserId: row.owner_user_id,
  };
}

export function listIngredients(options: { includeHidden?: boolean } = {}) {
  const rows = options.includeHidden
    ? (db.prepare("select * from ingredients order by category, name").all() as IngredientRow[])
    : (db.prepare("select * from ingredients where hidden = 0 order by category, name").all() as IngredientRow[]);
  return rows.map(rowToIngredient);
}

export function getIngredient(id: string) {
  const row = db.prepare("select * from ingredients where id = ?").get(id) as IngredientRow | undefined;
  return row ? rowToIngredient(row) : null;
}

export function listCatalogIngredients(userId?: string) {
  if (!userId) return listIngredients({ includeHidden: false });

  const rows = db
    .prepare(
      `select
        ingredients.id,
        ingredients.name,
        ingredients.category,
        coalesce(user_ingredient_settings.calories, ingredients.calories) as calories,
        ingredients.creaminess,
        ingredients.sweetness,
        ingredients.bitterness,
        ingredients.salt,
        ingredients.aroma,
        coalesce(user_ingredient_settings.cost, ingredients.cost) as cost,
        coalesce(user_ingredient_settings.available, ingredients.available) as available,
        case
          when ingredients.owner_user_id = @userId then ingredients.hidden
          else coalesce(user_ingredient_settings.hidden, 0)
        end as hidden,
        ingredients.is_default,
        ingredients.owner_user_id
      from ingredients
      left join user_ingredient_settings
        on user_ingredient_settings.ingredient_id = ingredients.id
       and user_ingredient_settings.user_id = @userId
      where (ingredients.hidden = 0 or ingredients.owner_user_id = @userId)
        and (ingredients.owner_user_id is null or ingredients.owner_user_id = @userId)
      order by
        case when ingredients.owner_user_id = @userId then 0 else 1 end,
        ingredients.category,
        ingredients.name`,
    )
    .all({ userId }) as IngredientRow[];

  return rows.map(rowToIngredient);
}

export function saveIngredient(input: IngredientInput) {
  const id = input.id ?? randomUUID();
  db.prepare(
    `insert into ingredients
      (id, name, category, calories, creaminess, sweetness, bitterness, salt, aroma, cost, available, hidden, is_default, owner_user_id)
     values
      (@id, @name, @category, @calories, @creaminess, @sweetness, @bitterness, @salt, @aroma, @cost, @available, @hidden, @isDefault, @ownerUserId)
     on conflict(id) do update set
      name = excluded.name,
      category = excluded.category,
      calories = excluded.calories,
      creaminess = excluded.creaminess,
      sweetness = excluded.sweetness,
      bitterness = excluded.bitterness,
      salt = excluded.salt,
      aroma = excluded.aroma,
      cost = excluded.cost,
      available = excluded.available,
      hidden = excluded.hidden,
      is_default = excluded.is_default,
      owner_user_id = excluded.owner_user_id,
      updated_at = current_timestamp`,
  ).run({
    id,
    name: input.name,
    category: input.category,
    calories: input.calories ?? 1,
    creaminess: input.creaminess ?? 1,
    sweetness: input.sweetness ?? 1,
    bitterness: input.bitterness ?? 1,
    salt: input.salt ?? 1,
    aroma: input.aroma,
    cost: input.cost ?? 0,
    available: input.available ? 1 : 0,
    hidden: input.hidden ? 1 : 0,
    isDefault: input.isDefault === false ? 0 : 1,
    ownerUserId: input.ownerUserId ?? null,
  });
  return getIngredient(id)!;
}

export function saveUserIngredientSettings(userId: string, ingredientId: string, patch: Partial<Pick<Ingredient, "calories" | "cost" | "available" | "hidden">>) {
  const existing = db.prepare("select * from user_ingredient_settings where user_id = ? and ingredient_id = ?").get(userId, ingredientId) as
    | { calories: number | null; cost: number | null; available: 0 | 1 | null; hidden: 0 | 1 }
    | undefined;

  db.prepare(
    `insert into user_ingredient_settings (user_id, ingredient_id, calories, cost, available, hidden)
     values (@userId, @ingredientId, @calories, @cost, @available, @hidden)
     on conflict(user_id, ingredient_id) do update set
      calories = excluded.calories,
      cost = excluded.cost,
      available = excluded.available,
      hidden = excluded.hidden,
      updated_at = current_timestamp`,
  ).run({
    userId,
    ingredientId,
    calories: patch.calories ?? existing?.calories ?? null,
    cost: patch.cost ?? existing?.cost ?? null,
    available: patch.available === undefined ? existing?.available ?? null : patch.available ? 1 : 0,
    hidden: patch.hidden === undefined ? existing?.hidden ?? 0 : patch.hidden ? 1 : 0,
  });
}

export function deleteIngredient(id: string) {
  db.prepare("delete from ingredients where id = ?").run(id);
}

export function seedIngredients() {
  return;
}
