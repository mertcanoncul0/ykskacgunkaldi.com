import { useState } from "react";
import { updateProfile, requestVerification, logout, getUser, type AuthUser } from "../lib/auth";
import { Icon } from "../lib/icons";

const inputClass =
  "w-full border border-border-subtle bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface placeholder:text-text-muted/60 transition-colors duration-200 focus:border-primary focus:outline-none focus-visible:outline-none";

export function AccountClient({ initialUser }: { initialUser?: AuthUser | null }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? getUser());
  const [name, setName] = useState(initialUser?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSavedMsg("");
    setSaving(true);
    try {
      const u = await updateProfile(name.trim());
      setUser(u);
      setSavedMsg("Bilgilerin kaydedildi.");
    } catch {
      setError("Kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  async function resendVerification() {
    setVerifyMsg("");
    try {
      const msg = await requestVerification(user?.email);
      setVerifyMsg(msg);
    } catch {
      setVerifyMsg("E-posta gönderilemedi. Tekrar dene.");
    }
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div className="px-margin-mobile md:px-margin-desktop">
        <div className="max-w-md mx-auto py-section-gap text-center">
          <p className="font-body-md text-text-muted mb-6">Oturum bulunamadı.</p>
          <a href="/giris" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md uppercase tracking-wide">
            <Icon name="login" size={18} /> Giriş Yap
          </a>
        </div>
      </div>
    );
  }

  const displayName = user.name?.trim() || user.email.split("@")[0];

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-2xl mx-auto py-section-gap">
        <header className="mb-10 flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center bg-primary text-on-primary text-xl font-bold uppercase shrink-0">
            {displayName.charAt(0)}
          </span>
          <div>
            <h1 className="font-display-lg text-3xl md:text-4xl">{displayName}</h1>
            <p className="font-body-md text-text-muted">{user.email}</p>
          </div>
        </header>

        {/* Doğrulama durumu */}
        <section className="border border-border-subtle p-5 mb-8 flex items-start gap-4">
          <Icon name={user.verified ? "check_circle" : "warning"} size={22} className={user.verified ? "text-primary mt-0.5" : "text-error mt-0.5"} />
          <div className="flex-1">
            <p className="font-label-md text-label-md">
              {user.verified ? "E-posta adresin doğrulandı" : "E-posta adresin doğrulanmadı"}
            </p>
            {!user.verified && (
              <>
                <p className="font-body-md text-text-muted text-sm mt-1">
                  Hesabını güvende tutmak için e-postanı doğrula.
                </p>
                <button
                  type="button"
                  onClick={resendVerification}
                  className="mt-3 inline-flex items-center gap-2 border border-border-subtle px-4 py-2 hover:border-primary hover:text-primary transition-colors font-label-md text-label-md"
                >
                  <Icon name="upload" size={16} /> Doğrulama e-postası gönder
                </button>
                {verifyMsg && <p className="mt-2 font-body-md text-sm text-primary">{verifyMsg}</p>}
              </>
            )}
          </div>
        </section>

        {/* Profil bilgileri */}
        <section className="mb-8">
          <h2 className="font-headline-md text-headline-md mb-5">Profil Bilgileri</h2>
          {error && <div role="alert" className="mb-4 border border-error/40 bg-error/5 text-error px-4 py-3 text-sm">{error}</div>}
          {savedMsg && <div className="mb-4 border border-border-subtle px-4 py-3 text-sm text-primary">{savedMsg}</div>}
          <form onSubmit={saveName} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="font-label-sm uppercase tracking-widest text-text-muted">Ad Soyad</span>
              <input type="text" className={inputClass} placeholder="Adın" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-label-sm uppercase tracking-widest text-text-muted">E-posta</span>
              <input type="email" className={inputClass + " opacity-60 cursor-not-allowed"} value={user.email} disabled />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="self-start inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md text-label-md uppercase tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </form>
        </section>

        {/* Hesap işlemleri */}
        <section className="border-t border-border-subtle pt-8 flex flex-wrap gap-3">
          <a href="/sifremi-unuttum" className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2.5 hover:border-primary hover:text-primary transition-colors font-label-md text-label-md">
            <Icon name="refresh" size={16} /> Şifre Değiştir
          </a>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 border border-border-subtle px-4 py-2.5 hover:border-primary hover:text-primary transition-colors font-label-md text-label-md">
            <Icon name="logout" size={16} /> Çıkış Yap
          </button>
        </section>
      </div>
    </div>
  );
}
