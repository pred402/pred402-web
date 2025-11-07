# 🔐 Authentication System

Complete documentation of the supastarter authentication system built with Better Auth.

## 📋 Overview

The authentication system provides:
- Email/password authentication
- Magic link login
- Social authentication (Google, GitHub)
- Role-based access control
- Session management
- Email verification and password reset

## 🏗️ Architecture

### Core Components

- **Better Auth**: Main authentication library
- **Drizzle ORM**: Database operations
- **Nodemailer**: Email delivery
- **Next.js Middleware**: Route protection

### Database Schema

```sql
-- Users table
CREATE TABLE "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean DEFAULT false,
  "image" text,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  "username" text UNIQUE,
  "role" text DEFAULT 'user',
  "banned" boolean DEFAULT false,
  "banReason" text,
  "banExpires" timestamp,
  "onboardingComplete" boolean DEFAULT false,
  "paymentsCustomerId" text,
  "locale" text
);

-- Sessions table
CREATE TABLE "session" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"("id"),
  "token" text NOT NULL UNIQUE,
  "expiresAt" timestamp NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now(),
  "impersonatedBy" text
);

-- Accounts table (for social login)
CREATE TABLE "account" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES "user"("id"),
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "accessToken" text,
  "refreshToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "idToken" text,
  "password" text,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);
```

## 🔧 Configuration

### Auth Configuration (`packages/auth/auth.ts`)

```typescript
export const auth = betterAuth({
  baseURL: appUrl,
  trustedOrigins: [
    appUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ],
  appName: config.appName,
  database: drizzleAdapter(db, {
    provider: "postgresql",
  }),
  // ... additional configuration
});
```

### Environment Variables

```env
# Required
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 🎯 Authentication Methods

### 1. Email & Password

#### Registration
```typescript
const { error } = await authClient.signUp.email({
  email,
  password,
  name,
  callbackURL: redirectPath,
});
```

#### Login
```typescript
const { error } = await authClient.signIn.email({
  email,
  password,
  callbackURL: redirectPath,
});
```

### 2. Magic Link

#### Send Magic Link
```typescript
const { error } = await authClient.signIn.magicLink({
  email,
  callbackURL: redirectPath,
});
```

#### Auto Sign-in (Invitation Only)
When `config.auth.enableSignup` is `false`, users can only sign up via invitations and are automatically signed in.

### 3. Social Authentication

#### Google OAuth
```typescript
const { error } = await authClient.signIn.social({
  provider: "google",
  callbackURL: redirectPath,
});
```

#### GitHub OAuth
```typescript
const { error } = await authClient.signIn.social({
  provider: "github",
  callbackURL: redirectPath,
});
```

## 👤 User Management

### User Object Structure

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "admin" | "user";
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

### Role-Based Access Control

#### Roles
- **`admin`**: Full system access, user management
- **`user`**: Standard user access

#### Checking Roles in Components

```typescript
import { useSession } from "~/lib/auth/client";

export function AdminPanel() {
  const { user } = useSession();

  if (user?.role !== "admin") {
    return <div>Access denied</div>;
  }

  return <div>Admin content</div>;
}
```

#### Server-Side Role Checking

```typescript
import { getSession } from "~/lib/auth/server";

export async function AdminPage() {
  const { session } = await getSession();

  if (session?.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return <div>Admin page</div>;
}
```

## 🔑 Session Management

### Session Object

```typescript
type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  impersonatedBy?: string;
};
```

### Using Sessions

#### Client-Side
```typescript
import { useSession } from "~/lib/auth/client";

export function Profile() {
  const { user, session } = useSession();

  if (!user) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Session expires: {session?.expiresAt}</p>
    </div>
  );
}
```

#### Server-Side
```typescript
import { getSession } from "~/lib/auth/server";

