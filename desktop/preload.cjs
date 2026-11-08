// The only bridge between the page and the computer: saving, reminders and the window buttons. Nothing else.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pedo', {
  store: {
    read: (key) => ipcRenderer.invoke('store:read', key),
    write: (key, value) => ipcRenderer.invoke('store:write', key, value),
    remove: (key) => ipcRenderer.invoke('store:remove', key),
  },
  reminders: {
    schedule: (settings) => ipcRenderer.invoke('reminders:schedule', settings),
    test: (settings) => ipcRenderer.invoke('reminders:test', settings),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onState: (fn) => {
      const h = (_e, s) => fn(s)
      ipcRenderer.on('window:state', h)
      return () => ipcRenderer.removeListener('window:state', h)
    },
  },
})
