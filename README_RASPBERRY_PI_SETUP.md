# Napkin Store - Raspberry Pi 4 Setup Guide

Complete guide to set up and run Angular frontend and Express.js backend services on Raspberry Pi 4.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Raspberry Pi Initial Setup](#raspberry-pi-initial-setup)
3. [Backend Setup (Express.js)](#backend-setup-expressjs)
4. [Frontend Setup (Angular)](#frontend-setup-angular)
5. [Running Services](#running-services)
6. [Creating SystemD Services](#creating-systemd-services)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Raspberry Pi 4 with 4GB or more RAM (8GB recommended)
- Raspbian OS (Latest) installed
- SSH access enabled
- Internet connection
- Basic knowledge of Linux command line

### Hardware Recommendations
- **CPU**: Raspberry Pi 4 (4-core ARM)
- **RAM**: 8GB (minimum 4GB)
- **Storage**: 32GB microSD card (or larger SSD via USB)
- **Power**: 5V 3A USB-C power supply

---

## Raspberry Pi Initial Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Install Node.js (LTS for ARM64)

**Check Raspberry Pi OS Architecture:**
```bash
uname -m
```
(Should show `aarch64` for 64-bit or `armv7l` for 32-bit)

**Install Node.js 22 (LTS):**

For 64-bit Raspberry Pi OS:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs npm

# Verify installation
node --version
npm --version
```

For 32-bit Raspberry Pi OS:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs npm
```

### 3. Install Additional Dependencies

```bash
sudo apt install -y python3 python3-dev python3-pip
sudo apt install -y libopenjp2-7 libtiff5 libjasper-dev libharfbuzz0b libwebp6
```

### 4. Create Application Directory

```bash
sudo mkdir -p /home/pi/napkin-store
sudo chown pi:pi /home/pi/napkin-store
cd /home/pi/napkin-store
```

---

## Backend Setup (Express.js)

### 1. Clone/Copy Backend Code

```bash
cd /home/pi/napkin-store
git clone <your-repo-url> .
# or copy your project files

cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file in `/home/pi/napkin-store/backend`:

```bash
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=file:./data.db
DATABASE_TYPE=sqlite

# CORS Configuration
CORS_ORIGIN=http://localhost:4200,http://raspberry-pi-ip:4200

# GPIO Configuration (if using GPIO)
GPIO_ENABLED=true
GPIO_CHIP=/dev/gpiochip0

# JWT Configuration
JWT_SECRET=your-secret-key-change-this

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/napkin-store/backend.log
EOF
```

### 4. Setup Database (SQLite)
**********************************
```bash
# Create data directory
mkdir -p /home/pi/napkin-store/backend/data

# Run database initialization (if you have a script)
npm run db:init  # or your db initialization script
```

### 5. Build Backend

```bash
npm run build  # if you have a build script
```

### 6. Test Backend

```bash
npm start
# Should output: Server running on http://0.0.0.0:3000
# Press Ctrl+C to stop
```

---

## Frontend Setup (Angular)

### 1. Navigate to Angular Directory

```bash
cd /home/pi/napkin-store/angular
```

### 2. Install Dependencies

```bash
npm install
```

**Note**: This may take 5-10 minutes on Raspberry Pi due to limited CPU.

### 3. Configure Environment

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // or your Raspberry Pi's IP
  apiBaseUrl: 'http://localhost:3000'
};
```

Edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://your-raspberry-pi-ip:3000/api',
  apiBaseUrl: 'http://your-raspberry-pi-ip:3000'
};
```

### 4. Build Angular Application

```bash
npm run build
```

This creates an optimized production build in `dist/angular/browser/`.

### 5. Test Frontend (Optional)

```bash
npm start
# Access at http://raspberry-pi-ip:4200
```

---

## Running Services

### Option 1: Manual Startup (For Testing)

**Terminal 1 - Backend:**
```bash
cd /home/pi/napkin-store/backend
npm start
```

**Terminal 2 - Frontend (Electron):**
```bash
cd /home/pi/napkin-store/angular
npm run electron
```

or **Web Frontend:**
```bash
cd /home/pi/napkin-store/angular
npm start
# Access at http://raspberry-pi-ip:4200
```

### Option 2: Using PM2 (Recommended for Production)

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Create PM2 Ecosystem File** (`/home/pi/napkin-store/ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'napkin-backend',
      script: './backend/src/index.ts',
      interpreter: 'node',
      args: '--loader ts-node/esm',
      cwd: '/home/pi/napkin-store',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/napkin-store/backend-error.log',
      out_file: '/var/log/napkin-store/backend.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'napkin-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/pi/napkin-store/angular',
      env: {
        NODE_ENV: 'production',
        PORT: 4200
      },
      error_file: '/var/log/napkin-store/frontend-error.log',
      out_file: '/var/log/napkin-store/frontend.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

**Start Services with PM2:**
```bash
cd /home/pi/napkin-store
pm2 start ecosystem.config.js

# Save PM2 configuration to restart on reboot
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
```

**Useful PM2 Commands:**
```bash
pm2 list                 # View all processes
pm2 logs napkin-backend  # View backend logs
pm2 logs napkin-frontend # View frontend logs
pm2 stop napkin-backend  # Stop backend
pm2 restart napkin-backend  # Restart backend
pm2 delete napkin-backend   # Remove from PM2
```

---

## Creating SystemD Services

### Backend Service

Create `/etc/systemd/system/napkin-backend.service`:

```bash
sudo nano /etc/systemd/system/napkin-backend.service
```

Add the following content:

```ini
[Unit]
Description=Napkin Store Backend (Express.js)
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/napkin-store/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

### Frontend Service

Create `/etc/systemd/system/napkin-frontend.service`:

```bash
sudo nano /etc/systemd/system/napkin-frontend.service
```

Add the following content:

```ini
[Unit]
Description=Napkin Store Frontend (Angular)
After=network.target napkin-backend.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/napkin-store/angular
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"
Environment="PORT=4200"

[Install]
WantedBy=multi-user.target
```

### Enable and Start Services

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable napkin-backend.service
sudo systemctl enable napkin-frontend.service

# Start services
sudo systemctl start napkin-backend.service
sudo systemctl start napkin-frontend.service

# Check status
sudo systemctl status napkin-backend.service
sudo systemctl status napkin-frontend.service

# View logs
sudo journalctl -u napkin-backend.service -f  # Follow logs
sudo journalctl -u napkin-frontend.service -f
```

---

## Nginx Reverse Proxy (Optional but Recommended)

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Nginx

Create `/etc/nginx/sites-available/napkin-store`:

```bash
sudo nano /etc/nginx/sites-available/napkin-store
```

Add the following:

```nginx
upstream backend {
    server 127.0.0.1:3000;
}

upstream frontend {
    server 127.0.0.1:4200;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Nginx

```bash
sudo ln -s /etc/nginx/sites-available/napkin-store /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Troubleshooting

### 1. **Port Already in Use**

```bash
# Find process using port
sudo lsof -i :3000    # For backend
sudo lsof -i :4200    # For frontend

# Kill process
kill -9 <PID>
```

### 2. **Low Memory Issues**

Enable swap on Raspberry Pi:
```bash
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Change CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### 3. **Slow Build Times**

Reduce build memory usage:
```bash
export NODE_OPTIONS="--max-old-space-size=512"
npm run build
```

### 4. **Database Connection Errors**

```bash
# Check database file exists and permissions
ls -la /home/pi/napkin-store/backend/data/

# Reset permissions
chmod 666 /home/pi/napkin-store/backend/data/data.db
```

### 5. **CORS Issues**

Update backend `.env`:
```bash
CORS_ORIGIN=http://your-raspberry-pi-ip:4200,http://localhost:4200
```

### 6. **GPIO Permission Errors** (if using GPIO)

```bash
# Add user to gpio group
sudo usermod -a -G gpio pi

# Reboot for changes to take effect
sudo reboot
```

### 7. **View Application Logs**

```bash
# Using PM2
pm2 logs

# Using Systemd
sudo journalctl -u napkin-backend.service -n 100 -f

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Performance Optimization Tips

### 1. Disable Unnecessary Services

```bash
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon
```

### 2. Increase File Descriptors

Add to `/etc/security/limits.conf`:
```
pi soft nofile 65536
pi hard nofile 65536
```

### 3. Enable Hardware Acceleration (if available)

```bash
# Check GPU memory
vcgencmd get_mem gpu
```

### 4. Monitor System Resources

```bash
# Install system monitor
sudo apt install -y htop iotop

# View CPU/Memory usage
htop
```

---

## Quick Start Checklist

- [ ] Install Node.js LTS 22
- [ ] Clone/copy project to `/home/pi/napkin-store`
- [ ] Install backend dependencies: `cd backend && npm install`
- [ ] Install frontend dependencies: `cd ../angular && npm install`
- [ ] Create backend `.env` file with configuration
- [ ] Build frontend: `npm run build`
- [ ] Test backend: `cd ../backend && npm start`
- [ ] Test frontend: `cd ../angular && npm start`
- [ ] Configure PM2 or Systemd services
- [ ] Set up Nginx reverse proxy (optional)
- [ ] Enable services to start on boot
- [ ] Reboot and verify services start automatically

---

## Support & Documentation

For more information, refer to:
- [Raspberry Pi Documentation](https://www.raspberrypi.org/documentation/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Angular Documentation](https://angular.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Version Information

- **Raspberry Pi**: Raspberry Pi 4
- **OS**: Raspbian (based on Debian)
- **Node.js**: 22 LTS
- **Angular**: 21.2
- **Express.js**: Latest
- **Database**: SQLite
- **Updated**: June 2026
