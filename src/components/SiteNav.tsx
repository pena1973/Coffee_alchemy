import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSession, currentUser } from "@/lib/auth";

async function logoutAction() {
  "use server";
  await clearSession();
  redirect("/");
}

export async function SiteNav() {
  const user = await currentUser();

  return (
    <header className="topbar">
      <Link className="brand" href="/">
        Coffee Alchemy
      </Link>
      <nav className="topnav">
        <Link href="/">Генератор</Link>
        <Link href="/catalog">Ингридиенты</Link>
        <Link href="/menu">Мое меню</Link>
        {user?.role === "admin" ? <Link href="/admin">Админка</Link> : null}
        {user ? (
          <form action={logoutAction}>
            <button className="nav-button" type="submit">Выход</button>
          </form>
        ) : (
          <Link href="/login">Вход</Link>
        )}
      </nav>
    </header>
  );
}
