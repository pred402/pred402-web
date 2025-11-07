# 🗄️ Database System

Complete documentation of the database setup, schema management, and migration from SQLite to PostgreSQL.

## 📋 Overview

The project uses **Drizzle ORM** with **PostgreSQL** for type-safe database operations and migrations.

### Tech Stack
- **Drizzle ORM**: Type-safe SQL query builder
- **PostgreSQL 15**: Primary database
- **Docker**: Containerized database for development
- **Drizzle Kit**: Migration and schema management

## 🏗️ Architecture

### Database Structure

```
packages/database/
├── drizzle/
│   ├── client.ts          # Database connection
│   ├── schema/            # Schema definitions
│   │   ├── postgres.ts    # PostgreSQL schema
│   │   └── sqlite.ts      # SQLite schema (legacy)
│   └── migrations/        # Generated migrations
├── drizzle.config.json    # Drizzle configuration
└── index.ts              # Main exports
```

### Schema Files

#### PostgreSQL Schema (`schema/postgres.ts`)

```typescript
import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  username: text("username").unique(),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  onboardingComplete: boolean("onboardingComplete").default(false),
  paymentsCustomerId: text("paymentsCustomerId"),
  locale: text("locale"),
});
```

## ⚙️ Configuration

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/supastarter"
```

### Drizzle Configuration (`drizzle.config.json`)

```json
{
  "dialect": "postgresql",
  "schema": "./drizzle/schema/postgres.ts",
  "dbCredentials": {
    "url": "postgresql://postgres:password@localhost:5433/supastarter"
  }
}
```

### Database Client (`client.ts`)

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(databaseUrl, {
  schema,
});
```

## 🐳 Docker Setup

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: supastarter_postgres
    environment:
      POSTGRES_DB: supastarter
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"  # Host:Container port mapping
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Starting Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Check container status
docker ps | grep postgres

# View container logs
docker logs supastarter_postgres
```

### Database Connection Details

- **Host**: `localhost`
- **Port**: `5433` (mapped from container port 5432)
- **Database**: `supastarter`
- **Username**: `postgres`
- **Password**: `password`

## 🔄 Migration Process

### From SQLite to PostgreSQL

The project was originally configured with SQLite but migrated to PostgreSQL for production readiness.

#### Migration Steps

1. **Initial SQLite Setup**
   - Used `better-sqlite3` package
   - File-based database (`database.db`)

2. **Migration to PostgreSQL**
   - Switched to `pg` (node-postgres) package
   - Containerized PostgreSQL database
   - Updated schema definitions

#### Code Changes Required

**Database Client** (`packages/database/drizzle/client.ts`):
```typescript
// Before (SQLite)
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
const sqlite = new Database("database.db");
export const db = drizzle(sqlite, { schema });

// After (PostgreSQL)
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/postgres";
const databaseUrl = process.env.DATABASE_URL;
export const db = drizzle(databaseUrl, { schema });
```

**Schema Imports** (`packages/database/index.ts`):
```typescript
// Before
export * from "./drizzle";

// After (same, but schema changed internally)
export * from "./drizzle";
```

**Authentication Adapter** (`packages/auth/auth.ts`):
```typescript
// Before
import { prismaAdapter } from "better-auth/adapters/prisma";

// After
import { drizzleAdapter } from "better-auth/adapters/drizzle";
```

## 🛠️ Database Operations

### Schema Management

#### Generate Migrations

```bash
# Generate migration files
pnpm --filter database generate

# This creates migration files in packages/database/drizzle/migrations/
```

#### Push Schema Changes

```bash
# Push schema to database (creates/modifies tables)
pnpm --filter database push
```

#### View Database Studio

```bash
# Open Drizzle Studio (web interface)
pnpm --filter database studio
```

### Query Operations

#### Type-Safe Queries

```typescript
import { db } from "~/lib/database";
import { user } from "~/lib/database/schema";

// Find user by email
const users = await db
  .select()
  .from(user)
  .where(eq(user.email, "user@example.com"));

// Create new user
await db.insert(user).values({
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  emailVerified: false,
});

// Update user
await db
  .update(user)
  .set({ emailVerified: true })
  .where(eq(user.id, "user123"));
```

#### Relations and Joins

```typescript
import { user, session } from "~/lib/database/schema";

// Query with relations
const userWithSessions = await db
  .select()
  .from(user)
  .leftJoin(session, eq(user.id, session.userId))
  .where(eq(user.email, "user@example.com"));
