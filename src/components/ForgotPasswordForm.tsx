import { useState } from "react";
import { forgotPassword } from "../lib/auth";
import { Icon } from "../lib/icons";

const inputClass =
  "w-full border border-border-subtle bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface placeholder:text-text-muted/60 transition-colors duration-200 focus:border-primary focus:outline-none focus-visible:outline-none";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const msg = await forgotPassword(email.trim());
      setDone(msg);
    } catch {
      setDone("Eğer bu e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-md mx-auto py-section-gap">
        <header className="mb-8">
          <span className="font-label-sm uppercase tracking-[0.3em] text-text-muted">Şifre Sıfırlama</span>
          <h1 className="font-display-lg text-3xl md:text-4xl mt-3">Şifremi Unuttum</h1>
          <div className="h-px w-16 bg-primary mt-5" />
        </header>

        {done ? (
          <div className="border border-border-subtle p-6">
            <Icon name="check_circle" size={28} className="text-primary mb-3" />
            <p className="font-body-md mb-2">{done}</p>
            <p className="font-body-md text-text-muted text-sm">
              Gelen kutunu kontrol et ve bağlantıya tıklayarak yeni şifreni belirle.
            </p>
            <a href="/giris" className="mt-5 inline-flex items-center gap-2 text-primary font-bold hover:underline underline-offset-4">
              <Icon name="login" size={18} /> Giriş sayfasına dön
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <p className="font-body-md text-text-muted">
              Kayıtlı e-posta adresini gir; sana şifre sıfırlama bağlantısı gönderelim.
            </p>
            <label className="flex flex-col gap-2">
              <span className="font-label-sm uppercase tracking-widest text-text-muted">E-posta</span>
              <input type="email" required className={inputClass} placeholder="ornek@eposta.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3.5 font-label-md text-label-md uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
            </button>
            <a href="/giris" className="font-body-md text-text-muted text-sm hover:text-primary transition-colors">← Giriş sayfasına dön</a>
          </form>
        )}
      </div>
    </div>
  );
}
