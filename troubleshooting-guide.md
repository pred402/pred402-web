# supastarter Implementation Troubleshooting Guide

## 📋 Overview

This document chronicles the errors encountered during the supastarter implementation process, their root causes, solutions applied, and preventive measures for future setups.

## 🔄 Database Migration: SQLite → PostgreSQL

### ❌ **Error 1: Prisma PostgreSQL Type Conflicts**
```
error: Native type Text is not supported for sqlite connector.
  -->  prisma/schema.prisma:79
   |     accessToken  String?   @db.Text
```

**What Went Wrong:**
- Attempted to use PostgreSQL-specific column types (`@db.Text`) with SQLite database
- Prisma schema was configured for PostgreSQL but SQLite was selected as provider

**Root Cause:**
- Mixed ORM configurations (Prisma vs Drizzle)
- Incompatible schema definitions between database types

**Solution Applied:**
```bash
# 1. Switched from Prisma to Drizzle ORM
# Changed packages/database/index.ts:
export * from "./drizzle"; // instead of "./prisma"

# 2. Updated Drizzle client for PostgreSQL
# packages/database/drizzle/client.ts:
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/postgres";

# 3. Updated Drizzle config
# packages/database/drizzle.config.json:
{
  "dialect": "postgresql",
  "schema": "./drizzle/schema/postgres.ts",
  "dbCredentials": {
    "url": "postgresql://postgres:password@localhost:5433/supastarter"
  }
}
```

**Prevention:**
- Choose ORM strategy upfront (Drizzle vs Prisma)
- Test database schema compatibility before migration
- Use database-agnostic schema designs when possible

---

### ❌ **Error 2: Missing PostgreSQL Driver**
```
Error: Could not locate the bindings file. Tried:
→ /root/superstar/apps/web/.next/build/better_sqlite3.node
```

**What Went Wrong:**
- Drizzle client was configured for `better-sqlite3` (SQLite) but PostgreSQL was needed
- Missing `pg` (PostgreSQL) package for Node.js

**Root Cause:**
- Incomplete dependency installation
- Mismatched database driver configuration

**Solution Applied:**
```bash
# 1. Removed SQLite dependencies
pnpm remove better-sqlite3 --filter @repo/database

# 2. Updated client to use PostgreSQL
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/postgres";

const db = drizzle(databaseUrl, { schema });
```

**Prevention:**
- Install database drivers immediately after choosing database type
- Verify driver compatibility with ORM version
- Test database connections early in setup process

---

### ❌ **Error 3: Drizzle Config File Issues**
```
No config path provided, using default 'drizzle.config.json'
drizzle.config.json file does not exist
```

**What Went Wrong:**
- Drizzle CLI expected JSON config but only TypeScript config existed
- Incorrect config file naming and location

**Root Cause:**
- Drizzle has different config file expectations than Prisma
- Mixed configuration approaches

**Solution Applied:**
```bash
# Created proper JSON config file
# packages/database/drizzle.config.json:
{
  "dialect": "postgresql",
  "schema": "./drizzle/schema/postgres.ts",
  "dbCredentials": {
    "url": "postgresql://postgres:password@localhost:5433/supastarter"
  }
}
```

**Prevention:**
- Follow Drizzle documentation exactly for config files
- Use consistent config formats across development team
- Test CLI commands with config files before full implementation

---

### ❌ **Error 4: Port Conflict with PostgreSQL**
```
failed to set up container networking: driver failed programming external connectivity on endpoint supastarter_postgres: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**What Went Wrong:**
- PostgreSQL Docker container tried to use port 5432, but another PostgreSQL instance was already running
- Existing Supabase local development setup was using the same port

**Root Cause:**
- Multiple PostgreSQL instances running simultaneously
- Docker Compose port allocation conflicts

**Solution Applied:**
```yaml
# docker-compose.yml - Changed port mapping
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

**Prevention:**
- Check existing services before starting new containers
- Use unique ports for different database instances
- Document port assignments in development environment

---

## 📧 SMTP Email Configuration Issues

