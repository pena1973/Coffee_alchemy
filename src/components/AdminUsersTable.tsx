"use client";

import { useState } from "react";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  recipeTitles: string[];
};

const trashIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 15h10l1-15" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [items, setItems] = useState(users);
  const [error, setError] = useState("");

  async function remove(user: AdminUserRow) {
    const confirmed = window.confirm(`Удалить пользователя ${user.email} вместе со всеми его рецептами, настройками и ингредиентами?`);
    if (!confirmed) return;

    setError("");
    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error ?? "Не удалось удалить пользователя.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== user.id));
  }

  return (
    <div className="admin-table-wrap">
      {error ? <p className="form-message admin-users-message" role="alert">{error}</p> : null}
      <table className="menu-table admin-table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Роль</th>
            <th>Сохраненные рецепты</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                <span>{item.email}</span>
              </td>
              <td>{item.role}</td>
              <td>{item.recipeTitles.length ? item.recipeTitles.join(", ") : "нет рецептов"}</td>
              <td>
                <div className="admin-row-actions">
                  <button className="icon-action danger-button" type="button" onClick={() => remove(item)} title="Удалить пользователя" aria-label="Удалить пользователя">
                    {trashIcon}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {!items.length ? (
            <tr>
              <td colSpan={4}>Пользователей пока нет.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
