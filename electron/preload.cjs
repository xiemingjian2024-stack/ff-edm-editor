const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('edmDesktop', {
  klaviyo: {
    status: () => ipcRenderer.invoke('klaviyo:status'),
    connect: key => ipcRenderer.invoke('klaviyo:connect', key),
    disconnect: () => ipcRenderer.invoke('klaviyo:disconnect'),
    uploadImage: payload => ipcRenderer.invoke('klaviyo:upload-image', payload),
  },
})
