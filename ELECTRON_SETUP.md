# Electron App Setup

This guide covers setting up and running the Napkin Store Angular app as an Electron application.

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Install Electron and related dependencies:

```bash
npm install --save-dev electron electron-is-dev electron-builder
npm install --save-dev @types/electron-is-dev
```

2. Update `package.json` in the angular directory with scripts:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "electron": "npm run build && electron .",
    "electron-dev": "concurrently \"npm start\" \"wait-on http://localhost:4200 && electron .\"",
    "electron-build": "npm run build && electron-builder"
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "wait-on": "^7.0.0"
  },
  "main": "electron/main.ts"
}
```

## Running the App

### Development Mode

```bash
npm run electron-dev
```

This will:
1. Start the Angular dev server on `http://localhost:4200`
2. Open the Electron window pointing to the dev server

### Production Build

```bash
npm run electron-build
```

This will create platform-specific installers.

## Socket.IO Configuration

The app automatically detects when running in Electron. CORS is pre-configured to support:

- **Browser**: `http://localhost:4200`, `http://127.0.0.1:4200`
- **Electron**: `file://`, `app://` protocols

No additional configuration needed! The backend will automatically allow Electron clients.

## Environment Variables

Set `CORS_ORIGINS` in `.env` to customize allowed origins:

```bash
CORS_ORIGINS=http://localhost:4200,http://localhost:3000,file:///*,app://*
```

## Troubleshooting

### Socket.IO Not Connecting in Electron

Check the browser console (DevTools) for connection errors. The app logs:
- ✅ Connection success
- ❌ Connection failures
- 🖥️ Electron environment detection

### CORS Errors

If you see CORS errors, ensure:
1. Backend is running (`npm run dev` in the backend directory)
2. `ENABLE_SOCKET_IO=true` in backend `.env`
3. Socket URL matches your backend address in `environment.ts`

## Files

- `electron/main.ts` - Main Electron process
- `electron/preload.ts` - Secure preload script
- `src/environments/environment.electron.ts` - Electron-specific environment config
