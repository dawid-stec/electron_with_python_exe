const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

function getPythonExePath() {
  // W DEV odpalamy bez exe (opcjonalnie), ale w tym minimalnym przykładzie
  // zakładamy, że exe będzie zawsze dostępny w resources/python/mycli.exe po buildzie.
  // Na DEV też możesz go tam wrzucić ręcznie.
  return path.join(process.resourcesPath, "python", "mycli.exe");
}

function runPython(cmdArg) {
  return new Promise((resolve, reject) => {
    const exePath = getPythonExePath();

    const child = spawn(exePath, [cmdArg], {
      windowsHide: true,
    });

    let out = "";
    let err = "";

    child.stdout.on("data", (d) => (out += d.toString("utf8")));
    child.stderr.on("data", (d) => (err += d.toString("utf8")));

    child.on("error", (e) => reject(e));
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(err || `Python exited ${code}`));
      resolve(out.trim());
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Vite dev server vs produkcyjny plik
  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "renderer", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("python:run", async (_evt, cmdArg) => {
    // cmdArg np. "ping"
    return await runPython(cmdArg || "default");
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
