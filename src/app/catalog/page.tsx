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
            <div className="section-kicker">ингредиенты</div>
            <h1>Ингредиенты</h1>
            {!user ? <p id="registrationHint">Если хотите менять ингредиенты, добавлять свои продукты, управлять наличием и ценой, зарегистрируйтесь.</p> : null}
          </div>
        </section>
        <CatalogClient initialIngredients={ingredients} canEdit={Boolean(user)} />
      </main>
    </div>
  );
}
