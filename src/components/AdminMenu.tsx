"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/ingredients", label: "Ингредиенты" },
  { href: "/admin/users", label: "Пользователи" },
];

export function AdminMenu() {
  const pathname = usePathname();

  return (
    <nav className="admin-menu" aria-label="Разделы админки">
      {items.map((item) => (
        <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
