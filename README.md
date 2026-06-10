# Caskmaf Datahub — Telecom Storefront & Dashboard

React 19 + TypeScript + Vite storefront and management dashboard for the Caskmaf Datahub brand. Features a splash screen entry flow, dark-first theming, and animation/chart libraries not present in sibling apps.

## Stack

- React 19, TypeScript 5.8, Vite 6
- Tailwind CSS 4, React Router 7
- TanStack Query, React Hook Form + Zod
- **Framer Motion** 12, **Recharts** 3
- Axios, jwt-decode, js-cookie
- PWA via Workbox + vite-plugin-pwa

## Pages

### Public

| Route | Page |
|---|---|
| `/` | Splash page |
| `/welcome` | Welcome onboarding |
| `/login`, `/register` | Auth |
| `/forgot-password`, `/reset-password/:token` | Password flow |
| `/store` | Store discovery |
| `/store/:businessName` | Per-storefront bundle ordering |
| `/storefront/:storefrontId/callback` | Paystack callback |

### Agent Dashboard (`/agent/dashboard/`)

Dashboard, packages, orders, wallet, commissions, storefront management, AFA registration, profile.

### Superadmin (`/superadmin/`)

Analytics, users, packages & bundles, orders, wallet management (top-ups, payouts, history), store management, settings, announcements, referrals, audit logs, provider management.

## Storefront Features

- Mobile-first, theme-aware responsive layout (dark mode by default)
- Bundle browsing by provider with search/filter
- Trending + Best Value featured carousel
- Single-item order flow (no cart)
- Payment: mobile money, bank transfer, Paystack inline
- Order tracking drawer
- Announcement popups, ad slots
- WhatsApp contact integration
- Store closure / site status awareness

## Development

```bash
npm run dev        # :5174
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # vite preview
```
