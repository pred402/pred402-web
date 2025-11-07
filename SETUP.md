# 🚀 Complete Setup Guide

This guide covers the complete setup process for the supastarter project, including environment configuration, database setup, and troubleshooting.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 20+** installed
- **pnpm** package manager
- **Git** for version control
- **Docker** for database containerization

### Install pnpm (if not installed)

```bash
# Install pnpm globally
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Add to PATH
export PATH="$HOME/.local/share/pnpm:$PATH"
```

## 📦 1. Project Installation

### Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd superstar

# Install all dependencies
pnpm install
```

### Verify Installation

```bash
# Check pnpm version
pnpm --version

# Check Node.js version
node --version

# Verify workspace structure
pnpm ls
```

## ⚙️ 2. Environment Configuration

### Create Environment File

```bash
# Copy example environment file
cp .env.local.example .env.local
```

### Configure Environment Variables

Edit `.env.local` with your specific configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5433/supastarter"

# Application URLs
NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# Authentication Secrets
BETTER_AUTH_SECRET="a_very_secret_string_for_better_auth"

# OAuth Providers (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email Configuration (SMTP)
MAIL_HOST="www.mnassociatesint.com"
MAIL_PORT=465
MAIL_USER="erp@mnassociatesint.com"
MAIL_PASS="Erp1234@@@@"
SMTP_FROM_EMAIL="erp@mnassociatesint.com"
SMTP_FROM_NAME="MNR Associates International"
```

### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Frontend application URL | ✅ |
| `BETTER_AUTH_SECRET` | Secret key for authentication | ✅ |
| `MAIL_HOST` | SMTP server hostname | ✅ |
| `MAIL_PORT` | SMTP server port (465 for SSL) | ✅ |
| `MAIL_USER` | SMTP username | ✅ |
| `MAIL_PASS` | SMTP password | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ❌ |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | ❌ |

## 🗄️ 3. Database Setup

### Start PostgreSQL Container

```bash
# Start Docker container
docker-compose up -d

# Verify container is running
docker ps | grep postgres
```

### Database Configuration

The `docker-compose.yml` configures:
- PostgreSQL 15
- Database: `supastarter`
- Username: `postgres`
- Password: `password`
- Port mapping: `5433:5432` (host:container)

### Push Database Schema

```bash
# Push schema to database
pnpm --filter database push

# Verify tables were created
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "\dt"
```

Expected output should show 11 tables including `user`, `session`, `account`, etc.

## 🔐 4. Authentication Setup

### Create Admin User

```bash
# Create an admin user for testing
pnpm --filter scripts create:user
```

Follow the interactive prompts:
- Email: `admin@supastarter.dev`
- Name: `Super Admin`
- Role: `admin` (select yes)

### Verify Authentication

```bash
# Start development server
pnpm dev

# Test signup endpoint
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123","name":"Test User","callbackURL":"/app"}'
```

## 📧 5. Email Configuration

### SMTP Setup

The email system uses Nodemailer with SMTP. Configuration is in `.env.local`:

```env
MAIL_HOST="www.mnassociatesint.com"
MAIL_PORT=465  # SSL port
MAIL_USER="erp@mnassociatesint.com"
MAIL_PASS="Erp1234@@@@"
SMTP_FROM_EMAIL="erp@mnassociatesint.com"
SMTP_FROM_NAME="MNR Associates International"
```

### Test Email Sending

```bash
# Test email functionality
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"testpassword123","name":"Test User","callbackURL":"/app"}'
```

Check your email for verification messages.

## 🏃‍♂️ 6. Running the Application

### Development Mode

```bash
# Start all services
pnpm dev
```

The application will be available at:
- **Frontend**: `http://localhost:3001`
- **Database Studio**: `pnpm --filter database studio`

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🧪 7. Testing Setup

### Test Authentication Flow

1. Visit `http://localhost:3001/auth/signup`
2. Create a new account
3. Check email for verification
4. Login with credentials
5. Access protected routes

### Test Database Connection

```bash
# Test database connectivity
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "SELECT COUNT(*) FROM \"user\";"
```

### Test Email System

```bash
# Send test email via API
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test","callbackURL":"/app"}'
```

## 🔧 8. Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check if ports are in use
ss -tlnp | grep :300
ss -tlnp | grep :5433

# Kill conflicting processes
pkill -f "next dev"
docker-compose down && docker-compose up -d
```

#### Database Connection Issues
```bash
# Restart database container
docker-compose restart postgres

# Check container logs
docker logs supastarter_postgres

# Test connection
psql "postgresql://postgres:password@localhost:5433/supastarter" -c "SELECT version();"
```

#### Environment Variable Issues
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"

# Restart development server after env changes
pkill -f "next dev" && pnpm dev
```

### Database Reset

```bash
# Stop and remove container
docker-compose down -v

# Start fresh container
docker-compose up -d

# Push schema again
pnpm --filter database push
```

## 📊 9. Verification Checklist

- [ ] Node.js and pnpm installed
- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] PostgreSQL container running
- [ ] Database schema pushed
- [ ] Admin user created
- [ ] Development server starts
- [ ] Authentication works
- [ ] Email system functional
- [ ] Protected routes accessible

## 🚀 10. Next Steps

Once setup is complete:

1. **Customize Branding**: Update colors, logos, and messaging
2. **Configure OAuth**: Add Google/GitHub OAuth providers
3. **Setup Payments**: Configure Stripe or other payment providers
4. **Deploy**: Set up production deployment
5. **Monitor**: Add logging and error tracking

## 📞 Support

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review [STATUS.md](./STATUS.md) for current features
- Check individual service documentation for advanced configuration
