import { AdminIngredientsClient } from "@/components/AdminIngredientsClient";
import { listIngredients } from "@/lib/ingredient-store";

export const dynamic = "force-dynamic";

export default function AdminIngredientsPage() {
  const ingredients = listIngredients({ includeHidden: true });

  return (
    <section className="admin-panel">
      <div className="section-kicker">ингредиенты</div>
      <h1>Ингредиенты сайта</h1>
      <AdminIngredientsClient initialIngredients={ingredients} />
    </section>
  );
}