```

## 📊 Database Tables

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `user` | User accounts | id, email, name, role |
| `session` | User sessions | id, userId, token, expiresAt |
| `account` | OAuth accounts | userId, providerId, accessToken |
| `organization` | Organizations | id, name, slug |
| `member` | Organization members | organizationId, userId, role |
| `invitation` | Organization invites | organizationId, email, role |
| `passkey` | Passkey authentication | userId, credentialId |
| `twoFactor` | 2FA settings | userId, secret |
| `verification` | Email verification | identifier, token |
| `aiChat` | AI chat sessions | userId, messages |
| `purchase` | Payment records | userId, type, amount |

### Table Relationships

```
user (1) ──── (many) session
user (1) ──── (many) account
user (1) ──── (many) member (many) ──── (1) organization
organization (1) ──── (many) invitation
user (1) ──── (many) passkey
user (1) ──── (many) twoFactor
user (1) ──── (many) verification
user (1) ──── (many) aiChat
user (1) ──── (many) purchase
```

## 🔍 Database Monitoring

### Connection Testing

```bash
# Test database connection
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "SELECT version();"

# Check table counts
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public';"
```

### Query Performance

```sql
-- Check slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Health Checks

```bash
# Check database connectivity
curl -f http://localhost:5433/health || echo "Database not responding"

# Check container health
docker ps | grep postgres | grep healthy
```

## 🔧 Maintenance Tasks

### Backup Database

```bash
# Create backup
docker exec supastarter_postgres pg_dump -U postgres supastarter > backup.sql

# Restore backup
docker exec -i supastarter_postgres psql -U postgres supastarter < backup.sql
```

### Reset Database

```bash
# Stop container and remove volumes
docker-compose down -v

# Restart with fresh database
docker-compose up -d

# Push schema
pnpm --filter database push
```

### Update Schema

```bash
# Make schema changes in drizzle/schema/postgres.ts

# Generate migration
pnpm --filter database generate

# Apply migration
pnpm --filter database push
```

## 🚀 Production Deployment

### Production Configuration

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Connection Pooling

For production, consider using connection pooling:

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
```

### Database Optimization

1. **Indexes**: Add indexes on frequently queried columns
2. **Connection Limits**: Configure appropriate connection limits
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
4. **Caching**: Implement caching for frequently accessed data

## 🧪 Testing

### Database Tests

```typescript
import { db } from "~/lib/database";
import { user } from "~/lib/database/schema";

describe("Database Tests", () => {
  it("should create user", async () => {
    const testUser = {
      id: "test123",
      name: "Test User",
      email: "test@example.com",
      emailVerified: false,
    };

    await db.insert(user).values(testUser);

    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, "test123"));

    expect(result[0]).toEqual(testUser);
  });
});
```

### Integration Tests

```typescript
// Test with real database
beforeAll(async () => {
  // Setup test database
});

afterAll(async () => {
  // Cleanup test data
});

describe("User Registration", () => {
  it("should register new user", async () => {
    // Test full registration flow
  });
});
```

## 📊 Monitoring & Metrics

### Key Metrics to Monitor

- **Connection Count**: Active database connections
- **Query Performance**: Slow query identification
- **Storage Usage**: Database size growth
- **Error Rates**: Failed queries and connections

### Logging

```typescript
// Enable query logging in development
export const db = drizzle(databaseUrl, {
  schema,
  logger: true, // Log all queries
});
```

## 🆘 Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if container is running
docker ps | grep postgres

# Check container logs
docker logs supastarter_postgres

# Test connection
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "SELECT 1;"
```

#### Schema Mismatch
```bash
# Reset and push schema
pnpm --filter database push --force

# Or manually drop and recreate
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm --filter database push
```

#### Migration Errors
```bash
# Clear migration history
rm -rf packages/database/drizzle/migrations

# Regenerate schema
pnpm --filter database generate
pnpm --filter database push
```

#### Permission Errors
```sql
-- Grant permissions if needed
GRANT ALL PRIVILEGES ON DATABASE supastarter TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

## 📚 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

---

## 🎯 Summary

The database system provides:

- ✅ **Type-Safe Operations**: Drizzle ORM with full TypeScript support
- ✅ **Production Ready**: PostgreSQL with Docker containerization
- ✅ **Migration Support**: Schema versioning and updates
- ✅ **Development Tools**: Drizzle Studio for database management
- ✅ **Scalable Architecture**: Connection pooling and optimization
- ✅ **Comprehensive Monitoring**: Health checks and performance metrics
