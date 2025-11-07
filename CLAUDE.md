# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的 SaaS 应用启动模板，采用 Turborepo monorepo 架构，使用 TypeScript、Drizzle ORM、Better Auth 和 Prisma 构建。

## 常用命令

### 开发环境
```bash
pnpm dev                    # 启动开发服务器（使用 Turbo 并发运行，--concurrency 15）
pnpm build                  # 构建生产环境（使用 dotenv 加载环境变量）
pnpm start                  # 启动生产服务器
```

### 数据库操作
```bash
pnpm --filter database push            # 推送 Prisma schema 变更到数据库（开发环境）
pnpm --filter database studio          # 打开 Prisma Studio 数据库管理界面
pnpm --filter database generate        # 生成 Prisma Client 和 Zod 类型
pnpm --filter database migrate         # 创建并执行数据库迁移（开发环境）
pnpm --filter database migrate:deploy  # 执行数据库迁移（生产环境）
```

### 代码质量
```bash
pnpm lint                   # 使用 Biome 进行 lint 检查
pnpm format                 # 使用 Biome 格式化代码
pnpm --filter web type-check # 类型检查（针对 web 应用）
```

### 测试
```bash
pnpm --filter web e2e       # 运行 Playwright E2E 测试（UI 模式）
pnpm --filter web e2e:ci    # CI 环境下运行 E2E 测试
```

### 工具脚本
```bash
pnpm --filter scripts create:user  # 创建管理员用户（使用 create_admin.js）
pnpm clean                         # 清理所有构建产物
```

### UI 组件
```bash
pnpm --filter web shadcn-ui  # 添加 Shadcn UI 组件
```

## 架构说明

### Monorepo 结构

项目使用 pnpm workspace + Turborepo 管理，主要分为三个部分：

