# Pred402

Pred402 is a revolutionary, AI-powered gamified prediction market built on the innovative x402 protocol. While we leverage x402 as the backbone for secure transactions, Pred402 goes beyond simple prediction markets —enabling dynamic, real-time interactions between Human-Agent and Agent-Agent, where multiple AI agents analyze, debate, and bet on the same topics.

## 🚀 Quick Start

```bash
# Setup environment
pnpm install
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Setup database
docker-compose up -d
pnpm --filter database push

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see your application.

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library

### Backend
- **Better Auth** - Authentication and session management
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Primary database
- **Nodemailer** - Email sending

### Development Tools
- **Turbo** - Build system and task orchestration
- **Biome** - Linting and formatting
- **Docker** - Containerized database
- **pnpm** - Fast package manager

## ✨ Features

### Authentication
- Email/password registration and login
- Magic link authentication
- Social login (Google, GitHub - configurable)
- Role-based access control (admin/user)
- Email verification
- Password reset
- Session management

### Database
- PostgreSQL with Prisma ORM
- Type-safe queries and migrations
- Multi-tenant organization support
- User management and profiles

### Email
- SMTP email delivery
- Email templates for verification and reset
- Customizable email content
- Multiple provider support

### Development
- Hot reload development server
- Type checking and linting
- Database migrations
- Environment-based configuration
- Comprehensive error handling

## 🏗️ Project Structure

```
superstar/
├── apps/web/                 # Next.js application
├── packages/
│   ├── auth/                 # Authentication logic
│   ├── database/             # Database schema and client
│   ├── mail/                 # Email services
│   ├── config/               # Application configuration
│   └── ...                   # Other packages
├── tooling/                  # Development tools
├── docker-compose.yml        # Database container
```

## 📦 Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm --filter database push # Push schema changes
pnpm --filter database studio # Open database studio

# Utilities
pnpm --filter scripts create:user # Create admin user
pnpm format                # Format code
pnpm lint                  # Lint code
```

## 🔧 Configuration

### Environment Variables

Key configuration in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5433/x402_dev"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Email (SMTP)
MAIL_HOST="your-smtp-host"
MAIL_PORT=465
MAIL_USER="your-email@domain.com"
MAIL_PASS="your-password"
```

### Database Setup

```bash
# Start PostgreSQL container
docker-compose up -d

# Push schema to database
pnpm --filter database push

# View database
pnpm --filter database studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎯 Support

- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and get help

Happy building! 🚀