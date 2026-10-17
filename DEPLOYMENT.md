# 🚀 FYGS Learning Platform - Deployment Guide

This guide covers the complete deployment process for the FYGS Learning Platform, including all services and configurations.

## 📋 Prerequisites

- Node.js 18+
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
STRIPE_SUBSCRIPTION_PRICE_ID="price_your-subscription-price-id"
```

**Webhook Configuration:**
- Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

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

### Option 2: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
# Prisma 7: prisma.config.ts and prisma/ are in the build context (COPY . .)
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/fygs
      - BETTER_AUTH_SECRET=your-secret
      # Add other environment variables
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: fygs
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
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

**Custom Monitoring:**
```typescript
// Add to your monitoring service
const logError = (error: Error, context: string) => {
  console.error(`[${context}] ${error.message}`, error.stack);
  // Send to monitoring service (Sentry, LogRocket, etc.)
};
```

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
