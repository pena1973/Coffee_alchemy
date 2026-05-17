import Link from "next/link";
import { MenuClient } from "@/components/MenuClient";
import { SiteNav } from "@/components/SiteNav";
import { currentUser } from "@/lib/auth";
import { listRecipes } from "@/lib/recipe-store";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const user = await currentUser();
  const recipes = user ? listRecipes(user.id) : [];

  return (
    <div className="shell">
      <SiteNav />
      <main className="menu-page">
        <section className="menu-hero">
          <div>
            <div className="section-kicker">личная подборка</div>
            <h1>Мое меню</h1>
          </div>
          {user ? <p>Сохраняйте рецепты, отмечайте приготовление и включайте лучшие напитки в меню.</p> : null}
        </section>
        {user ? (
          <MenuClient initialRecipes={recipes} />
        ) : (
          <section className="menu-empty guest-menu-empty">
            <div className="section-kicker">доступ после входа</div>
            <h2>Войдите, чтобы видеть сохраненные рецепты</h2>
            <Link className="primary-link" href="/login">
              Войти
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
