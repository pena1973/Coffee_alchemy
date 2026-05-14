import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import type { User, UserRole } from "@/types";

const sessionCookie = "coffee_session";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
};

export function hashPassword(password: string) {
  return createHash("sha256").update(`coffee:${password}`).digest("hex");
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function seedUsers() {
  const count = db.prepare("select count(*) as count from users").get() as { count: number };
  if (count.count > 0) return;
  const insert = db.prepare("insert into users (id, email, name, role, password_hash) values (@id, @email, @name, @role, @passwordHash)");
  insert.run({
    id: "admin-demo",
    email: "admin@coffee.local",
    name: "Admin",
    role: "admin",
    passwordHash: hashPassword("admin123"),
  });
  insert.run({
    id: "user-demo",
    email: "demo@coffee.local",
    name: "Demo Creator",
    role: "user",
    passwordHash: hashPassword("coffee123"),
  });
}

seedUsers();

export function authenticate(email: string, password: string) {
  const row = db.prepare("select id, email, name, role, created_at from users where email = ? and password_hash = ?").get(email, hashPassword(password)) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export async function setSession(user: User) {
  const jar = await cookies();
  jar.set(sessionCookie, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(sessionCookie);
}

export async function currentUser() {
  const jar = await cookies();
  const id = jar.get(sessionCookie)?.value;
  if (!id) return null;
  const row = db.prepare("select id, email, name, role, created_at from users where id = ?").get(id) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export function listUsersWithRecipes() {
  const rows = db
    .prepare(
      `select
        users.id,
        users.email,
        users.name,
        users.role,
        users.created_at,
        count(recipes.id) as recipe_count,
        group_concat(recipes.title, '|||') as recipe_titles
      from users
      left join recipes on recipes.user_id = users.id
      group by users.id
      order by users.created_at desc`,
    )
    .all() as Array<UserRow & { recipe_count: number; recipe_titles: string | null }>;

  return rows.map((row) => ({
    ...rowToUser(row),
    recipeCount: row.recipe_count,
    recipeTitles: row.recipe_titles ? row.recipe_titles.split("|||") : [],
  }));
}
