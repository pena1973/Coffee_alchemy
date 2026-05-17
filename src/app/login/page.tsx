import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { authenticate, currentUser, registerUser, setSession } from "@/lib/auth";

type LoginSearchParams = {
  error?: string;
  mode?: string;
  next?: string;
};

function safeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

function authErrorUrl(mode: "login" | "register", message: string, next?: string) {
  const params = new URLSearchParams({ mode, error: message });
  if (next) params.set("next", next);
  return `/login?${params.toString()}`;
}

async function loginAction(formData: FormData) {
  "use server";
  const next = safeNext(formData.get("next"));
  const user = authenticate(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if (!user) redirect(authErrorUrl("login", "Неверный email или пароль.", next));
  await setSession(user);
  redirect(next || (user.role === "admin" ? "/admin" : "/menu"));
}

async function registerAction(formData: FormData) {
  "use server";
  const next = safeNext(formData.get("next"));
  try {
    const user = registerUser({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    await setSession(user);
  } catch (error) {
    redirect(authErrorUrl("register", error instanceof Error ? error.message : "Не удалось зарегистрироваться.", next));
  }

  redirect(next || "/menu");
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<LoginSearchParams> }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const user = await currentUser();
  if (user) redirect(next || (user.role === "admin" ? "/admin" : "/menu"));
  const mode = params.mode === "register" ? "register" : "login";
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const registerHref = next ? `/login?mode=register&next=${encodeURIComponent(next)}` : "/login?mode=register";

  return (
    <div className="shell">
      <SiteNav />
      <main className="login-page">
        <section className="login-panel">
          <div className="section-kicker">Вход и регистрация</div>
          <h1>{mode === "register" ? "Регистрация" : "Войти"}</h1>
          <div className="auth-tabs" aria-label="Выбор действия">
            <Link className={mode === "login" ? "active" : ""} href={loginHref}>
              Вход
            </Link>
            <Link className={mode === "register" ? "active" : ""} href={registerHref}>
              Регистрация
            </Link>
          </div>
          {params.error ? (
            <p className="form-message auth-message" role="alert">
              {params.error}
            </p>
          ) : null}
          {mode === "register" ? (
            <form className="registration-form login-form" action={registerAction} noValidate>
              <input name="next" type="hidden" value={next} />
              <label>
                Имя
                <input name="name" type="text" aria-required="true" placeholder="Например, Северная чашка" />
              </label>
              <label>
                Email
                <input name="email" type="email" aria-required="true" placeholder="you@example.com" />
              </label>
              <label>
                Пароль
                <input name="password" type="password" aria-required="true" placeholder="Минимум 6 символов" />
              </label>
              <button className="primary-button" type="submit">
                Зарегистрироваться
              </button>
            </form>
          ) : (
            <form className="registration-form login-form" action={loginAction} noValidate>
              <input name="next" type="hidden" value={next} />
              <label>
                Email
                <input name="email" type="email" aria-required="true" placeholder="demo@coffee.local" />
              </label>
              <label>
                Пароль
                <input name="password" type="password" aria-required="true" placeholder="coffee123" />
              </label>
              <button className="primary-button" type="submit">
                Войти
              </button>
            </form>
          )}
          <Link className="login-back" href="/">
            Вернуться к генератору
          </Link>
        </section>
      </main>
    </div>
  );
}
