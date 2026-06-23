import { footerLinkGroups, site } from "../lib/site";

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-primary lg:ml-64">
      <div className="w-full px-margin-mobile md:px-margin-desktop py-section-gap max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-gutter">
        <div className="flex flex-col gap-4">
          <div className="font-headline-md text-headline-md text-primary font-bold tracking-tighter uppercase">
            {site.name}
          </div>
          <p className="text-text-muted font-body-md max-w-xs">
            TYT, AYT, DGS, LGS, KPSS ve ALES için canlı geri sayım, konu dağılımı ve puan hesaplama araçları.
          </p>
          <p className="font-label-sm text-label-sm text-text-muted max-w-xs mt-4">
            © {new Date().getFullYear()} {site.name}. Tüm hakları saklıdır.
          </p>
        </div>
        <div className="flex flex-wrap gap-12">
          {footerLinkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <p className="font-label-md text-label-md uppercase tracking-widest">{group.title}</p>
              {group.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-text-muted hover:text-primary transition-colors font-label-sm text-label-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