- **apps/web**: Next.js 15 应用（App Router）
- **packages/**: 共享包
  - `auth`: Better Auth 认证配置和逻辑
  - `database`: Prisma ORM schema 和客户端
  - `mail`: 邮件服务（支持多种提供商：Nodemailer, Resend, Plunk, Postmark, Mailgun）
  - `payments`: 支付集成（支持 Lemonsqueezy, Stripe, Chargebee, Creem, Polar）
  - `storage`: S3 兼容的文件存储
  - `api`: API 路由和 Hono 集成
  - `ai`: AI 功能集成
  - `i18n`: 国际化配置（next-intl）
  - `logs`: 日志系统
  - `utils`: 工具函数
- **config/**: 全局配置（config/index.ts）
- **tooling/**: 开发工具配置

### 路由架构

Next.js App Router 采用路由组（Route Groups）设计：

- `(marketing)/[locale]/`: 营销页面（支持国际化）
  - 首页、博客、文档、法律页面、联系表单
- `(saas)/auth/`: 认证相关页面
  - login, signup, verify, forgot-password, reset-password
- `(saas)/app/`: 应用核心功能
  - `(account)/`: 用户账户管理
    - settings: 通用设置、安全、账单、危险区域
    - admin: 管理员面板（用户和组织管理）
    - chatbot: AI 聊天功能
  - `(organizations)/`: 组织管理
    - `[organizationSlug]/`: 组织特定页面
    - settings: 组织设置（成员、账单、通用、危险区域）

### 认证系统（Better Auth）

核心配置在 `packages/auth/auth.ts`：

- **认证方式**:
  - 邮箱密码登录（可配置是否需要邮箱验证）
  - Magic Link
  - 社交登录（Google, GitHub）
  - Passkey
  - 双因素认证（2FA）
- **特性**:
  - 基于邀请的注册（invitationOnlyPlugin）
  - 组织管理（organization plugin）
  - 管理员权限（admin plugin）
  - 用户名支持
- **Hooks**:
  - `before`: 删除用户/组织前自动取消订阅
  - `after`: 接受邀请/移除成员后更新组织订阅席位数

### 数据库架构

- **ORM**: Prisma（schema 定义和查询）
- **数据库**: PostgreSQL（通过 Docker Compose 运行在 5433 端口）
- **核心表**: User, Account, Session, Organization, Member, Invitation, Purchase, AiChat
- **适配器**: Better Auth 使用 Prisma Adapter
- **类型生成**:
  - `prisma generate` - 生成 Prisma Client
  - `zod-prisma-types` - 自动生成 Zod 校验 schema
  - `prisma-json-types-generator` - JSON 字段类型支持

### 配置系统（config/index.ts）

集中式配置文件控制所有功能开关：

- **i18n**: 启用/禁用国际化，支持的语言和货币
- **organizations**: 是否启用组织、组织账单、用户创建权限
- **users**: 用户账单、入职流程
- **auth**: 注册开关、登录方式、会话时长、重定向路径
- **ui**: 主题、Sidebar 布局、营销/SaaS 功能开关
- **payments**: 定价计划（free, pro, lifetime, enterprise）

### Turbo 任务依赖

关键依赖关系（turbo.json）：

- `dev`: 依赖 `^generate`（先生成 Prisma Client 和类型）
- `build`: 依赖 `^generate` 和 `^build`（自下而上构建）
- `start`: 依赖 `^generate` 和 `^build`

## 重要约定

### 环境变量
必需的环境变量（参考 .env.local.example）：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `BETTER_AUTH_SECRET`: 认证密钥
- `NEXT_PUBLIC_SITE_URL`: 站点 URL
- 邮件服务配置（SMTP 或第三方提供商）
- 支付提供商配置（至少一个）
- 产品价格 ID（NEXT_PUBLIC_PRICE_ID_*）

### 代码规范
- 使用 **Biome** 而非 ESLint/Prettier 进行 lint 和格式化
- 禁用规则：
  - `noExplicitAny`
  - `noArrayIndexKey`
  - `noForEach`
  - `useExhaustiveDependencies`
- 强制规则：`noUnusedImports` (error)

### 包管理
- 使用 **pnpm** 作为包管理器（版本 9.3.0）
- 工作区协议：`workspace:*`
- 使用 `--filter` 针对特定包运行命令

### 类型安全
- 所有包都使用 TypeScript（要求 Node.js >= 20）
- Better Auth 类型推导：`typeof auth.$Infer.Session`
- Prisma 提供类型安全的查询和自动完成
- Zod schema 自动从 Prisma schema 生成（用于 API 验证）

## 本地开发流程

1. 启动数据库：`docker-compose up -d`（PostgreSQL 在 localhost:5433）
2. 配置环境变量：复制 `.env.local.example` 为 `.env.local` 并填写
3. 推送数据库 schema：`pnpm --filter database push`
4. 启动开发服务器：`pnpm dev`
5. 访问 http://localhost:3000

## 数据库管理

- 修改 schema：编辑 `packages/database/prisma/schema.prisma`
- 推送变更：`pnpm --filter database push`（开发环境，直接同步 schema 到数据库）
- 生成 Client：`pnpm --filter database generate`（生成 Prisma Client 和 Zod 类型）
- 创建迁移：`pnpm --filter database migrate`（生产环境，创建迁移文件）
- 部署迁移：`pnpm --filter database migrate:deploy`（生产环境，执行迁移）
- 查看数据：`pnpm --filter database studio`（打开 Prisma Studio）

### Prisma 工作流程

**开发环境**：
1. 修改 `schema.prisma`
2. 运行 `pnpm --filter database push` - 快速原型设计，直接同步到数据库
3. 运行 `pnpm --filter database generate` - 生成类型

**生产环境**：
1. 修改 `schema.prisma`
2. 运行 `pnpm --filter database migrate` - 创建迁移文件
3. 提交迁移文件到版本控制
4. 部署时运行 `pnpm --filter database migrate:deploy`

## 国际化 (i18n)

- 使用 **next-intl** 库
- 语言通过 URL 参数 `[locale]` 传递（如 `/en/`, `/de/`）
- 默认语言在 `config/index.ts` 中配置
- 认证邮件会根据用户语言 cookie 发送对应语言版本

## 支付集成

- 支持多种支付提供商（通过 `packages/payments`）
- 订阅管理：
  - 用户/组织删除时自动取消订阅（auth hooks）
  - 组织成员变动时自动更新席位数（`updateSeatsInOrganizationSubscription`）
- 产品价格配置在 `config/index.ts` 的 `payments.plans`

## 特殊注意事项

- **Docker 数据库端口**: 5433（避免与本地 PostgreSQL 冲突）
- **Better Auth 适配器**: 使用 Prisma Adapter
- **ID 生成**: 禁用 Better Auth 自动 ID 生成（`generateId: false`），由 Prisma 使用 cuid() 处理
- **账户关联**: 启用 Google 和 GitHub 的账户关联（`accountLinking.enabled`）
- **禁止的组织 slug**: 避免与路由冲突（定义在 `config.organizations.forbiddenOrganizationSlugs`）
- **Prisma Schema 位置**: `packages/database/prisma/schema.prisma`
- **生成的文件**:
  - Prisma Client: `node_modules/.prisma/client`
  - Zod schemas: `packages/database/prisma/zod`
  - Queries: `packages/database/prisma/queries`
