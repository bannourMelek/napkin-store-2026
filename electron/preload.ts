/**
 * Electron Preload Script
 * Provides secure context bridge between renderer and main process
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose limited IPC API to renderer process
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, args: any) => ipcRenderer.send(channel, args),
    on: (channel: string, func: any) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    once: (channel: string, func: any) => ipcRenderer.once(channel, (event, ...args) => func(...args)),
  },
});
