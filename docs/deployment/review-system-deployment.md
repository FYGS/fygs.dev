# Review System Deployment Guide

## Overview

This comprehensive deployment guide covers production deployment of the course review system across different environments and platforms, with emphasis on scalability, security, and reliability.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Deployment](#database-deployment)
4. [Application Deployment](#application-deployment)
5. [Monitoring & Logging](#monitoring--logging)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Backup & Recovery](#backup--recovery)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Scaling Strategies](#scaling-strategies)

## Prerequisites

### System Requirements

- **Node.js**: 18.0 or higher
- **PostgreSQL**: 15.0 or higher
- **Redis**: 7.0 or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: 20GB+ available space
- **Network**: HTTPS/TLS 1.3 support

### Required Services

- **Database**: PostgreSQL with read replicas
- **Cache**: Redis Cluster or ElastiCache
- **Email**: SMTP service (SendGrid, SES, etc.)
- **File Storage**: S3-compatible storage
- **Monitoring**: Prometheus/Grafana or similar
- **Logging**: Centralized logging system

## Environment Setup

### Environment Variables

Create environment-specific configuration files:

#### Production Environment

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=info

# Application
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET="your-256-bit-secret-key"

# Database - Primary
DATABASE_URL="postgresql://user:password@prod-db-primary:5432/reviews?sslmode=require"
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_CONNECTION_TIMEOUT=30000

# Database - Read Replica
DATABASE_READ_URL="postgresql://user:password@prod-db-replica:5432/reviews?sslmode=require"

# Redis
REDIS_URL="redis://prod-redis-cluster:6379"
REDIS_PASSWORD="your-redis-password"
REDIS_TLS=true

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# File Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=60000

# Monitoring
SENTRY_DSN="your-sentry-dsn"
NEW_RELIC_LICENSE_KEY="your-newrelic-key"

# Performance
CACHE_TTL_DEFAULT=3600
CACHE_TTL_REVIEWS=300
CACHE_TTL_ANALYTICS=1800
```

#### Staging Environment

```bash
# .env.staging
NODE_ENV=staging
LOG_LEVEL=debug

# Application
NEXTAUTH_URL=https://staging.yourdomain.com
NEXTAUTH_SECRET="staging-secret-key"

# Database
DATABASE_URL="postgresql://user:password@staging-db:5432/reviews_staging"

# Redis
REDIS_URL="redis://staging-redis:6379"

# Email (using test credentials)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER="your-mailtrap-user"
SMTP_PASSWORD="your-mailtrap-password"
```

### Configuration Management

Use a configuration management tool for environment-specific settings:

```typescript
// config/environment.ts
interface Config {
  database: {
    primary: string;
    replica?: string;
    poolSize: number;
  };
  redis: {
    url: string;
    password?: string;
    cluster?: boolean;
  };
  cache: {
    defaultTTL: number;
    reviewsTTL: number;
    analyticsTTL: number;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  security: {
    corsOrigin: string;
    rateLimitMax: number;
    rateLimitWindow: number;
  };
}

const config: Config = {
  database: {
    primary: process.env.DATABASE_URL!,
    replica: process.env.DATABASE_READ_URL,
    poolSize: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  },
  redis: {
    url: process.env.REDIS_URL!,
    password: process.env.REDIS_PASSWORD,
    cluster: process.env.REDIS_CLUSTER === 'true',
  },
  cache: {
    defaultTTL: parseInt(process.env.CACHE_TTL_DEFAULT || '3600'),
    reviewsTTL: parseInt(process.env.CACHE_TTL_REVIEWS || '300'),
    analyticsTTL: parseInt(process.env.CACHE_TTL_ANALYTICS || '1800'),
  },
  email: {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.FROM_EMAIL!,
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
  },
};

export default config;
```

## Database Deployment

### PostgreSQL Setup

#### Primary Database Configuration

```sql
-- postgresql.conf optimizations for reviews workload
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

# Connection settings
max_connections = 200
shared_preload_libraries = 'pg_stat_statements'

# Logging
log_statement = 'mod'
log_duration = on
log_min_duration_statement = 1000
```

#### Read Replica Configuration

```sql
-- Setup read replica for analytics queries
-- On primary server
CREATE USER replica_user WITH REPLICATION PASSWORD 'replica_password';

-- pg_hba.conf entry
host replication replica_user replica_ip/32 md5

-- On replica server
standby_mode = 'on'
primary_conninfo = 'host=primary_ip port=5432 user=replica_user password=replica_password'
recovery_target_timeline = 'latest'
```

#### Database Migration Script

```bash
#!/bin/bash
# deploy-database.sh

set -e

echo "Starting database deployment..."

# 1. Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npx prisma migrate deploy

# 3. Update materialized views
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY review_stats;"

# 4. Update statistics
psql $DATABASE_URL -c "ANALYZE;"

echo "Database deployment completed successfully"
```

### Database Indexes

```sql
-- Performance indexes for review system
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_course_status_created 
ON reviews (course_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_created 
ON reviews (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating_created 
ON reviews (rating, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_review_votes_review_type 
ON review_votes (review_id, type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_review_replies_review_created 
ON review_replies (review_id, created_at ASC);

-- Partial indexes for active reviews
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_approved_course 
ON reviews (course_id, created_at DESC) 
WHERE status = 'APPROVED';

-- Composite index for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_analytics 
ON reviews (course_id, status, rating, verified, created_at);
```

## Application Deployment

### Docker Configuration

#### Multi-stage Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

#### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
      target: production
    image: review-system:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Nginx Configuration

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
        keepalive 32;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript;

        # API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Login endpoint with strict rate limiting
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files with caching
        location /_next/static/ {
            proxy_pass http://app;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # All other requests
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: review-system

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: review-system
  namespace: review-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: review-system
  template:
    metadata:
      labels:
        app: review-system
    spec:
      containers:
      - name: app
        image: review-system:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: review-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: review-secrets
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: review-system-service
  namespace: review-system
spec:
  selector:
    app: review-system
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: review-system-ingress
  namespace: review-system
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: review-system-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: review-system-service
            port:
              number: 80
```

## Monitoring & Logging

### Prometheus Metrics

```typescript
// lib/monitoring/prometheus.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// HTTP request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Review-specific metrics
export const reviewsCreated = new Counter({
  name: 'reviews_created_total',
  help: 'Total number of reviews created',
  labelNames: ['course_id', 'rating']
});

export const reviewsModerated = new Counter({
  name: 'reviews_moderated_total',
  help: 'Total number of reviews moderated',
  labelNames: ['action', 'reason']
});

export const cacheOperations = new Counter({
  name: 'cache_operations_total',
  help: 'Total cache operations',
  labelNames: ['operation', 'hit']
});

export const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

export const queueSize = new Gauge({
  name: 'email_queue_size',
  help: 'Number of emails in queue'
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(reviewsCreated);
register.registerMetric(reviewsModerated);
register.registerMetric(cacheOperations);
register.registerMetric(databaseConnections);
register.registerMetric(queueSize);
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Review System Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Reviews Created",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(reviews_created_total[1h])",
            "legendFormat": "Last Hour"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "rate(cache_operations_total{hit=\"true\"}[5m]) / rate(cache_operations_total[5m]) * 100",
            "legendFormat": "Hit Rate %"
          }
        ]
      }
    ]
  }
}
```

### Structured Logging

```typescript
// lib/logging/logger.ts
import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'review-system',
    version: process.env.APP_VERSION
  },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // File logging
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),

    // Elasticsearch for production
    ...(process.env.ELASTICSEARCH_URL ? [
      new ElasticsearchTransport({
        level: 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_URL,
          auth: {
            username: process.env.ELASTICSEARCH_USER!,
            password: process.env.ELASTICSEARCH_PASSWORD!
          }
        },
        index: 'review-system-logs'
      })
    ] : [])
  ]
});

export default logger;
```

## Security Configuration

### SSL/TLS Setup

```bash
#!/bin/bash
# scripts/setup-ssl.sh

# Generate SSL certificate using Let's Encrypt
certbot certonly \
  --webroot \
  --webroot-path=/var/www/html \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --non-interactive

# Setup automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Security Headers Middleware

```typescript
// middleware/security.ts
import { NextRequest, NextResponse } from 'next/server';

export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains'
  );
  
  // CSP header
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
}
```

### Database Security

```sql
-- Create restricted database user for application
CREATE USER review_app WITH PASSWORD 'secure_password';

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE reviews TO review_app;
GRANT USAGE ON SCHEMA public TO review_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO review_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO review_app;

-- Row-level security policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_reviews_policy ON reviews
  FOR ALL TO review_app
  USING (user_id = current_setting('app.current_user_id')::text);

CREATE POLICY admin_reviews_policy ON reviews
  FOR ALL TO review_app
  USING (current_setting('app.user_role')::text = 'ADMIN');
```

## Performance Optimization

### CDN Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.yourdomain.com'],
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
  
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/reviews/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
    ];
  },
};
```

### Redis Cluster Configuration

```redis
# redis.conf for cluster
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

### Database Connection Pooling

```typescript
// lib/db/connection-pool.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Read replica for heavy read operations
export const dbRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL || process.env.DATABASE_URL,
    },
  },
});
```

## Backup & Recovery

### Database Backup Script

```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/reviews_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" "s3://your-backup-bucket/database/"

# Keep only last 7 days of local backups
find $BACKUP_DIR -name "reviews_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Recovery Procedures

```bash
#!/bin/bash
# scripts/restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Download from S3 if needed
if [[ $BACKUP_FILE == s3://* ]]; then
  aws s3 cp "$BACKUP_FILE" ./restore.sql.gz
  BACKUP_FILE="./restore.sql.gz"
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" > restore.sql
  BACKUP_FILE="restore.sql"
fi

# Stop application
docker-compose down app

# Restore database
psql $DATABASE_URL < $BACKUP_FILE

# Restart application
docker-compose up -d app

echo "Database restored from $BACKUP_FILE"
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Review System

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup test database
      run: |
        npm run db:migrate:test
        npm run db:seed:test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
    
    - name: Run tests
      run: npm run test:coverage
      env:
        NODE_ENV: test
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to production
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/review-system
          docker-compose pull
          docker-compose up -d
          docker system prune -f
```

### Deployment Health Checks

```bash
#!/bin/bash
# scripts/health-check.sh

URL=$1
MAX_ATTEMPTS=30
ATTEMPT=1

echo "Checking health of $URL..."

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health")
  
  if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Service is healthy (attempt $ATTEMPT)"
    exit 0
  else
    echo "⏳ Health check failed (attempt $ATTEMPT/$MAX_ATTEMPTS) - Status: $HTTP_STATUS"
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
  fi
done

echo "❌ Service failed health check after $MAX_ATTEMPTS attempts"
exit 1
```

## Scaling Strategies

### Horizontal Scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: review-system-hpa
  namespace: review-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: review-system
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

### Load Testing

```javascript
// loadtest/review-system.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

export default function () {
  // Test review listing
  let response = http.get('https://yourdomain.com/api/reviews/course_123');
  check(response, {
    'review list status is 200': (r) => r.status === 200,
    'review list response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test review creation
  let reviewData = {
    rating: Math.floor(Math.random() * 5) + 1,
    comment: 'Load test review comment',
  };

  response = http.post(
    'https://yourdomain.com/api/reviews',
    JSON.stringify(reviewData),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
    }
  );

  check(response, {
    'review creation status is 201': (r) => r.status === 201,
    'review creation response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(2);
}
```

## Troubleshooting

### Common Deployment Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   psql $DATABASE_URL -c "SELECT 1"
   
   # Check connection pool
   docker logs app_container | grep "connection"
   ```

2. **Redis Connection Issues**
   ```bash
   # Test Redis connection
   redis-cli -u $REDIS_URL ping
   
   # Check Redis memory usage
   redis-cli -u $REDIS_URL info memory
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   docker stats
   
   # Check for memory leaks
   node --inspect app.js
   ```

4. **Performance Issues**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

### Emergency Procedures

```bash
#!/bin/bash
# scripts/emergency-rollback.sh

echo "🚨 Emergency rollback initiated"

# Stop current deployment
docker-compose down

# Rollback to previous image
docker-compose -f docker-compose.rollback.yml up -d

# Restore database if needed
if [ "$1" = "--restore-db" ]; then
  ./scripts/restore-database.sh s3://backup-bucket/emergency-backup.sql.gz
fi

# Health check
./scripts/health-check.sh https://yourdomain.com

echo "✅ Emergency rollback completed"
```

---

*Deployment Guide Version: 1.0 | Last Updated: 2024-01-15*