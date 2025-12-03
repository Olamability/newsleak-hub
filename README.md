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

## 🔧 Recent Fixes (December 2024)

**Database & RSS Feed Issues Resolved** - See [FIX_SUMMARY.md](./FIX_SUMMARY.md) for complete details.

### Critical Issues Fixed
- 🚨 **Security**: Fixed service_role key exposure in client code
- ✅ **Configuration**: Standardized environment variable names
- ✅ **Firebase**: Moved hardcoded credentials to environment variables
- ✅ **RSS Parsing**: Improved edge function with proper XML parsing
- ✅ **Error Handling**: Added fail-fast validation for missing config

### New Documentation for Setup
- 📘 **[QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md)** - 5-minute quick fix guide
- 📘 **[BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)** - Comprehensive backend setup
- 📘 **[EXACT_SETUP_DATA.md](./EXACT_SETUP_DATA.md)** - Project-specific setup values
- 🚀 **[scripts/deploy-edge-functions.sh](./scripts/deploy-edge-functions.sh)** - Automated deployment

**If you're experiencing database connection or RSS feed issues**, see:
1. [QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md) for immediate fixes
2. [FIX_SUMMARY.md](./FIX_SUMMARY.md) for what was changed

## Quick Start

### 🚀 Automated Setup (Recommended for Beginners)

The easiest way to get started:

```sh
# Clone the repository
git clone https://github.com/Olamability/newsleak-hub.git
cd newsleak-hub

# Run the interactive setup wizard
bash scripts/quick-start.sh
```

The script will guide you through:
1. ✅ Checking Node.js installation
2. ✅ Installing dependencies
3. ✅ Creating .env configuration
4. ✅ Testing the build
5. ✅ Next steps guidance

**After the automated setup**, follow the **[Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)** to:
- Set up your Supabase database
- Configure Firebase authentication
- Deploy to production

### 📖 Manual Setup

If you prefer manual setup or are experienced:

#### Prerequisites
- Node.js 18+ & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account and project ([sign up free](https://supabase.com))
- Firebase account for authentication and push notifications

#### Installation Steps

```sh
# 1. Clone the repository
git clone https://github.com/Olamability/newsleak-hub.git
cd newsleak-hub

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see COMPLETE_SETUP_GUIDE.md)

# 4. Set up database (in Supabase SQL Editor)
# Run the contents of: supabase_complete_schema.sql

# 5. Verify setup
bash scripts/verify-setup.sh

# 6. Start development server
npm run dev
```

## 📚 Documentation

### 🌟 Getting Started (Read These First!)
- **[📘 Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)** - **START HERE!** - Step-by-step guide for absolute beginners
- **[⚡ Quick Start Backend](./QUICK_START_BACKEND.md)** - **NEW!** - Quick fix for database/RSS issues
- **[🔧 Fix Summary](./FIX_SUMMARY.md)** - **NEW!** - Recent fixes and improvements
- **[✅ Production Checklist](./PRODUCTION_CHECKLIST.md)** - Pre-deployment checklist
- **[🔧 Scripts README](./scripts/README.md)** - Helper scripts documentation

### Database & Backend
- **[Backend Setup Guide](./BACKEND_SETUP_GUIDE.md)** - **NEW!** - Comprehensive backend configuration
- **[Exact Setup Data](./EXACT_SETUP_DATA.md)** - **NEW!** - Project-specific setup values
- [Database Setup Guide](./SUPABASE_DATABASE_SETUP.md) - Supabase database setup
- [Database Schema](./DATABASE_SCHEMA.md) - Complete schema documentation
- [Production Setup Guide](./PRODUCTION_SETUP_GUIDE.md) - Advanced deployment guide
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions

### API & Integration
- [API Documentation](./API_DOCUMENTATION.md) - API reference and usage
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Edge functions deployment
- [Supabase Setup](./SUPABASE_SETUP_GUIDE.md) - Additional Supabase configuration

### Performance & Optimization
- [Performance Improvements](./PERFORMANCE_IMPROVEMENTS.md) - Optimization details
- [Tech Stack](./TECH_STACK.md) - Technologies used

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