### ❌ **Error 5: Environment Variables Not Loading**
```
MAIL_HOST: undefined
MAIL_PORT: undefined
MAIL_USER: undefined
MAIL_PASS: not set
```

**What Went Wrong:**
- Test script ran outside of pnpm/dev environment
- Environment variables from `.env.local` not loaded
- dotenv not configured for standalone script execution

**Root Cause:**
- Development environment isolation
- Missing dotenv configuration in test script

**Solution Applied:**
```javascript
// test_email.js
import { config } from "dotenv";
config({ path: ".env.local" }); // Load environment variables

// Then run with: tsx test_email.js
```

**Prevention:**
- Always test email functionality within the application runtime
- Use proper environment loading in standalone scripts
- Document environment variable requirements clearly

---

### ❌ **Error 6: SSL Connection Issues**
```
connect ECONNREFUSED 127.0.0.1:465
```

**What Went Wrong:**
- SMTP port 465 requires SSL/TLS but Nodemailer wasn't configured for secure connection
- Missing `secure: true` in transporter configuration

**Root Cause:**
- Incomplete SMTP security configuration
- Port 465 vs 587 misunderstanding (both can be secure)

**Solution Applied:**
```typescript
// packages/mail/src/provider/nodemailer.ts
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST as string,
    port: Number.parseInt(process.env.MAIL_PORT as string, 10),
    secure: true, // Enable SSL/TLS
    auth: {
        user: process.env.MAIL_USER as string,
        pass: process.env.MAIL_PASS as string,
    },
});
```

**Prevention:**
- Research SMTP port requirements (465 = SSL, 587 = STARTTLS)
- Test SMTP connections with telnet/nc before implementation
- Use secure connections by default for production

---

## 📦 Package Management Issues

### ❌ **Error 7: pnpm Workspace Conflicts**
```
ERR_PNPM_ADDING_TO_ROOT Running this command will add the dependency to the workspace root
```

**What Went Wrong:**
- Attempted to install packages at workspace root instead of specific packages
- pnpm workspace structure requires explicit package targeting

**Root Cause:**
- Unfamiliarity with pnpm workspace commands
- Missing package filter flags

**Solution Applied:**
```bash
# Install to specific package
pnpm add dotenv --filter @repo/database

# Or install to workspace root explicitly
pnpm add -w dotenv
```

**Prevention:**
- Learn pnpm workspace commands thoroughly
- Use `--filter` flags for package-specific installations
- Document package installation patterns

---

## ⚠️ Next.js Build Warnings

### ❌ **Error 8: External Package Resolution**
```
⚠ Package pg can't be external
The request pg matches serverExternalPackages (or the default list).
The request could not be resolved by Node.js from the project directory.
```

**What Went Wrong:**
- PostgreSQL `pg` package marked as external but not installed at project root
- Next.js server-side package resolution issues

**Root Cause:**
- Server-side package installation requirements
- Next.js external package handling

**Solution Applied:**
```bash
# Install pg package at workspace root
pnpm add -w pg
```

**Prevention:**
- Install server-side database packages at root level
- Monitor Next.js build warnings carefully
- Understand server vs client package requirements

---

## 🔧 Development Environment Issues

### ❌ **Error 9: Drizzle Schema Malformation**
```
drizzle/meta/0000_snapshot.json data is malformed
```

**What Went Wrong:**
- Drizzle migration snapshots corrupted during database switching
- Schema changes between SQLite and PostgreSQL caused conflicts

**Root Cause:**
- Incomplete cleanup between database migrations
- Schema incompatibility between database types

**Solution Applied:**
```bash
# Clear Drizzle metadata and regenerate
rm -rf packages/database/drizzle/meta/
pnpm --filter database push  # Recreate schema
```

**Prevention:**
- Clean migration history when switching databases
- Backup database state before major changes
- Test migrations on clean database instances

---

## 🛠️ Development Tools Issues

### ❌ **Error 10: pnpm Installation Issues**
```
Command 'pnpm' not found, did you mean: command 'npm'
```

