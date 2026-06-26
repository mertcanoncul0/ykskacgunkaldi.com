import { useEffect, useState } from "react";
import { resetPassword, PbError } from "../lib/auth";
import { Icon } from "../lib/icons";

const inputClass =
  "w-full border border-border-subtle bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface placeholder:text-text-muted/60 transition-colors duration-200 focus:border-primary focus:outline-none focus-visible:outline-none";

export function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") || "";
    setToken(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password, passwordConfirm);
      setDone(true);
    } catch (err) {
      setError(err instanceof PbError ? err.message : "Bağlantı geçersiz veya süresi dolmuş.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-md mx-auto py-section-gap">
        <header className="mb-8">
          <span className="font-label-sm uppercase tracking-[0.3em] text-text-muted">Şifre Sıfırlama</span>
          <h1 className="font-display-lg text-3xl md:text-4xl mt-3">Yeni Şifre Belirle</h1>
          <div className="h-px w-16 bg-primary mt-5" />
        </header>

        {done ? (
          <div className="border border-border-subtle p-6">
            <Icon name="check_circle" size={28} className="text-primary mb-3" />
            <p className="font-body-md mb-4">Şifren güncellendi. Artık yeni şifrenle giriş yapabilirsin.</p>
            <a href="/giris" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md uppercase tracking-wide">
              <Icon name="login" size={18} /> Giriş Yap
            </a>
          </div>
        ) : !token ? (
          <div className="border border-error/40 bg-error/5 text-error p-6">
            <p className="font-body-md">Geçersiz veya eksik bağlantı. Lütfen e-postandaki bağlantıyı yeniden kullan.</p>
            <a href="/sifremi-unuttum" className="mt-4 inline-block font-bold underline underline-offset-4">Yeni bağlantı iste</a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            {error && <div role="alert" className="border border-error/40 bg-error/5 text-error px-4 py-3 text-sm">{error}</div>}
            <label className="flex flex-col gap-2">
              <span className="font-label-sm uppercase tracking-widest text-text-muted">Yeni Şifre</span>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required className={inputClass + " pr-12"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"} className="absolute right-0 top-0 h-full w-12 inline-flex items-center justify-center text-text-muted hover:text-primary transition-colors">
                  <Icon name={showPw ? "visibility_off" : "visibility"} size={20} />
                </button>
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-label-sm uppercase tracking-widest text-text-muted">Yeni Şifre (tekrar)</span>
              <input type={showPw ? "text" : "password"} required className={inputClass} placeholder="••••••••" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </label>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 font-label-md text-label-md uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Güncelleniyor…" : "Şifreyi Güncelle"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
