# Copilot Instructions for newsleak-hub

## Project Overview

- **newsleak-hub** is a Vite + React + TypeScript web app using Tailwind CSS and shadcn-ui for UI components.
- The app is structured around modular React components, with UI primitives in `src/components/ui/` and feature components in `src/components/`.
- Data flows from `src/data/` (e.g., `mockNews.ts`) and is managed via utility libraries in `src/lib/` (e.g., `feedStorage.ts`, `rssParser.ts`).
- Page-level routing and logic are in `src/pages/`.

## Key Patterns & Conventions

- **Component Structure:**
  - UI primitives (buttons, dialogs, etc.) are in `src/components/ui/` and follow shadcn-ui conventions.
  - Feature components (e.g., `NewsCard.tsx`, `Header.tsx`) compose UI primitives and handle business logic.
- **Styling:**
  - Tailwind CSS is used throughout. Utility classes are preferred over custom CSS.
  - Global styles: `src/index.css`, `src/App.css`.
- **Data & State:**
  - Mock/news data: `src/data/mockNews.ts`.
  - Local storage and RSS parsing: `src/lib/feedStorage.ts`, `src/lib/rssParser.ts`.
  - Custom hooks: `src/hooks/` (e.g., `use-mobile.tsx`, `use-toast.ts`).
- **Routing:**
  - Page components in `src/pages/` (e.g., `Index.tsx`, `ArticleDetail.tsx`).
  - Navigation handled by `CategoryNav.tsx`, `NavLink.tsx`.

## Developer Workflows

- **Install dependencies:**
  ```sh
  npm install
  ```
- **Start dev server:**
  ```sh
  npm run dev
  ```
- **Build for production:**
  ```sh
  npm run build
  ```
- **Preview production build:**
  ```sh
  npm run preview
  ```
- **Linting:**
  ```sh
  npm run lint
  ```
- **No formal test suite** is present as of this writing.

## Integration & External Services

- **shadcn-ui**: UI primitives are generated/maintained via shadcn-ui conventions.
- **RSS Feeds**: Parsing and storage logic in `src/lib/rssParser.ts` and `src/lib/feedStorage.ts`.

## Project-Specific Guidance

- Prefer composing UI from primitives in `src/components/ui/`.
- Use Tailwind utility classes for all styling.
- Place new page-level components in `src/pages/`.
- Store reusable logic in `src/hooks/` or `src/lib/` as appropriate.
- Reference `README.md` for up-to-date workflow and deployment instructions.

---

For questions about project structure or conventions, see the examples in `src/components/`, `src/pages/`, and `src/lib/`.
