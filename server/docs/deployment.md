# Deployment Documentation

## Overview
Production deployment guide for the **MediLocker — NFC Based Smart Patient Health Card System**.

The server is a **Node.js + Express + TypeScript** application connected to a **PostgreSQL** database (managed via **Prisma ORM**).

## Architecture Overview

### Production Environment
```
┌─────────────────┐    ┌─────────────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Node.js Server       │    │    Database      │
│  (NGINX/ALB)   │────│  (Express + TypeScript)  │────│  (PostgreSQL)   │
└─────────────────┘    └─────────────────────────┘    └─────────────────┘
         │                         │
         │              ┌─────────────────────┐
         │              │  Firebase / Twilio  │
         └──────────────│  (Push / SMS)       │
                        └─────────────────────┘
```

## Infrastructure Requirements

### Minimum System Requirements
- **CPU**: 2 vCPUs per application server
- **RAM**: 4GB per application server
- **Storage**: 20GB SSD for application, 100GB+ for database
- **Network**: 100Mbps bandwidth
- **OS**: Ubuntu 20.04 LTS or later

### Recommended Production Setup
- **Application Servers**: 2+ instances (auto-scaling)
- **Database**: PostgreSQL Primary + Read replica (or Neon DB cloud)
- **Load Balancer**: NGINX or Application Load Balancer
- **Monitoring**: PM2, Datadog, or similar

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build TypeScript
RUN pnpm build

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  server:
    build: ./server
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/medilocker
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - JWT_ACCESS_EXPIRES_IN=15m
      - JWT_REFRESH_EXPIRES_IN=7d
      - NODE_ENV=production
      - PORT=4000
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=medilocker
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - server
    restart: unless-stopped

volumes:
  postgres_data:
```

## Process Management (PM2)

For non-Docker deployments, use **PM2** to manage the Node.js process:

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
pm2 start dist/main.js --name medilocker-server

# Enable auto-restart on reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs medilocker-server

# Restart after a new deployment
pm2 restart medilocker-server
```

## Environment Configuration

### Production Environment Variables (`server/.env`)
```bash
# Database (PostgreSQL or Neon DB)
DATABASE_URL=postgresql://user:password@prod-db.example.com:5432/medilocker

# JWT Secrets (use strong, unique values — minimum 64 random characters)
JWT_ACCESS_SECRET=your-super-secure-access-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=production

# CORS (desktop client / frontend origin)
FRONTEND_URL=https://your-hospital-domain.com

# Twilio (for SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Firebase FCM (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## SSL/TLS Configuration

### NGINX Reverse Proxy with SSL
```nginx
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:4000;
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

server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$host$request_uri;
}
```

## Database Migration

### Running Prisma Migrations
```bash
# Run migrations in production (applies pending migrations)
pnpm db:migrate

# Or using Prisma directly in the server package
pnpm --filter server exec prisma migrate deploy

# Generate Prisma client after schema changes
pnpm db:generate
```

### Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# PostgreSQL database backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured and validated
- [ ] SSL certificates installed
- [ ] Database migrations tested on staging
- [ ] Firebase and Twilio credentials verified
- [ ] CORS origins updated for production domain
- [ ] Backup procedures tested

### Deployment
- [ ] `pnpm build:server` — TypeScript compiled successfully
- [ ] `pnpm db:migrate` — Prisma migrations applied
- [ ] PM2 / Docker service restarted
- [ ] Health check endpoint responding (`GET /api/health`)
- [ ] Load balancer / NGINX routing traffic correctly
- [ ] Monitoring/logging active

### Post-deployment
- [ ] Smoke tests passed (auth, patient lookup, notifications)
- [ ] Firebase FCM push notification delivered to test device
- [ ] Twilio SMS OTP delivered to test number
- [ ] Performance metrics normal
- [ ] Team notified

## Mobile App (Flutter) Deployment

```bash
# Release build for Android
cd app-client
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk

# Release build for iOS (requires macOS + Xcode)
flutter build ios --release

# Build Android App Bundle (for Play Store)
flutter build appbundle --release
```

> **Note:** Update `API_BASE_URL` in `app-client/.env` to the production server URL before building the release APK.