import { memo, useEffect, useState } from "react";

interface StoreHeaderProps {
  storefront: {
    displayName?: string;
    businessName?: string;
  };
  branding: {
    logoUrl?: string;
    tagline?: string;
  };
}

const TAGLINES = [
  "Fast data, great prices — always.",
  "Your trusted data partner in Ghana.",
  "Affordable bundles, delivered instantly.",
  "Stay connected without breaking the bank.",
  "Top-up in seconds. Browse all day.",
  "Ghana's most reliable data deals.",
  "Smart data for smart people.",
  "Always online, always affordable.",
  "Power up your connection today.",
  "Bundle up and save more.",
  "Reliable data at unbeatable prices.",
  "Your go-to stop for data bundles.",
  "Connecting Ghana, one bundle at a time.",
  "Fastest top-ups, happiest customers.",
  "Data deals that make sense.",
  "Browse more, pay less.",
  "Your network. Your savings. Our service.",
  "Quality bundles from a trusted source.",
  "Instant top-up, zero hassle.",
  "Because staying connected matters.",
];

function pickTagline(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TAGLINES[hash % TAGLINES.length];
}

export const StoreHeader = memo(function StoreHeader({
  storefront,
  branding,
}: StoreHeaderProps) {
  const displayName = storefront.displayName || storefront.businessName || "";
  const tagline =
    branding.tagline || pickTagline(storefront.businessName || displayName);
  const logoSrc = branding.logoUrl;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={`sh-header ${mounted ? "is-mounted" : ""}`}>
      <div className="sh-header__inner">
        {logoSrc && (
          <div className="sh-header__logo-wrap">
            <img src={logoSrc} alt={displayName} className="sh-header__logo" />
          </div>
        )}
        <h1 className="sh-header__name">{displayName}</h1>
        <div className="sh-header__rule">
          <span className="sh-header__rule-dot" />
          <span className="sh-header__rule-line" />
          <span className="sh-header__rule-dot" />
        </div>
        {tagline && <p className="sh-header__tagline">{tagline}</p>}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700;800&family=Open+Sans:wght@300;400&display=swap');

        .sh-header {
          display: flex;
          justify-content: center;
          padding: clamp(56px, 12vw, 120px) clamp(20px, 5vw, 64px) clamp(44px, 7vw, 80px);
        }

        .sh-header__inner {
          max-width: 640px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 800ms cubic-bezier(0.19, 1, 0.22, 1),
                      transform 800ms cubic-bezier(0.19, 1, 0.22, 1);
        }

        .sh-header.is-mounted .sh-header__inner {
          opacity: 1;
          transform: translateY(0);
        }

        .sh-header__logo-wrap {
          margin-bottom: clamp(24px, 4vw, 40px);
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
          transition-delay: 200ms;
        }

        .sh-header.is-mounted .sh-header__logo-wrap {
          opacity: 1;
          transform: scale(1);
        }

        .sh-header__logo {
          display: block;
          height: clamp(80px, 12vw, 112px);
          width: clamp(80px, 12vw, 112px);
          border-radius: 24px;
          object-fit: cover;
          box-shadow: 0 4px 20px color-mix(in srgb, var(--color-text, #252f36) 8%, transparent);
        }

        .sh-header__name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 8vw, 76px);
          line-height: 0.95;
          letter-spacing: -0.02em;
          margin: 0;
          color: var(--color-text, #252f36);
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 700ms ease-out, transform 700ms cubic-bezier(0.19, 1, 0.22, 1);
          transition-delay: 400ms;
        }

        .sh-header.is-mounted .sh-header__name {
          opacity: 1;
          transform: translateY(0);
        }

        .sh-header__name:empty::before {
          content: "Your Store";
          opacity: 0.35;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
        }

        .sh-header__rule {
          margin-top: clamp(20px, 3vw, 32px);
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 600ms ease-out;
          transition-delay: 700ms;
        }

        .sh-header.is-mounted .sh-header__rule {
          opacity: 1;
        }

        .sh-header__rule-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-primary, #c0a670);
          opacity: 0.6;
          transition: transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
          transition-delay: 750ms;
          transform: scale(0);
        }

        .sh-header.is-mounted .sh-header__rule-dot {
          transform: scale(1);
        }

        .sh-header__rule-line {
          width: 0;
          height: 1px;
          background: var(--color-primary, #c0a670);
          opacity: 0.4;
          transition: width 700ms cubic-bezier(0.19, 1, 0.22, 1);
          transition-delay: 800ms;
        }

        .sh-header.is-mounted .sh-header__rule-line {
          width: clamp(32px, 5vw, 64px);
        }

        .sh-header__tagline {
          font-family: 'Open Sans', sans-serif;
          font-weight: 300;
          font-size: clamp(14px, 2.2vw, 19px);
          line-height: 1.75;
          letter-spacing: 0.005em;
          color: var(--color-secondary-text, #475969);
          margin: clamp(20px, 3vw, 32px) 0 0;
          max-width: 32em;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.19, 1, 0.22, 1);
          transition-delay: 950ms;
        }

        .sh-header.is-mounted .sh-header__tagline {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .sh-header__inner,
          .sh-header__logo-wrap,
          .sh-header__name,
          .sh-header__rule,
          .sh-header__rule-dot,
          .sh-header__rule-line,
          .sh-header__tagline {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .sh-header__rule-dot { transform: scale(1); }
          .sh-header__rule-line { width: clamp(32px, 5vw, 64px); }
        }
      `}</style>
    </header>
  );
});
