# 🚀 FYGS Learning Platform - Deployment Guide

This guide covers the complete deployment process for the FYGS Learning Platform, including all services and configurations.

## 📋 Prerequisites

- Node.js 22+ and pnpm (see `packageManager` in package.json)
- PostgreSQL database
- Stripe account (for payments)
- Email provider (Gmail, SendGrid, etc.)
- Vercel account (recommended) or any Node.js hosting

## 🔧 Environment Setup

### 1. Database Configuration

**PostgreSQL Setup:**
```sql
-- Create database
CREATE DATABASE fygs_learning_platform;

-- Create user (optional)
CREATE USER fygs_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fygs_learning_platform TO fygs_user;
```

**Environment Variables:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fygs_learning_platform"
```

### 2. Authentication Setup

**Better Auth Configuration:**
```env
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
BETTER_AUTH_URL="https://yourdomain.com"
```

**OAuth Providers:**

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Email Configuration

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password (not your regular password)

```env
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="FYGS Learning Platform"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

**SendGrid Setup (Alternative):**
```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
```

### 4. Stripe Configuration

**Stripe Setup:**
1. Create a Stripe account
2. Get your API keys from the Dashboard
3. Set up webhook endpoints
4. Create products and prices

```env
STRIPE_PUBLISHABLE_KEY="pk_live_your-publishable-key"
STRIPE_SECRET_KEY="sk_live_your-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
STRIPE_MONTHLY_PRICE_ID="price_your-monthly-price-id"
STRIPE_YEARLY_PRICE_ID="price_your-yearly-price-id"
```

**Webhook Configuration:**
- Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
- Events to send (every one of them is handled; an event that is not listed here is acknowledged and ignored):
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded` (bank debits and other delayed payment methods: the money arrives later)
  - `checkout.session.async_payment_failed` (the delayed payment failed: the pending payment is marked FAILED and the buyer is told)
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `charge.refunded` (a refund made in the Stripe dashboard: a full refund ends the access bought by that payment, a partial one is only recorded)

After adding events, use "Send test webhook" in the dashboard for `charge.refunded` and check the `webhook.processed` log line. The subscription itself is never cancelled by a refund: stopping future billing stays a decision to take in Stripe.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**1. Connect Repository:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**2. Configure Environment Variables:**
- Go to Vercel Dashboard > Project Settings > Environment Variables
- Add all environment variables from your `.env` file
- Make sure to set the correct production URLs

**3. Database Migration:**
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client (written to lib/generated/prisma, DATABASE_URL is read from the environment)
npx prisma generate
```

**4. Custom Domain Setup:**
- Add your domain in Vercel Dashboard
- Configure DNS records as instructed
- SSL certificates are automatically handled

### Production database connection (Prisma 7 + `pg`)

Prisma 7 reaches PostgreSQL through the `pg` driver adapter. Three differences from the old engine matter in production:

| Topic | Behaviour | What to do |
|-------|-----------|------------|
| TLS | The server certificate is **validated**; `sslmode=require`/`prefer`/`verify-ca` behave like `verify-full`. | Use `?sslmode=require`. If the provider uses a private CA, point `NODE_EXTRA_CA_CERTS` at the CA file, otherwise the first query fails with `self-signed certificate in certificate chain`. Never disable verification globally. |
| URL parameters | `pgbouncer`, `connection_limit`, `pool_timeout`, `socket_timeout` and `statement_cache_size` are **ignored**. | Remove them; the pool uses the `pg` default (10 connections). With PgBouncer in transaction mode, use its own pool size. |
| Timeout | A connection attempt fails after 5 s (`lib/db.ts`). | A timeout on the first request almost always means a wrong host, port or TLS setting. |

At startup the server logs the problems it can detect from `DATABASE_URL` (`[database] NO_TLS`, `IGNORED_PARAMS`, `TLS_PRIVATE_CA`, ...; see `lib/database-url.ts`). The URL is never logged. Check the deploy logs for `[database]` lines, then confirm with `GET /api/health`.

