# MongoDB Installation Guide (Raspberry Pi 4 - 64-bit using libssl1.1)

## ✅ Goal
Install MongoDB 4.4 on Raspberry Pi 4 (64-bit) using manual installation and libssl1.1 workaround.

---

## ⚠️ Important Notes
- Raspberry Pi OS Bookworm uses `libssl3`
- MongoDB 4.4 requires `libssl1.1`
- We must install `libssl1.1` manually

---

## ✅ Step 1 — Update system
```bash
sudo apt update
sudo apt upgrade -y
```

---

## ✅ Step 2 — Install libssl1.1 (required)

Download package:
```bash
wget http://security.debian.org/debian-security/pool/updates/main/o/openssl1.1/libssl1.1_1.1.1n-0+deb11u5_arm64.deb
```

Install:
```bash
sudo dpkg -i libssl1.1_1.1.1n-0+deb11u5_arm64.deb
```

Fix dependencies (if needed):
```bash
sudo apt install -f
```

Verify:
```bash
dpkg -l | grep libssl
```

---

## ✅ Step 3 — Download MongoDB 4.4
```bash
wget https://fastdl.mongodb.org/linux/mongodb-linux-aarch64-ubuntu2004-4.4.18.tgz
```

Extract:
```bash
tar -xvzf mongodb-linux-aarch64-ubuntu2004-4.4.18.tgz
cd mongodb-linux-aarch64-ubuntu2004-4.4.18
```

---

## ✅ Step 4 — Create database directory
```bash
mkdir -p ~/mongodb-data
```

---

## ✅ Step 5 — Run MongoDB
```bash
./bin/mongod --dbpath ~/mongodb-data
```

---

## ✅ Step 6 — Run Mongo shell
Open another terminal:
```bash
./bin/mongo
```

---

## ✅ Optional — Add to PATH
```bash
export PATH=$PATH:~/mongodb-linux-aarch64-ubuntu2004-4.4.18/bin
```

Add permanently:
```bash
nano ~/.bashrc
```
Add line:
```bash
export PATH=$PATH:~/mongodb-linux-aarch64-ubuntu2004-4.4.18/bin
```

---

## ✅ Optional — Create systemd service
```bash
sudo nano /etc/systemd/system/mongod.service
```

Paste:
```ini
[Unit]
Description=MongoDB Database
After=network.target

[Service]
User=pi
ExecStart=/home/pi/mongodb-linux-aarch64-ubuntu2004-4.4.18/bin/mongod   --dbpath /home/pi/mongodb-data
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reexec
sudo systemctl enable mongod
sudo systemctl start mongod
```

---

## ✅ Troubleshooting

### Check MongoDB status
```bash
sudo systemctl status mongod
```

### View logs
```bash
journalctl -u mongod
```

### Verify architecture
```bash
uname -m
```
Expected: `aarch64`

---

## ✅ Summary
- MongoDB 4.4 is the latest compatible version for Pi 4
- Requires manual install on Bookworm
- libssl1.1 must be installed manually
- MongoDB can run manually or as a service
