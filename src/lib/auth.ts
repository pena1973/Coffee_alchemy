import { cookies } from "next/headers";
import { createHash, randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { User, UserRole } from "@/types";

const sessionCookie = "coffee_session";
const defaultAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@coffee.local";
const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

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
    email: defaultAdminEmail,
    name: "Admin",
    role: "admin",
    passwordHash: hashPassword(defaultAdminPassword),
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
  const normalizedEmail = email.trim().toLowerCase();
  const row = db.prepare("select id, email, name, role, created_at from users where email = ? and password_hash = ?").get(normalizedEmail, hashPassword(password)) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export function registerUser(input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password.trim();

  if (!name || !email || !password) {
    throw new Error("Заполните имя, email и пароль.");
  }
  if (!email.includes("@")) {
    throw new Error("Введите корректный email.");
  }
  if (password.length < 6) {
    throw new Error("Пароль должен быть не короче 6 символов.");
  }

  const id = randomUUID();
  try {
    db.prepare("insert into users (id, email, name, role, password_hash) values (@id, @email, @name, @role, @passwordHash)").run({
      id,
      email,
      name,
      role: "user",
      passwordHash: hashPassword(password),
    });
  } catch (error) {
    const sqliteError = error as { code?: string };
    if (sqliteError.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("Пользователь с таким email уже зарегистрирован.");
    }
    throw error;
  }

  const row = db.prepare("select id, email, name, role, created_at from users where id = ?").get(id) as UserRow;
  return rowToUser(row);
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

export function deleteUserWithData(userId: string, currentAdminId: string) {
  if (userId === currentAdminId) {
    throw new Error("Нельзя удалить собственную учетную запись.");
  }

  const user = db.prepare("select id, role from users where id = ?").get(userId) as { id: string; role: UserRole } | undefined;
  if (!user) return;

  if (user.role === "admin") {
    const adminCount = db.prepare("select count(*) as count from users where role = 'admin'").get() as { count: number };
    if (adminCount.count <= 1) {
      throw new Error("Нельзя удалить последнего администратора.");
    }
  }

  const remove = db.transaction(() => {
    db.prepare("delete from recipes where user_id = ?").run(userId);
    db.prepare("delete from user_ingredient_settings where user_id = ?").run(userId);
    db.prepare("delete from user_ingredient_settings where ingredient_id in (select id from ingredients where owner_user_id = ?)").run(userId);
    db.prepare("delete from ingredients where owner_user_id = ?").run(userId);
    db.prepare("delete from users where id = ?").run(userId);
  });

  remove();
}
