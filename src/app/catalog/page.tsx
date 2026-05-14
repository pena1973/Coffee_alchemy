import { CatalogClient } from "@/components/CatalogClient";
import { SiteNav } from "@/components/SiteNav";
import { currentUser } from "@/lib/auth";
import { listCatalogIngredients } from "@/lib/ingredient-store";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const user = await currentUser();
  const ingredients = listCatalogIngredients(user?.id);

  return (
    <div className="shell">
      <SiteNav />
      <main className="catalog-page">
        <section className="catalog-hero">
          <div>
            <div className="section-kicker">ингридиенты</div>
            <h1>Ингридиенты</h1>
            {!user ? <p id="registrationHint">Редактировать и добавлять свои ингредиенты можно только после регистрации.</p> : null}
          </div>
          <aside className="auth-card compact-auth" id="authCard">
            <span>Режим</span>
            <strong>{user ? user.name : "Гость"}</strong>
            <p>
              {user
                ? "Можно добавлять свои ингредиенты, редактировать их, настраивать наличие, цену и скрытие."
                : "Можно смотреть ингредиенты. Добавление, стоимость и наличие доступны после регистрации."}
            </p>
          </aside>
        </section>
        <CatalogClient initialIngredients={ingredients} canEdit={Boolean(user)} />
      </main>
    </div>
  );
}
