const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  runPython: (cmdArg) => ipcRenderer.invoke("python:run", cmdArg),
});
