# Tech Stack Documentation

## Overview

**newsleak-hub** is a modern news aggregation web application built with a comprehensive tech stack focused on performance, developer experience, and user interface excellence.

---

## Frontend Framework & Build Tools

### Core Framework
- **React 19.1.0** - Modern UI library with latest concurrent features
- **TypeScript 5.9.2** - Type-safe JavaScript with enhanced developer experience
- **Vite 5.4.19** - Next-generation frontend build tool with lightning-fast HMR

### Build & Development
- **@vitejs/plugin-react-swc** - Uses SWC for extremely fast React refresh
- **PostCSS** - CSS transformation and processing
- **Autoprefixer** - Automatic vendor prefixing for CSS

---

## Styling & UI Components

### CSS Framework
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **tailwindcss-animate** - Animation utilities for Tailwind
- **@tailwindcss/typography** - Beautiful typographic defaults
- **tailwind-merge** - Utility for merging Tailwind CSS classes

### UI Component Library
- **shadcn-ui** - Re-usable component collection built on Radix UI
- **Radix UI** - Comprehensive collection of accessible, unstyled components:
  - Accordion, Alert Dialog, Aspect Ratio, Avatar
  - Checkbox, Collapsible, Context Menu, Dialog
  - Dropdown Menu, Hover Card, Label, Menubar
  - Navigation Menu, Popover, Progress, Radio Group
  - Scroll Area, Select, Separator, Slider
  - Switch, Tabs, Toast, Toggle, Tooltip

### Additional UI Libraries
- **Lucide React 0.462.0** - Beautiful & consistent icon library
- **embla-carousel-react** - Powerful carousel/slider component
- **cmdk** - Fast, composable command menu
- **vaul** - Drawer component for React
- **sonner** - Opinionated toast component
- **class-variance-authority** - Managing component variants
- **clsx** - Utility for constructing className strings

---

## Routing & Navigation
- **React Router DOM 6.30.1** - Declarative routing for React applications

---

## State Management & Data Fetching

### Query & Cache Management
- **@tanstack/react-query 5.83.0** - Powerful asynchronous state management

### Backend Services
- **Supabase** - Backend-as-a-Service platform
  - **@supabase/supabase-js 2.86.0** - Supabase client library
  - Used for: Database, Authentication, Real-time subscriptions
  
- **Firebase 12.6.0** - Google's mobile and web application platform
  - Used for: Additional authentication and services

---

## Data Processing & RSS

### RSS Feed Processing
- **rss-parser 3.13.0** - RSS feed parser for aggregating news content

### Date & Time
- **date-fns 3.6.0** - Modern JavaScript date utility library

---

## Forms & Validation

- **React Hook Form 7.61.1** - Performant, flexible forms with easy validation
- **@hookform/resolvers 3.10.0** - Validation resolvers for React Hook Form
- **Zod 3.25.76** - TypeScript-first schema validation
- **input-otp** - Input component for one-time passwords

---

## Charts & Data Visualization

- **Recharts 2.15.4** - Composable charting library built on React components

---

## Additional Features

### UI Enhancements
- **next-themes 0.3.0** - Perfect dark mode support
- **react-helmet-async 2.0.5** - Document head management
- **react-resizable-panels 2.1.9** - Resizable panel layouts
- **react-day-picker 8.10.1** - Date picker component

---

## Development Tools

### Linting & Code Quality
- **ESLint 9.32.0** - Pluggable JavaScript linter
- **@eslint/js** - ESLint JavaScript configurations
- **eslint-plugin-react-hooks** - React Hooks linting rules
- **eslint-plugin-react-refresh** - Validate React refresh
- **typescript-eslint 8.38.0** - TypeScript ESLint support
- **globals** - Global identifiers from different environments

### Development Utilities
- **lovable-tagger 1.1.11** - Component tagging for development
- **@types/node** - TypeScript type definitions for Node.js
- **@types/react** - TypeScript type definitions for React
- **@types/react-dom** - TypeScript type definitions for React DOM

---

## Project Structure

```
newsleak-hub/
├── src/
│   ├── components/       # React components
│   │   └── ui/          # shadcn-ui primitives
│   ├── pages/           # Page-level components
│   ├── lib/             # Utilities and helpers
│   ├── hooks/           # Custom React hooks
│   ├── data/            # Static data and mocks
│   ├── context/         # React context providers
│   └── utils/           # Utility functions
├── public/              # Static assets
├── dist/                # Production build output
└── Configuration files:
    ├── vite.config.ts       # Vite configuration
    ├── tsconfig.json        # TypeScript configuration
    ├── tailwind.config.ts   # Tailwind CSS configuration
    ├── postcss.config.js    # PostCSS configuration
    ├── components.json      # shadcn-ui configuration
    └── eslint.config.js     # ESLint configuration
```

---

## Key Features Enabled by Tech Stack

1. **Type Safety** - Full TypeScript coverage with strict typing
2. **Component Reusability** - shadcn-ui + Radix UI for consistent, accessible components
3. **Fast Development** - Vite's HMR and SWC compilation for instant feedback
4. **Modern Styling** - Tailwind CSS utility-first approach with custom design tokens
5. **Backend Integration** - Seamless Supabase and Firebase integration
6. **RSS Aggregation** - Built-in RSS feed parsing and management
7. **Responsive Design** - Mobile-first approach with Tailwind breakpoints
8. **Dark Mode** - Full theme support with next-themes
9. **Form Handling** - Type-safe forms with React Hook Form + Zod validation
10. **Data Visualization** - Interactive charts with Recharts
11. **Accessibility** - WCAG compliant components from Radix UI

---

## Environment Variables

The project uses environment variables for configuration:

- `VITE_Supabase_URL` - Supabase project URL
- `VITE_ANON_KEY` - Supabase anonymous key

---

## Build & Deployment

### Development
```bash
npm run dev        # Start development server (port 8080)
```

### Production
```bash
npm run build      # Build for production
npm run preview    # Preview production build
```

### Code Quality
```bash
npm run lint       # Run ESLint
```

---

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

## Performance Characteristics

- **Bundle Size**: ~710 KB (minified), ~208 KB (gzipped)
- **Build Tool**: Vite with Rollup for optimized production builds
- **CSS**: Utility-first with Tailwind, minimal runtime overhead
- **React**: Latest concurrent features for improved performance

---

## License & Dependencies

All dependencies are open-source with permissive licenses (MIT, Apache 2.0, etc.)

For detailed dependency information, see `package.json`.

Last Updated: December 2025
