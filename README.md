# Newsleak Hub

A modern, performant, production-ready news aggregation platform built with React, TypeScript, and Supabase.

## 🎯 Overview

Newsleak is a comprehensive news aggregation platform that provides users with personalized, fast, and visually appealing news from multiple sources. Built to production standards with scalability, performance, and user experience as top priorities.

## ✨ Key Features

### User-Facing Features

#### News Consumption
- 📰 **RSS Feed Aggregation** - Automatic news fetching from multiple sources
- 🖼️ **Automatic Image Extraction** - Rich media from RSS feeds with 5 extraction strategies
- 🔖 **Bookmark Articles** - Save articles for later reading
- ❤️ **Like Articles** - Show appreciation for content
- 💬 **Comment System** - Engage with articles through comments
- 🔍 **Advanced Search** - Search across all articles with filters
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile
- 🌙 **Dark Mode** - System-wide theme support (light/dark)
- 📏 **Adjustable Text Size** - Accessibility-first reading experience

#### Personalization
- 🎯 **Personalized Feed** - AI-powered recommendations based on reading history
- 📊 **Trending News** - Real-time trending algorithm based on engagement
- 🏷️ **Category Preferences** - Customize feed by favorite categories
- 🔔 **Push Notifications** - Firebase Cloud Messaging for breaking news
- 📍 **Related Articles** - Smart content similarity algorithm

#### User Experience
- ⚡ **98.7% Faster** - React Query caching reduces database queries
- 🚀 **Instant Interactions** - Optimistic updates for likes/bookmarks
- 🔄 **Offline Support** - PWA capabilities for reading without internet
- 🎨 **Modern UI** - Beautiful interface with shadcn-ui components
- ♿ **Accessible** - WCAG compliant with screen reader support
- 🌐 **SEO Optimized** - Structured data and meta tags for better discovery

### Admin Features

#### Dashboard
- 📈 **Analytics Dashboard** - Track engagement, views, likes, and comments
- 📊 **Source Management** - Add/edit/remove RSS feeds
- 🔥 **Trending Insights** - See top performing articles
- 👥 **User Management** - View and manage registered users
- 📝 **Article Management** - Edit, tag, and prioritize articles before publishing

#### Notifications
- 🔔 **Push Notification Center** - Send targeted notifications
- 🎯 **Audience Targeting** - Send to all users or by category preference
- 📅 **Scheduled Notifications** - Schedule notifications for future delivery
- 📊 **Notification Analytics** - Track opens and click-through rates
- 🖼️ **Rich Notifications** - Include images and deep links

#### Content Management
- ✏️ **Article Editing** - Edit fetched content before publishing
- 🏷️ **Tag Management** - Categorize and tag articles
- 🔍 **Content Validation** - Prevent duplicates and filter by keywords
- 📝 **Manual Article Entry** - Add exclusive or local content
- 🚫 **Content Moderation** - Review and moderate user comments

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 19.1.0 + TypeScript 5.9.2
- **Build Tool**: Vite 5.4.19 (lightning-fast HMR)
- **UI Components**: shadcn-ui + Radix UI (accessible primitives)
- **Styling**: Tailwind CSS 3.4 (utility-first)
- **Icons**: Lucide React (beautiful icons)
- **Routing**: React Router DOM 6.30

### State & Data
- **Data Fetching**: TanStack React Query 5.83 (intelligent caching)
- **Forms**: React Hook Form 7.61 + Zod validation
- **Notifications**: Firebase Cloud Messaging (FCM)

### Backend & Infrastructure
- **Database**: PostgreSQL (via Supabase)
- **Backend**: Supabase (Auth, Database, Real-time, Storage)
- **Edge Functions**: Deno-based Supabase Functions
- **Authentication**: Firebase Auth + Supabase Auth
- **Push Notifications**: Firebase Cloud Messaging

### Development Tools
- **Linting**: ESLint 9.32
- **Type Safety**: TypeScript strict mode
- **Package Manager**: npm with legacy peer deps

