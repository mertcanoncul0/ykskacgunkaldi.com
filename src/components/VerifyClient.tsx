import { useEffect, useState } from "react";
import { confirmVerification } from "../lib/auth";
import { Icon } from "../lib/icons";

type State = "loading" | "ok" | "error" | "notoken";

export function VerifyClient() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    if (!token) {
      setState("notoken");
      return;
    }
    confirmVerification(token)
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, []);

  return (
    <div className="px-margin-mobile md:px-margin-desktop">
      <div className="max-w-md mx-auto py-section-gap text-center">
        {state === "loading" && (
          <>
            <Icon name="refresh" size={32} className="text-text-muted mx-auto mb-4 animate-spin" />
            <p className="font-body-md text-text-muted">E-postan doğrulanıyor…</p>
          </>
        )}
        {state === "ok" && (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center border border-border-subtle mb-5">
              <Icon name="check_circle" size={32} className="text-primary" />
            </div>
            <h1 className="font-display-lg text-3xl md:text-4xl mb-3">E-postan doğrulandı</h1>
            <p className="font-body-md text-text-muted mb-6">Hesabın artık tamamen aktif.</p>
            <a href="/hesap" className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label-md uppercase tracking-wide">
              <Icon name="account" size={18} /> Hesabıma Git
            </a>
          </>
        )}
        {(state === "error" || state === "notoken") && (
          <>
            <div className="inline-flex h-16 w-16 items-center justify-center border border-border-subtle mb-5">
              <Icon name="warning" size={32} className="text-error" />
            </div>
            <h1 className="font-display-lg text-3xl md:text-4xl mb-3">Doğrulama başarısız</h1>
            <p className="font-body-md text-text-muted mb-6">
              Bağlantı geçersiz veya süresi dolmuş olabilir. Hesabından yeni bir doğrulama e-postası isteyebilirsin.
            </p>
            <a href="/hesap" className="inline-flex items-center gap-2 border border-border-subtle px-6 py-3 hover:border-primary hover:text-primary transition-colors font-label-md uppercase tracking-wide">
              Hesaba Git
            </a>
          </>
        )}
      </div>
    </div>
  );
}
