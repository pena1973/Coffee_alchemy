import { AdminUsersTable } from "@/components/AdminUsersTable";
import { listUsersWithRecipes } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const users = listUsersWithRecipes();

  return (
    <section className="admin-panel">
      <div className="section-kicker">пользователи</div>
      <h1>Зарегистрированные пользователи</h1>
      <AdminUsersTable users={users} />
    </section>
  );
}
