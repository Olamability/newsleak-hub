# Newsleak Hub

A modern, performant news aggregation platform built with React, TypeScript, and Supabase.

## Recent Performance Improvements ⚡

This project has been optimized for performance with **98.7% reduction in database queries**:

- ✅ React Query integration for intelligent caching
- ✅ Optimistic updates for instant UI feedback  
- ✅ Fixed image extraction from RSS feeds
- ✅ Reduced page load times significantly

See [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md) for details.

## Quick Start

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account and project

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd newsleak-hub

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the development server
npm run dev
```

### Deploying the Edge Function

To enable proper image extraction from RSS feeds:

1. Install Supabase CLI: `npm install -g supabase`
2. Follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Deploy the edge function: `supabase functions deploy fetchFeeds`

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i --legacy-peer-deps

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- React Query (@tanstack/react-query) - For data fetching and caching
- shadcn-ui
- Tailwind CSS
- Supabase - Backend and database
- Supabase Edge Functions - RSS feed processing

## Available Scripts

```sh
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/      # React components
├── hooks/          # Custom React hooks (including React Query hooks)
├── lib/            # Utility functions and API clients
├── pages/          # Page components
└── data/           # Static data and types

supabase/
└── functions/      # Supabase Edge Functions
    └── fetchFeeds/ # RSS feed fetching with image extraction
```

## Documentation

- [Performance Improvements](./PERFORMANCE_IMPROVEMENTS.md) - Details on optimizations
- [Supabase Edge Function Fix](./SUPABASE_EDGE_FUNCTION_FIX.md) - Technical implementation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to deploy the edge function

## Features

- 📰 RSS feed aggregation
- 🖼️ Automatic image extraction from articles
- 🔖 Bookmark articles
- ❤️ Like articles  
- 💬 Comment on articles
- 🔍 Search functionality
- 📱 Responsive design
- ⚡ Optimized performance with React Query caching
- 👤 User authentication
- 🔐 Admin panel for feed management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
