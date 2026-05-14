import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminMenu } from "@/components/AdminMenu";
import { SiteNav } from "@/components/SiteNav";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");

  if (user.role !== "admin") {
    return (
      <div className="shell">
        <SiteNav />
        <main className="admin-page">
          <section className="admin-panel">
            <div className="section-kicker">нет доступа</div>
            <h1>Админка</h1>
            <p>Эта страница доступна только администратору.</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="shell">
      <SiteNav />
      <main className="admin-page">
        <section className="admin-panel admin-menu-panel">
          <div>
            <div className="section-kicker">админка</div>
            <h1>Управление сайтом</h1>
          </div>
          <AdminMenu />
        </section>
        {children}
      </main>
    </div>
  );
}