export async function ProtectedPage() {
  const { session, user } = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return <div>Protected content for {user.name}</div>;
}
```

## 📧 Email System

### Email Templates

The system includes pre-configured email templates:

- **Email Verification**: Sent after signup
- **Password Reset**: For password recovery
- **Magic Link**: For passwordless login
- **Organization Invitations**: For team invites

### Email Configuration

```typescript
// packages/mail/src/provider/nodemailer.ts
export const send: SendEmailHandler = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true, // SSL/TLS
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  // ... send email
};
```

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- Configurable complexity rules

### Session Security
- Secure HTTP-only cookies
- Configurable session expiration
- IP address tracking
- User agent logging

### Account Security
- Email verification required
- Password hashing with secure algorithms
- Account locking capabilities
- Ban system with expiration

## 🏢 Organizations & Teams

### Organization Structure

```typescript
type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
};

type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
};
```

### Organization Features
- Multi-tenant architecture
- Role-based organization permissions
- Invitation system
- Member management
- Subscription management per organization

## 🔧 API Endpoints

### Authentication Endpoints

All endpoints are available under `/api/auth/`:

- `POST /api/auth/sign-up/email` - Email signup
- `POST /api/auth/sign-in/email` - Email login
- `POST /api/auth/sign-in/magic-link` - Magic link login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

### Organization Endpoints

- `POST /api/auth/organization/create` - Create organization
- `POST /api/auth/organization/invite` - Invite member
- `POST /api/auth/organization/accept-invitation` - Accept invitation
- `POST /api/auth/organization/remove-member` - Remove member

## 🧪 Testing Authentication

### Manual Testing

1. **Signup Flow**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/sign-up/email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User","callbackURL":"/app"}'
   ```

2. **Login Flow**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/sign-in/email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","callbackURL":"/app"}'
   ```

3. **Session Check**:
   ```bash
   curl http://localhost:3001/api/auth/session
   ```

### Integration Testing

```typescript
// Example test
describe("Authentication", () => {
  it("should sign up user", async () => {
    const response = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toBeDefined();
  });
});
```

## 🚀 Production Deployment

### Environment Setup

```env
# Production environment
NODE_ENV=production
BETTER_AUTH_SECRET="your-production-secret"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Email
MAIL_HOST="smtp.yourprovider.com"
MAIL_PORT=587
MAIL_USER="noreply@yourdomain.com"
MAIL_PASS="your-smtp-password"
```

### Security Considerations

1. **HTTPS Required**: Always use HTTPS in production
2. **Secure Secrets**: Never commit secrets to version control
3. **Session Configuration**: Adjust session timeouts for production
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Monitoring**: Set up logging and monitoring for auth events

### Scaling Considerations

- **Database**: Ensure PostgreSQL can handle concurrent connections
- **Email**: Use dedicated email service for high volume
- **Sessions**: Consider Redis for session storage in distributed setups
- **CDN**: Use CDN for static assets

## 📊 Monitoring & Analytics

### Authentication Metrics

Track these key metrics:
- User registration rate
- Login success/failure rates
- Session duration
- Password reset requests
- Email delivery rates

### Error Monitoring

Monitor for:
- Failed login attempts
- Database connection issues
- Email delivery failures
- Session expiration issues

## 🆘 Troubleshooting

### Common Issues

#### "Invalid origin" Error
```typescript
// Add your domain to trustedOrigins
trustedOrigins: [
  "https://yourdomain.com",
  "http://localhost:3001", // for development
],
```

#### Database Connection Issues
```bash
# Check database connectivity
psql "$DATABASE_URL" -c "SELECT 1;"

# Restart database container
docker-compose restart postgres
```

#### Email Not Sending
```typescript
// Check SMTP configuration
console.log({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  user: process.env.MAIL_USER,
  // Don't log password
});
```

#### Session Not Persisting
```typescript
// Check cookie settings
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 days
  freshAge: 0,
},
```

## 📚 Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

## 🎯 Summary

The supastarter authentication system provides a complete, production-ready solution with:

- ✅ Multiple authentication methods
- ✅ Role-based access control
- ✅ Session management
- ✅ Email verification and password reset
- ✅ Social authentication
- ✅ Organization/team support
- ✅ Security best practices
- ✅ Production deployment ready
