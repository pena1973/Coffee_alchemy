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
        <Link href="/catalog">Ингредиенты</Link>
        <Link href="/menu">Мое меню</Link>
        {user?.role === "admin" ? <Link href="/admin">Админка</Link> : null}
        {user ? (
          <form action={logoutAction} className="nav-auth-block">
            <span>{user.email}</span>
            <button className="nav-button" type="submit">
              Выход
            </button>
          </form>
        ) : (
          <div className="nav-auth-block">
            <span>Гость</span>
            <Link href="/login">Вход</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
