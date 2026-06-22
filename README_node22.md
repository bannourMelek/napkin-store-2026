# Node.js 22 Installation Guide (Raspberry Pi)

## ✅ Goal
Install the latest Node.js (v22) using NVM for Angular development.

---

## ✅ Step 1 — Install NVM (Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Load NVM:
```bash
source ~/.bashrc
```

Verify installation:
```bash
nvm --version
```

---

## ✅ Step 2 — Install Node.js 22
```bash
nvm install 22
```

---

## ✅ Step 3 — Use Node 22
```bash
nvm use 22
```

Verify:
```bash
node -v
```
Expected output: `v22.x.x`

---

## ✅ Step 4 — Set default version
```bash
nvm alias default 22
```

---

## ✅ Step 5 — Remove old system Node (optional)
```bash
sudo apt remove nodejs npm -y
```

---

## ✅ Step 6 — Install Angular CLI
```bash
npm install -g @angular/cli
```

Verify:
```bash
ng version
```

---

## ✅ Useful NVM Commands

Switch Node versions:
```bash
nvm use 20
nvm use 22
```

List installed versions:
```bash
nvm ls
```

List available versions:
```bash
nvm ls-remote
```

---

## ✅ Fix NVM not loaded automatically

Add this to `~/.bashrc` if needed:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

---

## ✅ Summary
- Use NVM to manage Node versions
- Install Node 22 for Angular compatibility
- Set Node 22 as default
- Reinstall global packages
