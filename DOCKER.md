# 🐳 Docker Deployment Guide

This guide explains how to deploy the Liquid Sort Game using Docker.

## 🚀 Quick Start

### Using PowerShell (Windows)
```powershell
.\deploy.ps1
```

### Using Bash (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment
```bash
# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🌐 Access

Once deployed, the game will be available at:
- **Local**: http://localhost:8080
- **Network**: http://[your-ip]:8080

## 📊 Container Details

- **Base Image**: nginx:alpine
- **Port**: 8080 (host) → 80 (container)
- **Health Check**: `/health` endpoint
- **Logs**: Available in `./logs/` directory

## 🔧 Configuration

### Environment Variables
- `NGINX_HOST`: Server hostname (default: localhost)
- `NGINX_PORT`: Internal port (default: 80)

### Volumes
- `./logs:/var/log/nginx` - Nginx logs

## 🛠️ Development

### Building Only
```bash
docker build -t liquid-sort-game .
```

### Running with Custom Port
```bash
docker run -p 3000:80 liquid-sort-game
```

### Debug Mode
```bash
docker-compose up --build
```

## 📝 Troubleshooting

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs liquid-sort-game
```

### Restart Container
```bash
docker-compose restart liquid-sort-game
```

### Rebuild from Scratch
```bash
docker-compose down
docker-compose up --build -d
```

## 🔒 Security Features

- Security headers enabled
- Content Security Policy configured
- XSS protection enabled
- HTTPS-ready configuration

## 📈 Performance

- Gzip compression enabled
- Static asset caching (1 year)
- Dynamic content cache control
- Optimized nginx configuration
