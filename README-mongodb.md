# MongoDB Installation Guide (Raspberry Pi 4 - 64-bit)

## ⚠️ Important
Raspberry Pi 4 uses ARM v8.0, which only supports MongoDB up to version 4.4.
Newer versions (5.x, 6.x, 7.x) will NOT work.

---

## ✅ Step 1 — Update system
```bash
sudo apt update
sudo apt upgrade -y
```

---

## ✅ Step 2 — Install dependencies
```bash
sudo apt install -y gnupg curl
```

---

## ✅ Step 3 — Add MongoDB GPG key
```bash
curl -fsSL https://pgp.mongodb.com/server-4.4.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-4.4.gpg --dearmor
```

---

## ✅ Step 4 — Add repository (Ubuntu Focal workaround)
```bash
echo "deb [ arch=arm64 signed-by=/usr/share/keyrings/mongodb-server-4.4.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
```

---

## ✅ Step 5 — Install MongoDB 4.4.18
```bash
sudo apt update
sudo apt install -y mongodb-org=4.4.18 mongodb-org-server=4.4.18 mongodb-org-shell=4.4.18 mongodb-org-mongos=4.4.18 mongodb-org-tools=4.4.18
```

---

## ✅ Step 6 — Start MongoDB
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## ✅ Step 7 — Test installation
```bash
mongo
```

---

## ✅ Optional — Reduce RAM usage
Edit config:
```bash
sudo nano /etc/mongod.conf
```

Add:
```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 0.25
```

---

## ✅ Alternative — Docker (easier)
```bash
sudo apt install docker.io -y
sudo docker run -d -p 27017:27017 mongo:4.4
```

---

## ✅ Troubleshooting

Check logs:
```bash
sudo journalctl -u mongod
```

Check architecture:
```bash
uname -m
```
Expected: `aarch64`

---

## ✅ Summary
- Raspberry Pi 4 supports MongoDB 4.4 only
- Use Ubuntu Focal repo workaround
- Docker is an easy alternative
