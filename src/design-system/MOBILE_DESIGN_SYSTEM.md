# Modern Mobile-First Design System: DirectData

## 1. Design Direction & Core Philosophy
This UI system transforms the web app into a truly native-like Progressive Web App (PWA). The primary interface paradigm is moving away from a traditional desktop sidebar to a **Bottom Tab Navigation**, prioritizing thumb-reachability, gesture-based interactions, and ergonomics.

### Core Mobile-First Principles
- **Thumb Zone Navigation**: Primary navigation (Home, Orders, Wallet, Profile) and key actions must live at the bottom of the screen.
- **Large Touch Targets**: All interactive elements (buttons, links, inputs) must have a minimum hit area of 48x48px (Material 3 standard) or 44x44px (Apple HIG).
- **Edge-to-Edge Layouts**: Use full-bleed containers for lists and tables to maximize content space on smaller screens. 
- **Bottom Sheets over Modals**: Replace standard center-screen modals with bottom-up sliding sheets that easily easily dismiss via a downward swipe gesture.
- **Haptic Awareness & Feedback**: Provide clear visual feedback (active states, scaling transforms, ripples) for all touches to simulate physical feedback.
- **Form Ergonomics**: Use native numeric keypads for amounts/phone numbers, minimum 16px font sizes on inputs to prevent iOS auto-zoom, and sticky bottom action bars for form submission.

---

## 2. Color System & Theming
*Focus on high-contrast, accessible colors that support seamlessly switching between Light and Dark modes.*

- **Primary**: DirectData Blue (The main brand color). Used for primary actions, active tab states, highlights, and primary gradients.
- **Backgrounds & Surfaces**: 
  - **App Background**: Soft off-white (Light) / Deep charcoal or pure black (Dark) to save battery on OLED screens.
  - **Surface/Card**: Pure white (Light) / Elevated dark gray (Dark) with subtle borders instead of heavy shadows.
- **Typography Colors**:
  - **Headline**: High contrast deep gray/white.
  - **Body**: Subdued gray (slate-500) for readability.
  - **Muted**: Light gray for timestamps, secondary labels.
- **Semantic/Alerts**:
  - **Success**: Emerald Green (Commissions, Successful orders)
  - **Danger**: Rose Red (Failed transactions, Destructive actions)
  - **Warning**: Amber/Yellow (Pending states)
  - **Info**: Sky Blue (Announcements, Information)

---

## 3. Component Inventory & Mobile Adaptations
Below are the existing components from `src/design-system/components` mapped to their new mobile-first behaviors.

### Layout & Structure
- `card.tsx` / `stats-card.tsx`: Large rounded corners (16px+). Subtle shadows for elevation. Grouped cards should become edge-to-edge lists on small screens.
- `container.tsx` / `section.tsx`: Respect `env(safe-area-inset)` padding for iOS notches and navigation bars.
- `hero.tsx` / `feature.tsx` / `testimonial.tsx`: Stack content vertically, centering text for rapid scanning.

### Navigation & Overlays
- **[NEW] `bottom-nav.tsx`**: Replaces the sidebar on mobile. Fixed to the bottom. Max 4-5 icons with pill-shaped active state highlights.
- `tabs.tsx`: Shift to horizontal scrollable pills with hidden scrollbars for sub-navigation.
- `modal.tsx` / `dialog.tsx` (includes `dialog-*` components): **Refactor to Bottom Sheets**. Should snap to bottom, taking 50% or 90% height depending on content.
- `dropdown.tsx`: Convert into a bottom sheet context menu for mobile devices instead of a floating popover.
- `pagination.tsx`: Transition to a full-width "Load More" button or infinite scrolling on mobile lists.

### Forms & Controls
- `button.tsx`: Become full-width inside mobile form contexts. Implement sticky bottom positioning for primary actions (e.g., "Buy Bundle").
- `input.tsx` / `textarea.tsx` / `select.tsx`: Tap area padded. Floating labels or clear external labels. **Must be 16px font or higher**. 
- `switch.tsx`: iOS style toggle; easy to tap or swipe.
- `form.tsx` / `form-field.tsx` / `form-actions.tsx`: Clear error validation states outlined in red. Setup to support numeric keypads (`inputmode="numeric"`).

### Feedback & Data Display
- `toast.tsx` / `alert.tsx`: Slide down from the top safe area (or float just above the bottom nav so it doesn't block thumb input).
- `badge.tsx`: Pill-shaped overlays for statuses (Pending, Completed, VIP).
- `spinner.tsx` / `loading.tsx`: Used generally, though Skeleton loaders should be introduced for perceived performance in App-like feeling.
- `table.tsx`: Horizontal scroll with a sticky first column, or automatically convert rows into a vertical stack of Card components on mobile.
- `image.tsx`: Lazy loading, blur-up placeholders.

---

## 4. UI/Design Directives (For AI Showcase Generation)
When designing the **Showcase Component** to display these pieces in action, the AI should follow these strict instructions:

1. **Mobile Container Mockup**: Wrap the showcase in a simulated mobile device frame (e.g., 390px wide by 844px high) with a mock iOS/Android status bar and the new **Bottom Tab Navigation** pinned at the bottom.
2. **Real-world Context (No generic text)**: Do not just list components with "Button" or "Input". Show them integrated:
   - A *Wallet Balance* `stats-card` showing ₵1,250.00.
   - A *Buy Bundle* `form` complete with `select`, `input`, and a sticky primary `button`.
   - A *Recent Transactions* list derived from `table`/`card` layouts.
3. **Interactive Demonstrations**:
   - Simulate a `modal`/`dialog` rendered as a slide-up **Bottom Sheet**.
   - Show `tabs` rendering as a horizontal scrolling segmented control.
4. **Variations & States**: Highlight Light and Dark mode side-by-side, or include a toggle. Ensure `alert`, `badge`, and `toast` states cover Success, Warning, and Danger paths related to SaaS telecom orders.
