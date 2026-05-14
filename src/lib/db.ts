import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const databasePath = resolve(process.env.DATABASE_PATH ?? "../data/coffee.sqlite");
mkdirSync(dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate() {
  db.exec(`
    create table if not exists ingredients (
      id text primary key,
      name text not null,
      category text not null,
      calories integer not null check (calories between 0 and 5),
      creaminess integer not null check (creaminess between 0 and 5),
      sweetness integer not null check (sweetness between 0 and 5),
      bitterness integer not null check (bitterness between 0 and 5),
      salt integer not null default 1 check (salt between 0 and 5),
      aroma text not null,
      cost integer not null default 0,
      available integer not null default 1,
      hidden integer not null default 0,
      is_default integer not null default 1,
      owner_user_id text,
      created_at text not null default current_timestamp,
      updated_at text not null default current_timestamp
    );

    create table if not exists recipes (
      id text primary key,
      user_id text,
      title text not null,
      badge text not null,
      ingredients_json text not null,
      steps_json text not null,
      metrics_json text not null,
      prepared integer not null default 0,
      rating integer check (rating is null or rating between 1 and 5),
      in_menu integer not null default 1,
      created_at text not null default current_timestamp,
      foreign key (user_id) references users(id)
    );

    create table if not exists users (
      id text primary key,
      email text not null unique,
      name text not null,
      role text not null check (role in ('user', 'admin')),
      password_hash text not null,
      created_at text not null default current_timestamp
    );

    create table if not exists generation_events (
      id text primary key,
      device_id text,
      ip_address text,
      payload_json text not null,
      created_at text not null default current_timestamp
    );
  `);

  const recipeColumns = db.prepare("pragma table_info(recipes)").all() as Array<{ name: string }>;
  if (!recipeColumns.some((column) => column.name === "user_id")) {
    db.exec("alter table recipes add column user_id text");
  }

  const ingredientColumns = db.prepare("pragma table_info(ingredients)").all() as Array<{ name: string }>;
  if (!ingredientColumns.some((column) => column.name === "hidden")) {
    db.exec("alter table ingredients add column hidden integer not null default 0");
  }
  if (!ingredientColumns.some((column) => column.name === "is_default")) {
    db.exec("alter table ingredients add column is_default integer not null default 1");
  }
  if (!ingredientColumns.some((column) => column.name === "owner_user_id")) {
    db.exec("alter table ingredients add column owner_user_id text");
  }
  if (!ingredientColumns.some((column) => column.name === "salt")) {
    db.exec("alter table ingredients add column salt integer not null default 1");
  }

  const ingredientSchema = db.prepare("select sql from sqlite_master where type = 'table' and name = 'ingredients'").get() as { sql?: string } | undefined;
  if (ingredientSchema?.sql?.includes("between 1 and 5")) {
    db.pragma("foreign_keys = OFF");
    db.exec(`
      create table ingredients_next (
        id text primary key,
        name text not null,
        category text not null,
        calories integer not null check (calories between 0 and 5),
        creaminess integer not null check (creaminess between 0 and 5),
        sweetness integer not null check (sweetness between 0 and 5),
        bitterness integer not null check (bitterness between 0 and 5),
        salt integer not null default 1 check (salt between 0 and 5),
        aroma text not null,
        cost integer not null default 0,
        available integer not null default 1,
        hidden integer not null default 0,
        is_default integer not null default 1,
        owner_user_id text,
        created_at text not null default current_timestamp,
        updated_at text not null default current_timestamp
      );

      insert into ingredients_next
        (id, name, category, calories, creaminess, sweetness, bitterness, salt, aroma, cost, available, hidden, is_default, owner_user_id, created_at, updated_at)
      select
        id, name, category, calories, creaminess, sweetness, bitterness, coalesce(salt, 1), aroma, cost, available, hidden, is_default, owner_user_id, created_at, updated_at
      from ingredients;

      drop table ingredients;
      alter table ingredients_next rename to ingredients;
    `);
    db.pragma("foreign_keys = ON");
  }

  db.exec(`
    create table if not exists user_ingredient_settings (
      user_id text not null,
      ingredient_id text not null,
      calories integer,
      cost integer,
      available integer,
      hidden integer not null default 0,
      updated_at text not null default current_timestamp,
      primary key (user_id, ingredient_id),
      foreign key (user_id) references users(id),
      foreign key (ingredient_id) references ingredients(id)
    );
  `);
}

migrate();
