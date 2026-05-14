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
          <div className="section-kicker">личная подборка</div>
          <h1>Мое меню</h1>
          {!user ? <p><Link href="/login">Войдите</Link>, чтобы видеть сохраненные рецепты.</p> : <p>Сохраняйте рецепты, отмечайте приготовление и включайте лучшие напитки в меню.</p>}
        </section>
        {user ? <MenuClient initialRecipes={recipes} /> : null}
      </main>
    </div>
  );
}
