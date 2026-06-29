# Napkin Store - Raspberry Pi 4 Setup Guide

Complete guide to set up and run Angular frontend and Express.js backend services on Raspberry Pi 4.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Raspberry Pi Initial Setup](#raspberry-pi-initial-setup)
3. [Backend Setup (Express.js)](#backend-setup-expressjs)
4. [Frontend Setup (Angular)](#frontend-setup-angular)
5. [Creating SystemD Services](#creating-systemd-services)
6. [Troubleshooting](#troubleshooting)

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
sudo mkdir -p /home/admin/napkin-store-2026
sudo chown admin:admin /home/admin/napkin-store-2026
sudo chmod 755 /home/admin/napkin-store-2026
cd /home/admin/napkin-store-2026
```

---

## Backend Setup (Express.js)

### 1. Clone/Copy Backend Code

```bash
cd /home/admin/napkin-store-2026
git clone <your-repo-url> .
# or copy your project files

cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file in `/home/admin/napkin-store-2026/backend`:

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

### 4. Setup Database (SQLite) & Log Directory
**********************************************************
```bash
# Create data directory
mkdir -p /home/admin/napkin-store-2026/backend/data
chmod 755 /home/admin/napkin-store-2026/backend/data

# Create log directory for systemd services
sudo mkdir -p /var/log/napkin-store
sudo chown admin:admin /var/log/napkin-store
sudo chmod 755 /var/log/napkin-store

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
cd /home/admin/napkin-store-2026/angular
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

### 5. Build Frontend (Optional Test)

```bash
npm run build
# Creates optimized build in dist/angular/browser/
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
User=admin
WorkingDirectory=/home/admin/napkin-store-2026/backend
# Build: tsc && tsc-alias (compiles TypeScript to dist/)
ExecStartPre=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run build
# Start: node dist/index.js (runs compiled production server)
ExecStart=/home/admin/.nvm/versions/node/v22.23.0/bin/npm start
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
User=admin
WorkingDirectory=/home/admin/napkin-store-2026/angular
# Build: ng build (creates optimized production build in dist/angular/browser/)
ExecStartPre=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run build
# Start: electron . (runs Electron desktop app)
ExecStart=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run electron
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

### Available NPM Scripts Reference

The systemd services use these NPM scripts to build and start your applications.

**Backend Service** (`/home/pi/napkin-store/backend/package.json`):
```bash
npm run dev       # Development with file watching (tsx watch src/index.ts) - NOT for systemd
npm run build     # Compile TypeScript to JavaScript (tsc && tsc-alias)
npm start         # Run production server (node dist/index.js)
npm run db:init   # Initialize database
npm run db:seed   # Seed database with test data
npm test          # Run tests (vitest)
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

**The following scripts are called by systemd:**
- **Backend**: `ExecStartPre=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run build` → `ExecStart=/home/admin/.nvm/versions/node/v22.23.0/bin/npm start` (Express.js server on port 3000)
- **Frontend**: `ExecStartPre=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run build` → `ExecStart=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run electron` (Electron desktop app)

**Frontend Service** (`/home/pi/napkin-store/angular/package.json`):
```bash
npm start         # Serve application with ng serve (development)
npm run build     # Build optimized production bundle (ng build)
npm run watch     # Watch mode build (ng build --watch --configuration development)
npm test          # Run tests (ng test)
npm run electron  # Run as Electron app
npm run electron-build  # Build and run as Electron app
```

### Enable and Start Services

**First, find the correct npm path on your Raspberry Pi:**

```bash
# Find where npm is installed
which npm
# Output from your system: /home/admin/.nvm/versions/node/v22.23.0/bin/npm
```

The npm path varies based on your installation:
- **NVM installed**: `/home/admin/.nvm/versions/node/v22.23.0/bin/npm` (you have this one)
- **System package**: `/usr/local/bin/npm` or `/usr/bin/npm`
- **Custom path**: Whatever `which npm` outputs

**Use the path from `which npm` in your service files above.**

**Then, ensure all permissions are correct:**

```bash
# Set application ownership
sudo chown -R admin:admin /home/admin/napkin-store-2026
sudo chmod -R 755 /home/admin/napkin-store-2026

# Ensure log directory is writable
sudo chown admin:admin /var/log/napkin-store
sudo chmod 755 /var/log/napkin-store

# Make npm scripts executable (if needed)
chmod +x /home/admin/napkin-store-2026/backend/package.json
chmod +x /home/admin/napkin-store-2026/angular/package.json
```

**Then reload and start services:**

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

**If you get "npm: command not found" error:**

If your `which npm` retucorns a different path than what's in the service files, update them:

```bash
# Find your npm path
which npm

# Edit the service file
sudo nano /etc/systemd/system/napkin-backend.service

# Replace the npm path with your actual path from 'which npm'
# Then reload and restart
sudo systemctl daemon-reload
sudo systemctl restart napkin-backend.service
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
If systemd builds fail due to memory, update the service file to include:
```ini
[Service]
Environment="NODE_OPTIONS=--max-old-space-size=512"
```
### 4. **Database Connection Errors**

```bash
# Check database file exists and permissions
ls -la /home/admin/napkin-store-2026/backend/data/

# Fix permissions for database files
chmod 644 /home/admin/napkin-store-2026/backend/data/*.db
chmod 644 /home/admin/napkin-store-2026/backend/data/*.db.compacting
chown admin:admin /home/admin/napkin-store-2026/backend/data/*
```

### 5. **CORS Issues**

Update backend `.env`:
```bash
CORS_ORIGIN=http://your-raspberry-pi-ip:4200,http://localhost:4200
```

### 6. **GPIO Permission Errors** (if using GPIO)

```bash
# Add user to gpio group
sudo usermod -a -G gpio admin

# Reboot for changes to take effect
sudo reboot
```

### 7. **View Application Logs**

```bash
# View systemd service logs
sudo journalctl -u napkin-backend.service -n 100 -f
sudo journalctl -u napkin-frontend.service -n 100 -f
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
- [ ] Clone/copy project to `/home/admin/napkin-store-2026`
- [ ] Install backend dependencies: `cd backend && npm install`
- [ ] Install frontend dependencies: `cd ../angular && npm install`
- [ ] Create backend `.env` file with configuration
- [ ] Create log directory: `sudo mkdir -p /var/log/napkin-store && sudo chown admin:admin /var/log/napkin-store`
- [ ] Set permissions: `sudo chown -R admin:admin /home/admin/napkin-store-2026 && sudo chmod -R 755 /home/admin/napkin-store-2026`
- [ ] Create systemd service files
- [ ] Enable and start services: `sudo systemctl enable/start napkin-backend.service napkin-frontend.service`
- [ ] Verify services: `sudo systemctl status napkin-backend.service napkin-frontend.service`

---

## Support & Documentation

For more information, refer to:
- [Raspberry Pi Documentation](https://www.raspberrypi.org/documentation/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Angular Documentation](https://angular.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

---

## Version Information

- **Raspberry Pi**: Raspberry Pi 4
- **OS**: Raspbian (based on Debian)
- **Node.js**: 22 LTS
- **Angular**: 21.2
- **Express.js**: Latest
- **Database**: SQLite
- **Updated**: June 2026
