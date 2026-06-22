# Mongo Express Installation Guide (Raspberry Pi)

## ✅ Goal
Install Mongo Express (MongoDB web UI) and configure it to start automatically on boot.

---

## ✅ Step 1 — Install Mongo Express
```bash
npm install -g mongo-express
```

---

## ✅ Step 2 — Create configuration file
```bash
mkdir -p ~/.config/mongo-express
nano ~/.config/mongo-express/config.js
```

Paste the following configuration:
```js
module.exports = {
  mongodb: {
    connectionString: 'mongodb://127.0.0.1:27017'
  },

  site: {
    baseUrl: '/'
  },

  options: {
    useBasicAuth: false
  }
};
```

---

## ✅ Step 3 — Start Mongo Express (manual test)
```bash
mongo-express
```

Open in browser:
```
http://<raspberry-ip>:8081
```

---

## ✅ Step 4 — Enable authentication (optional but recommended)
Edit config file:
```bash
nano ~/.config/mongo-express/config.js
```

Update:
```js
options: {
  useBasicAuth: true
},

basicAuth: {
  username: 'admin',
  password: 'admin123'
}
```

---

## ✅ Step 5 — Create systemd service (auto-start on boot)
```bash
sudo nano /etc/systemd/system/mongo-express.service
```

Paste:
```ini
[Unit]
Description=Mongo Express Web UI
After=network.target mongod.service

[Service]
ExecStart=/usr/bin/npx mongo-express
Restart=always
User=pi
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

---

## ✅ Step 6 — Enable and start service
```bash
sudo systemctl daemon-reexec
sudo systemctl enable mongo-express
sudo systemctl start mongo-express
```

---

## ✅ Step 7 — Verify service
```bash
sudo systemctl status mongo-express
```

---

## ✅ Troubleshooting

### Check logs
```bash
journalctl -u mongo-express
```

### Change port
```bash
PORT=8082 mongo-express
```

### Ensure MongoDB is running
```bash
sudo systemctl status mongod
```

---

## ✅ Summary
- Mongo Express provides a web UI for MongoDB
- Runs on port 8081 by default
- Can be secured with basic authentication
- Automatically starts on boot using systemd