## 📊 Performance Metrics

- **Database Queries**: 98.7% reduction (from 152 to 2 on page load)
- **Cache Hit Rate**: 100% on subsequent page loads
- **Page Load Time**: <2 seconds (first contentful paint)
- **Bundle Size**: 725 KB minified, 213 KB gzipped
- **Lighthouse Score**: 95+ on all metrics

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
- Supabase account and project ([sign up free](https://supabase.com))
- Firebase account for authentication and push notifications

### Database Setup (Required First Step!)

Before running the application, you **must** set up your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase_complete_schema.sql` from this repository
4. Copy and paste the entire contents into the SQL Editor
5. Click **Run** to create all tables, indexes, and policies

📖 **Detailed instructions**: See [SUPABASE_DATABASE_SETUP.md](./SUPABASE_DATABASE_SETUP.md)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd newsleak-hub

# Install dependencies
npm install --legacy-peer-deps

# Set up your Supabase database
# Follow the SUPABASE_DATABASE_SETUP.md guide to create all tables
# Or run the supabase_complete_schema.sql file in your Supabase SQL Editor

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Firebase credentials

# Start the development server
npm run dev
```

### Deploying the Edge Function

To enable proper image extraction from RSS feeds:

1. Install Supabase CLI: `npm install -g supabase`
2. Follow the [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)
3. Deploy the edge function: `supabase functions deploy fetchFeeds`

## 📚 Documentation

- **[🗄️ Database Setup Guide](./SUPABASE_DATABASE_SETUP.md)** - **START HERE** - Complete guide to set up your Supabase database
- [Production Setup Guide](./PRODUCTION_SETUP_GUIDE.md) - Complete deployment guide
- [Database Schema](./DATABASE_SCHEMA.md) - Full database documentation
- [API Documentation](./API_DOCUMENTATION.md) - API reference and usage
- [Performance Improvements](./PERFORMANCE_IMPROVEMENTS.md) - Optimization details
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to deploy edge functions
- [Supabase Setup](./SUPABASE_SETUP_GUIDE.md) - Database configuration (for article likes)

## 🎨 Features Documentation

### For Users
- Personalized news feed based on reading history
- Dark mode and text size customization
- Push notifications for breaking news
- Bookmark and save articles for later
- Comment and engage with articles
- Search and filter by categories

### For Admins
- Comprehensive analytics dashboard
- RSS feed management
- Push notification center
- Article management and moderation
- User management
- Real-time trending insights

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```sh
npm install -g vercel
vercel --prod
```

### Option 2: Netlify
```sh
npm install -g netlify-cli
netlify deploy --prod
```

### Option 3: Firebase Hosting
```sh
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy --only hosting
```

See [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

See `.env.example` for a complete list of environment variables.

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
- shadcn-ui - UI component library
- Tailwind CSS - Utility-first CSS framework
- Supabase - Backend and database
- Supabase Edge Functions - RSS feed processing and notifications
- Firebase - Authentication and push notifications
- Lucide React - Icon library

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
newsleak-hub/
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn-ui primitives
│   │   └── SEO.tsx     # SEO component
│   ├── hooks/          # Custom React hooks (including React Query hooks)
│   ├── lib/            # Utility functions and API clients
│   │   ├── newsAlgorithms.ts  # Trending & related articles
│   │   ├── pushNotifications.ts # FCM integration
│   │   └── supabaseClient.ts
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   └── ...         # User-facing pages
│   └── data/           # Static data and types
├── supabase/
│   ├── functions/      # Supabase Edge Functions
│   │   ├── fetchFeeds/ # RSS feed fetching with image extraction
│   │   └── sendNotification/ # Push notification service
│   └── migrations/     # Database migrations
├── public/             # Static assets
│   └── firebase-messaging-sw.js # Service worker for FCM
└── Documentation/
    ├── DATABASE_SCHEMA.md
    ├── API_DOCUMENTATION.md
    ├── PRODUCTION_SETUP_GUIDE.md
    └── ...
```

## 📖 Documentation

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
