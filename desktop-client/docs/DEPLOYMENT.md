# Deployment Guide

This guide covers deploying the Medical Management Desktop Client for both web and desktop environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Web Deployment](#web-deployment)
- [Desktop Deployment](#desktop-deployment)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment
- Node.js 18+ 
- npm or yarn
- Git

### Production Environment
- Web server (Nginx, Apache, or similar)
- SSL certificate (recommended)
- Backend API server

## Environment Configuration

### Environment Variables

Create appropriate `.env` files for different environments:

#### Development (.env.development)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_NODE_ENV=development
VITE_APP_NAME=Medical Management System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_LOGGING=true
VITE_ENABLE_ANALYTICS=false
```

#### Production (.env.production)
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_NODE_ENV=production
VITE_APP_NAME=Medical Management System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_LOGGING=false
VITE_ENABLE_ANALYTICS=true
VITE_TOKEN_REFRESH_INTERVAL=300000
VITE_SESSION_TIMEOUT=3600000
```

#### Staging (.env.staging)
```env
VITE_API_BASE_URL=https://staging-api.your-domain.com/api
VITE_NODE_ENV=staging
VITE_APP_NAME=Medical Management System (Staging)
VITE_APP_VERSION=1.0.0-staging
VITE_ENABLE_LOGGING=true
VITE_ENABLE_ANALYTICS=false
```

## Web Deployment

### Build Process

1. **Install dependencies:**
```bash
npm ci --production=false
```

2. **Run tests (optional but recommended):**
```bash
npm run test
npm run lint
```

3. **Build for production:**
```bash
npm run build
```

This creates a `dist` folder with optimized static files.

### Deployment Options

#### Option 1: Static File Server

Deploy the `dist` folder to any static file server:

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/medical-app/dist;
    index index.html;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**Apache Configuration (.htaccess):**
```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

#### Option 2: CDN Deployment

Deploy to a CDN like AWS CloudFront, Cloudflare, or Netlify:

**Netlify (_redirects file):**
```
/*    /index.html   200
```

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### CI/CD Pipeline Example

**GitHub Actions (.github/workflows/deploy.yml):**
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
      run: npm run test
    
    - name: Build application
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
    
    - name: Deploy to server
      run: |
        # Your deployment script here
        rsync -avz --delete dist/ user@server:/var/www/medical-app/
```

## Desktop Deployment

### Build Desktop Application

1. **Build the web application:**
```bash
npm run build
```

2. **Build Electron application:**
```bash
npm run electron:build
```

This creates platform-specific installers in the `dist-electron` folder.

### Platform-Specific Builds

#### Windows
```bash
npm run electron:build -- --win
```
Generates:
- `medical-management-setup-1.0.0.exe` (NSIS installer)
- `medical-management-1.0.0-win.zip` (portable)

#### macOS
```bash
npm run electron:build -- --mac
```
Generates:
- `medical-management-1.0.0.dmg` (disk image)
- `medical-management-1.0.0-mac.zip` (app bundle)

#### Linux
```bash
npm run electron:build -- --linux
```
Generates:
- `medical-management-1.0.0.AppImage` (AppImage)
- `medical-management_1.0.0_amd64.deb` (Debian package)

### Code Signing

#### Windows Code Signing
```json
{
  "build": {
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password",
      "signingHashAlgorithms": ["sha256"]
    }
  }
}
```

#### macOS Code Signing
```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name",
      "hardenedRuntime": true,
      "entitlements": "build/entitlements.mac.plist"
    }
  }
}
```

### Auto-Updates

Configure auto-updates using electron-updater:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "your-repo"
    }
  }
}
```

## Production Considerations

### Security

1. **HTTPS Only**: Always use HTTPS in production
2. **Content Security Policy**: Implement CSP headers
3. **API Security**: Ensure API endpoints are secured
4. **Token Management**: Implement secure token storage
5. **Input Validation**: Validate all user inputs

### Performance

1. **Asset Optimization**: Minimize and compress assets
2. **Lazy Loading**: Implement code splitting
3. **Caching**: Configure appropriate cache headers
4. **CDN**: Use CDN for static assets
5. **Bundle Analysis**: Monitor bundle size

### Monitoring

1. **Error Tracking**: Implement error monitoring (Sentry, Bugsnag)
2. **Analytics**: Track user interactions
3. **Performance Monitoring**: Monitor Core Web Vitals
4. **Uptime Monitoring**: Monitor application availability

### Backup and Recovery

1. **Database Backups**: Regular API database backups
2. **Configuration Backups**: Version control all configurations
3. **Disaster Recovery**: Plan for system failures
4. **Rollback Strategy**: Ability to rollback deployments

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### Routing Issues
- Ensure server is configured for client-side routing
- Check that all routes redirect to `index.html`

#### API Connection Issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS configuration on API server
- Verify SSL certificates if using HTTPS

#### Electron Build Issues
```bash
# Clear Electron cache
npx electron-builder install-app-deps
```

#### Performance Issues
- Analyze bundle size: `npm run build -- --analyze`
- Check for memory leaks in Electron
- Monitor network requests

### Logs and Debugging

#### Web Application
- Browser Developer Tools
- Network tab for API calls
- Console for JavaScript errors

#### Electron Application
- Main process logs: Check terminal output
- Renderer process logs: Open DevTools in Electron
- Crash reports: Check system crash logs

### Support Contacts

- Development Team: [team@example.com]
- System Administrator: [admin@example.com]
- Emergency Contact: [emergency@example.com]

## Maintenance

### Regular Tasks

1. **Security Updates**: Keep dependencies updated
2. **Performance Monitoring**: Regular performance audits
3. **Backup Verification**: Test backup restoration
4. **SSL Certificate Renewal**: Monitor certificate expiration
5. **Log Rotation**: Manage log file sizes

### Update Process

1. Test updates in staging environment
2. Schedule maintenance windows
3. Backup current version
4. Deploy updates
5. Verify functionality
6. Monitor for issues

---

For additional support, refer to:
- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)