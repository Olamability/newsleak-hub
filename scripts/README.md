# 📜 Newsleak Setup Scripts

This directory contains helper scripts to make setting up and maintaining your Newsleak installation easier.

---

## 🚀 Available Scripts

### 1. `quick-start.sh`
**Interactive setup wizard for new installations**

This script walks you through the entire setup process step by step.

**Usage:**
```bash
bash scripts/quick-start.sh
```

**What it does:**
- ✅ Checks Node.js installation
- ✅ Installs dependencies
- ✅ Creates .env file from template
- ✅ Tests build
- ✅ Provides next steps

**When to use:**
- First time setting up the project
- After cloning the repository
- When you want a guided setup

---

### 2. `verify-setup.sh`
**Verifies your local installation is correct**

Checks that all required files, dependencies, and configurations are in place.

**Usage:**
```bash
bash scripts/verify-setup.sh
```

**What it checks:**
- ✅ Node.js and npm versions
- ✅ Project dependencies (node_modules)
- ✅ Environment configuration (.env)
- ✅ Project structure
- ✅ Supabase files
- ✅ Build output

**When to use:**
- After setup to verify everything is correct
- Before deploying to production
- When troubleshooting issues
- After pulling updates from Git

**Exit codes:**
- `0` - All checks passed
- `1` - Some checks failed (needs attention)

---

### 3. `verify-database.sql`
**SQL script to verify database setup**

Run this in Supabase SQL Editor to verify your database is correctly configured.

**Usage:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `scripts/verify-database.sql`
4. Paste and Run

**What it checks:**
- ✅ All 15 tables exist
- ✅ Default categories loaded (8 categories)
- ✅ Indexes created (80+)
- ✅ RLS policies active (21+)
- ✅ Triggers created (10+)
- ✅ Functions created (5+)
- ✅ Views created (2+)
- ✅ Admin users exist
- ✅ RSS feeds configured
- ✅ Articles exist

**When to use:**
- After running database schema
- Before deploying to production
- When troubleshooting database issues
- After database migrations

---

### 4. `seed-data.sql`
**Adds sample data for testing**

Populates your database with sample RSS feeds, tags, and test users.

**⚠️ WARNING:** This is for development/testing only. Don't use in production!

**Usage:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `scripts/seed-data.sql`
4. Paste and Run

**What it adds:**
- 17 RSS feeds from popular news sources
- 10 common tags
- 1 test admin user (requires Firebase UID update)
- 1 test regular user
- Sample user preferences

**When to use:**
- In development environment
- For testing features
- For demo purposes

**Note:** Remember to update the admin user's `auth_uid` with your actual Firebase UID!

---

## 📖 Usage Examples

### Complete Setup Flow

```bash
# 1. Clone repository
git clone https://github.com/Olamability/newsleak-hub.git
cd newsleak-hub

# 2. Run quick start
bash scripts/quick-start.sh

# 3. Set up database (in Supabase SQL Editor)
# - Run: supabase_complete_schema.sql
# - Run: scripts/verify-database.sql

# 4. (Optional) Add seed data
# - Run: scripts/seed-data.sql

# 5. Verify setup
bash scripts/verify-setup.sh

# 6. Start development
npm run dev
```

### Before Production Deployment

```bash
# Verify everything is ready
bash scripts/verify-setup.sh

# Check database
# Run verify-database.sql in Supabase SQL Editor

# Build for production
npm run build

# Deploy
vercel --prod
# or
netlify deploy --prod
```

### Troubleshooting

```bash
# Check if setup is correct
bash scripts/verify-setup.sh

# If dependencies are wrong
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# If .env is missing/incorrect
cp .env.example .env
# Edit .env with your credentials

# If database has issues
# Run verify-database.sql in Supabase SQL Editor
```

---

## 🛠️ Script Maintenance

### Adding New Scripts

1. Create script in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add documentation to this README
4. Test thoroughly
5. Commit to repository

### Script Naming Convention

- Use kebab-case: `my-script.sh`
- Descriptive names: `verify-setup.sh` not `check.sh`
- Add `.sh` extension for shell scripts
- Add `.sql` extension for SQL scripts

---

## 🔍 Troubleshooting Scripts

### Script won't run

```bash
# Make sure it's executable
chmod +x scripts/script-name.sh

# Run with bash explicitly
bash scripts/script-name.sh
```

### Permission denied

```bash
# Fix permissions
chmod +x scripts/*.sh
```

### Command not found

Make sure you're in the project root directory:
```bash
cd /path/to/newsleak-hub
bash scripts/script-name.sh
```

---

## 📚 Related Documentation

- [COMPLETE_SETUP_GUIDE.md](../COMPLETE_SETUP_GUIDE.md) - Full setup guide
- [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [README.md](../README.md) - Project overview
- [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Database documentation

---

## 🤝 Contributing

To improve these scripts:

1. Test your changes thoroughly
2. Update this README
3. Add comments in the script
4. Submit a pull request

---

## 📞 Support

If scripts don't work as expected:

1. Check this README for usage instructions
2. Run with `-x` flag for debugging: `bash -x scripts/script-name.sh`
3. Check error messages carefully
4. Review COMPLETE_SETUP_GUIDE.md
5. Create a GitHub issue with error details

---

**Last Updated:** December 2024  
**Maintained by:** Newsleak Team