**What Went Wrong:**
- pnpm not installed on system
- PATH not configured for pnpm binaries

**Root Cause:**
- Missing package manager installation
- Environment setup incomplete

**Solution Applied:**
```bash
# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Configure PATH
export PATH="$HOME/.local/share/pnpm:$PATH"
```

**Prevention:**
- Include package manager in system setup documentation
- Verify tool installation before project setup
- Document PATH configuration requirements

---

## 📊 Error Frequency & Impact Analysis

| Error Category | Frequency | Impact Level | Difficulty to Resolve |
|----------------|-----------|--------------|----------------------|
| Database Migration | High | Critical | Medium |
| Package Management | High | Medium | Low |
| Environment Config | Medium | High | Low |
| SMTP Configuration | Medium | Medium | Medium |
| Build Warnings | Low | Low | Low |
| Development Tools | Low | High | Low |

## 🎯 Key Lessons Learned

### 1. **Database Choice Impacts Everything**
- Choose database early in project lifecycle
- Consider migration complexity when selecting ORM
- Test database operations thoroughly

### 2. **Environment Management is Critical**
- Document all environment variable requirements
- Test in correct runtime environment
- Use proper dotenv configuration

### 3. **Package Management Requires Care**
- Understand workspace structure deeply
- Use correct package installation commands
- Monitor for dependency conflicts

### 4. **SMTP Configuration Needs Testing**
- Test email functionality early
- Understand SMTP security requirements
- Verify credentials before implementation

### 5. **Build Warnings Are Important**
- Don't ignore Next.js build warnings
- Address external package issues promptly
- Monitor for performance implications

## 🛡️ Prevention Checklist

### Before Starting Setup:
- [ ] Verify all required tools are installed (Node.js, pnpm, Git)
- [ ] Check for conflicting services on standard ports
- [ ] Review system resource requirements
- [ ] Backup existing development environments

### During Database Setup:
- [ ] Choose database type based on project requirements
- [ ] Install appropriate database drivers immediately
- [ ] Test database connections before proceeding
- [ ] Document port assignments and configurations

### During Package Installation:
- [ ] Use correct pnpm workspace commands
- [ ] Install server-side packages at root level
- [ ] Verify package compatibility with project versions
- [ ] Test package functionality after installation

### During Configuration:
- [ ] Set environment variables correctly
- [ ] Test configurations in development environment
- [ ] Document configuration changes
- [ ] Backup working configurations

### During Testing:
- [ ] Test all functionality in correct runtime
- [ ] Monitor for build warnings and errors
- [ ] Verify external service integrations
- [ ] Document successful configurations

## 🚀 Quick Recovery Commands

### Database Issues:
```bash
# Reset Drizzle migrations
rm -rf packages/database/drizzle/meta/
pnpm --filter database push

# Restart PostgreSQL container
docker-compose down && docker-compose up -d
```

### Environment Issues:
```bash
# Reload environment
source ~/.bashrc
pnpm dev

# Check environment variables
grep "VAR_NAME" .env.local
```

### Package Issues:
```bash
# Clear node_modules and reinstall
rm -rf node_modules && pnpm install

# Install missing packages
pnpm add -w pg dotenv
```

### SMTP Issues:
```bash
# Test SMTP connection
telnet your-smtp-host 465

# Verify environment variables
tsx -e "console.log(process.env.MAIL_HOST)"
```

---

## 📞 Support & Documentation

**Internal Resources:**
- `/root/superstar/supastarter-analysis.md` - Complete project analysis
- `/root/superstar/troubleshooting-guide.md` - This guide

**External Resources:**
- [supastarter.dev/docs/nextjs](https://supastarter.dev/docs/nextjs) - Official documentation
- [Drizzle ORM Docs](https://orm.drizzle.team/) - Database documentation
- [Nodemailer Docs](https://nodemailer.com/) - Email documentation

**Key Takeaway:** Most errors stem from configuration mismatches between different system components. Thorough testing at each step prevents cascading failures.
