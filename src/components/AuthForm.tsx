import { useState } from "react";
import { login, register, PbError } from "../lib/auth";
import { Icon } from "../lib/icons";

type Mode = "login" | "register";

const inputClass =
  "w-full border border-border-subtle bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface placeholder:text-text-muted/60 transition-colors duration-200 focus:border-primary focus:outline-none focus-visible:outline-none";

function redirectTarget(): string {
  if (typeof window === "undefined") return "/";
  const p = new URLSearchParams(window.location.search).get("redirect");
  // Yalnızca site-içi göreli yollara izin ver (açık yönlendirme açığı olmasın).
  if (p && p.startsWith("/") && !p.startsWith("//")) return p;
  return "/";
}

export function AuthForm({ mode = "login" }: { mode?: Mode }) {
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!isLogin && password !== passwordConfirm) {
      setFieldErrors({ passwordConfirm: "Şifreler eşleşmiyor." });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
        window.location.href = redirectTarget();
      } else {
        const u = await register({
          email: email.trim(),
          password,
          passwordConfirm,
          name: name.trim() || undefined,
        });
        // Otomatik giriş olduysa hedefe, olmadıysa giriş sayfasına yönlendir.
        window.location.href = u ? redirectTarget() : "/giris";
      }
    } catch (err) {
      if (err instanceof PbError) {
        const fe: Record<string, string> = {};
        for (const [k, v] of Object.entries(err.fields)) {
          if (v?.message) fe[k] = v.message;
        }
        setFieldErrors(fe);
        setError(
          Object.keys(fe).length
            ? "Lütfen aşağıdaki alanları kontrol et."
            : isLogin
              ? "E-posta veya şifre hatalı."
              : err.message
        );
      } else {
        setError("Beklenmeyen bir hata oluştu. Tekrar dene.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-md mx-auto py-section-gap">
        <header className="mb-8">
          <span className="font-label-sm uppercase tracking-[0.3em] text-text-muted">
            {isLogin ? "Tekrar hoş geldin" : "Aramıza katıl"}
          </span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-4xl mt-3">
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </h1>
          <div className="h-px w-16 bg-primary mt-5" />
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 border border-error/40 bg-error/5 text-error px-4 py-3 font-body-md text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {!isLogin && (
            <Field label="Ad Soyad" error={fieldErrors.name}>
              <input
                type="text"
                autoComplete="name"
                className={inputClass}
                placeholder="Adın (opsiyonel)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          )}

          <Field label="E-posta" error={fieldErrors.email}>
            <input
              type="email"
              required
              autoComplete="email"
              className={inputClass}
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Şifre" error={fieldErrors.password}>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={inputClass + " pr-12"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-0 top-0 h-full w-12 inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors"
              >
                <Icon name={showPw ? "visibility_off" : "visibility"} size={20} />
              </button>
            </div>
          </Field>

          {!isLogin && (
            <Field label="Şifre (tekrar)" error={fieldErrors.passwordConfirm}>
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                className={inputClass}
                placeholder="••••••••"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 font-label-md text-label-md uppercase tracking-wide transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              "Lütfen bekle…"
            ) : (
              <>
                <Icon name={isLogin ? "login" : "person_add"} size={18} />
                {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
              </>
            )}
          </button>
        </form>

        <p className="mt-8 font-body-md text-text-muted text-sm">
          {isLogin ? (
            <>
              Hesabın yok mu?{" "}
              <a href="/kayit" className="text-primary font-bold hover:underline underline-offset-4">
                Kayıt ol
              </a>
            </>
          ) : (
            <>
              Zaten hesabın var mı?{" "}
              <a href="/giris" className="text-primary font-bold hover:underline underline-offset-4">
                Giriş yap
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-label-sm uppercase tracking-widest text-text-muted">{label}</span>
      {children}
      {error && <span className="font-body-md text-xs text-error">{error}</span>}
    </label>
  );
}
