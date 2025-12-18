const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

/**
 * Zwraca ścieżkę do pythonowego exe:
 * - DEV: appdist/python/mycli.exe (uruchamiasz build ręcznie)
 * - PROD (po instalacji): <resources>/python/mycli.exe
 */
function getPythonExePath() {
  if (app.isPackaged) {
    // np. C:\Users\...\ElectronReactPythonDemo\resources\python\mycli.exe
    return path.join(process.resourcesPath, "python", "mycli.exe");
  }

  // DEV
  return path.join(__dirname, "python", "mycli.exe");
}

/**
 * Uruchamia pythonowy proces i zwraca stdout jako Promise<string>
 */
function runPython(cmdArg) {
  return new Promise((resolve, reject) => {
    const exePath = getPythonExePath();

    const child = spawn(exePath, [cmdArg], {
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => {
      stdout += d.toString("utf8");
    });

    child.stderr.on("data", (d) => {
      stderr += d.toString("utf8");
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(stderr || `Python process exited with code ${code}`)
        );
        return;
      }
      resolve(stdout.trim());
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
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    // PROD
    win.loadFile(path.join(__dirname, "renderer", "index.html"));
  } else {
    // DEV
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  }
}

// Opcjonalnie: wycisza warningi GPU/cache na Windows
app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");
app.commandLine.appendSwitch("disable-gpu-program-cache");

app.whenReady().then(() => {
  ipcMain.handle("python:run", async (_event, cmdArg) => {
    return await runPython(cmdArg || "default");
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
