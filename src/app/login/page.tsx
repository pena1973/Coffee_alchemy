import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { authenticate, currentUser, setSession } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";
  const user = authenticate(String(formData.get("email") ?? "").toLowerCase(), String(formData.get("password") ?? ""));
  if (!user) redirect("/login?error=1");
  await setSession(user);
  redirect(user.role === "admin" ? "/admin" : "/menu");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await currentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/menu");
  const params = await searchParams;

  return (
    <div className="shell">
      <SiteNav />
      <main className="login-page">
        <section className="login-panel">
          <div className="section-kicker">вход и регистрация</div>
          <h1>Войти</h1>
          <p>Используйте демо-доступ для проверки или войдите как администратор.</p>
          <div className="demo-access">
            <span>Пользователь: demo@coffee.local / coffee123</span>
            <span>Админ: admin@coffee.local / admin123</span>
          </div>
          {params.error ? <p className="errorText">Неверный email или пароль.</p> : null}
          <form className="registration-form login-form" action={loginAction}>
            <label>
              Email
              <input name="email" type="email" required placeholder="demo@coffee.local" />
            </label>
            <label>
              Пароль
              <input name="password" type="password" required placeholder="coffee123" />
            </label>
            <button className="primary-button" type="submit">
              Войти
            </button>
          </form>
          <Link className="login-back" href="/">
            Вернуться к генератору
          </Link>
        </section>
      </main>
    </div>
  );
}