### Option 2: Docker / Coolify (the production target)

The repository ships a multi-stage `Dockerfile` (Next.js standalone, Node 22, pnpm from `packageManager`, non-root user, `tini`,
health check on `/api/health`). The full procedure for Coolify (resources, build variables, pre-deployment migration, cron,
domain, post-deployment checks) is in **[docs/COOLIFY.md](docs/COOLIFY.md)**.

```bash
docker build -t fygs-dev   --build-arg NEXT_PUBLIC_SITE_URL=https://fygs.dev   --build-arg S3_PUBLIC_URL=https://storage.example.com/fygs-videos .
```

### Option 3: VPS/Cloud Server

**1. Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

**2. Application Deployment:**
```bash
# Clone repository
git clone https://github.com/yourusername/fygs.dev.git
cd fygs.dev

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your production values

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start npm --name "fygs-app" -- start
pm2 save
pm2 startup
```

**3. Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist

### Production Security

- [ ] Use strong, unique secrets for all environment variables
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Use environment-specific database credentials
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities

### Database Security

- [ ] Use connection pooling
- [ ] Enable SSL for database connections
- [ ] Regular database backups
- [ ] Restrict database access by IP
- [ ] Use read-only replicas for analytics

### API Security

- [ ] Validate all inputs
- [ ] Implement proper authentication
- [ ] Use CSRF protection
- [ ] Rate limit API endpoints
- [ ] Log security events

## 📊 Monitoring & Analytics

### Application Monitoring

**Vercel Analytics:**
```typescript
// Already configured in the app
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
```

**Error monitoring (Sentry), optional:**
Nothing is sent unless a DSN is set. With one, server errors (`SENTRY_DSN`) and browser errors (`NEXT_PUBLIC_SENTRY_DSN`, inlined at build time) are reported after `lib/monitoring.ts` has stripped what must not leave: e-mail addresses, IPs, names, cookies, headers, request bodies and query strings. Only an opaque user id is kept. Set `SENTRY_ENVIRONMENT` and `SENTRY_RELEASE` (or `GIT_COMMIT_SHA`) to tell deployments apart. The Content-Security-Policy opens `connect-src` to the DSN's host automatically; rebuild after changing `NEXT_PUBLIC_SENTRY_DSN`.

**Code sandbox (`/sandbox/runner.html`):** exercises and coding challenges run learners' code there, under its own Content-Security-Policy (set in `next.config.mjs`). A reverse proxy must pass the `Content-Security-Policy` header of that path through untouched, and must not add a second one: two policies are intersected and would take `eval` away again.

### Database Monitoring

```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Issues:**
```bash
# Test database connection
npx prisma db pull

# Reset database (development only)
npx prisma migrate reset
```

**2. Build Failures:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

**3. Email Delivery Issues:**
```bash
# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

**4. Stripe Webhook Issues:**
```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📈 Performance Optimization

### Production Optimizations

1. **Enable Compression:**
```javascript
// next.config.js
module.exports = {
  compress: true,
  // Other config
};
```

2. **Database Optimization:**
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_course_slug ON courses(slug);
CREATE INDEX idx_enrollment_user_course ON enrollments(user_id, course_id);
```

3. **Caching Strategy:**
```typescript
// Implement Redis caching for frequently accessed data
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

## 🎯 Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication flows (login, register, OAuth)
- [ ] Test payment processing (Stripe checkout)
- [ ] Verify email delivery (verification, welcome emails)
- [ ] Check database migrations completed
- [ ] Test course enrollment and access
- [ ] Verify webhook endpoints are working
- [ ] Monitor application logs for errors
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies
- [ ] Update DNS records if needed
- [ ] Test mobile responsiveness
- [ ] Verify SEO metadata
- [ ] Check Core Web Vitals scores

## 📞 Support

For deployment issues or questions:
- Email: support@fygs.dev
- Documentation: [docs.fygs.dev](https://docs.fygs.dev)
- Discord: [Join our community](https://discord.gg/fygs)

---

**Happy Deploying! 🚀**
