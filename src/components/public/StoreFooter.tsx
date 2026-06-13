import { memo } from "react";
import type { PublicStorefront, StorefrontBranding } from "./types";
import { normalizeWhatsappNumber } from "./utils";
import { getSystemFooterText } from "./constants";
import { FaPhone, FaEnvelope, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

interface StoreFooterProps {
  storefront: PublicStorefront["storefront"];
  branding: StorefrontBranding;
}

export const StoreFooter = memo(function StoreFooter({ storefront, branding }: StoreFooterProps) {
  const social = branding.socialLinks;
  const hasSocial = social && Object.values(social).some(Boolean);
  const hasContact =
    storefront.contactInfo &&
    (storefront.contactInfo.phone ||
      storefront.contactInfo.email ||
      storefront.contactInfo.whatsapp);

  const footerText =
    (branding.footerText || "").trim() ||
    getSystemFooterText(storefront.businessName);
  if (!hasSocial && !hasContact && !footerText) return null;

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-3 sm:space-y-0 text-center sm:text-left">
          {hasSocial && (
            <div className="flex items-center justify-center sm:justify-start gap-5">
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-muted-text)] hover:text-[var(--color-primary-700)] transition"
                >
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {social?.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-muted-text)] hover:text-[var(--color-primary-500)] transition"
                >
                  <FaTwitter className="w-5 h-5" />
                </a>
              )}
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-muted-text)] hover:text-[var(--color-primary-600)] transition"
                >
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
          {hasContact && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-[var(--color-secondary-text)]">
              {storefront.contactInfo?.phone && (
                <a
                  href={`tel:${storefront.contactInfo.phone}`}
                  className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition"
                >
                  <FaPhone className="w-3 h-3" />
                  {storefront.contactInfo.phone}
                </a>
              )}
              {storefront.contactInfo?.whatsapp && (
                <a
                  href={`https://wa.me/${normalizeWhatsappNumber(storefront.contactInfo.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[var(--color-whatsapp)] hover:text-[var(--color-whatsapp-dark)] transition font-semibold"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  WhatsApp
                </a>
              )}
              {storefront.contactInfo?.email && (
                <a
                  href={`mailto:${storefront.contactInfo.email}`}
                  className="flex items-center gap-1.5 hover:text-[var(--color-text)] transition"
                >
                  <FaEnvelope className="w-3 h-3" />
                  {storefront.contactInfo.email}
                </a>
              )}
            </div>
          )}
          <p className="text-xs text-[var(--color-muted-text)]">
            {footerText}
            <span className="mx-2 text-[var(--color-border)]">|</span>
            <span className="font-medium text-[var(--color-secondary-text)]">
              {storefront.businessName}
            </span>
          </p>
        </div>
        <p className="text-xs text-[var(--color-muted-text)] text-center sm:text-right">
          Made with love by{" "}
          <a
            href="https://quayedna-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary-700)] hover:underline"
          >
            DNA Studios
          </a>
        </p>
      </div>
    </footer>
  );
});
