# Deployment Documentation

## Overview
Production deployment guide for the JECSmart Patient Health Card System with scalable cloud infrastructure.

## Architecture Overview

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Servers   │    │   Database      │
│   (ALB/NGINX)   │────│   (FastAPI)     │────│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   File Storage  │              │
         └──────────────│   (S3/Blob)     │──────────────┘
                        └─────────────────┘
```

## Infrastructure Requirements

### Minimum System Requirements
- **CPU**: 4 vCPUs per application server
- **RAM**: 8GB per application server
- **Storage**: 100GB SSD for application, 500GB for database
- **Network**: 1Gbps bandwidth
- **OS**: Ubuntu 20.04 LTS or CentOS 8

### Recommended Production Setup
- **Application Servers**: 3+ instances (auto-scaling)
- **Database**: Primary + Read replica
- **Load Balancer**: Application Load Balancer
- **CDN**: CloudFront or Azure CDN
- **Monitoring**: CloudWatch or Azure Monitor

## Docker Deployment

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/jecsmart
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=jecsmart
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
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
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: jecsmart
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: jecsmart-config
  namespace: jecsmart
data:
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "jecsmart"
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: jecsmart-secrets
  namespace: jecsmart
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  JWT_ACCESS_SECRET: <base64-encoded-secret>
  JWT_REFRESH_SECRET: <base64-encoded-secret>
```

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jecsmart-api
  namespace: jecsmart
spec:
  replicas: 3
  selector:
    matchLabels:
      app: jecsmart-api
  template:
    metadata:
      labels:
        app: jecsmart-api
    spec:
      containers:
      - name: api
        image: jecsmart/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: "postgresql://$(DATABASE_USER):$(DATABASE_PASSWORD)@$(DATABASE_HOST):$(DATABASE_PORT)/$(DATABASE_NAME)"
        envFrom:
        - configMapRef:
            name: jecsmart-config
        - secretRef:
            name: jecsmart-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: jecsmart-api-service
  namespace: jecsmart
spec:
  selector:
    app: jecsmart-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: jecsmart-ingress
  namespace: jecsmart
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.jecsmart.com
    secretName: jecsmart-tls
  rules:
  - host: api.jecsmart.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: jecsmart-api-service
            port:
              number: 80
```

## AWS Deployment

### Infrastructure as Code (Terraform)
```hcl
# VPC Configuration
resource "aws_vpc" "jecsmart_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "jecsmart-vpc"
  }
}

# Application Load Balancer
resource "aws_lb" "jecsmart_alb" {
  name               = "jecsmart-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = true
}

# ECS Cluster
resource "aws_ecs_cluster" "jecsmart_cluster" {
  name = "jecsmart-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS Database
resource "aws_db_instance" "jecsmart_db" {
  identifier     = "jecsmart-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_type         = "gp2"
  storage_encrypted    = true

  db_name  = "jecsmart"
  username = "dbadmin"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.jecsmart_db_subnet_group.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = false
  final_snapshot_identifier = "jecsmart-db-final-snapshot"

  tags = {
    Name = "jecsmart-database"
  }
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "jecsmart_files" {
  bucket = "jecsmart-medical-files"
}

resource "aws_s3_bucket_encryption_configuration" "jecsmart_files_encryption" {
  bucket = aws_s3_bucket.jecsmart_files.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

## Environment Configuration

### Production Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@prod-db.amazonaws.com:5432/jecsmart
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# JWT Secrets (use strong, unique values)
JWT_ACCESS_SECRET=your-super-secure-access-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here

# File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=jecsmart-medical-files

# Redis Cache
REDIS_URL=redis://prod-redis.amazonaws.com:6379/0

# Application
NODE_ENV=production
PORT=8000
LOG_LEVEL=INFO
CORS_ORIGINS=https://app.jecsmart.com,https://admin.jecsmart.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

## SSL/TLS Configuration

### NGINX SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name api.jecsmart.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://app:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Migration

### Migration Script
```bash
#!/bin/bash
# migrate.sh

set -e

echo "Starting database migration..."

# Backup current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
for migration in migrations/*.sql; do
    echo "Running migration: $migration"
    psql $DATABASE_URL -f $migration
done

echo "Migration completed successfully!"
```

## Monitoring and Logging

### Application Monitoring
```python
# monitoring.py
import logging
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    REQUEST_DURATION.observe(duration)
    
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Log Configuration
```python
# logging_config.py
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "json": {
            "format": '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
            "level": "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "json",
            "level": "INFO",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}
```

## Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# File storage backup (if using local storage)
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /app/uploads

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://jecsmart-backups/
aws s3 cp $BACKUP_DIR/files_backup_$DATE.tar.gz s3://jecsmart-backups/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations tested
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Backup procedures tested

### Deployment
- [ ] Application deployed
- [ ] Database migrated
- [ ] Health checks passing
- [ ] Load balancer configured
- [ ] Monitoring enabled
- [ ] Logs configured

### Post-deployment
- [ ] Smoke tests passed
- [ ] Performance metrics normal
- [ ] Security monitoring active
- [ ] Backup verification
- [ ] Documentation updated
- [ ] Team notified