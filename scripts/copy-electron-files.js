// scripts/copy-electron-files.js
// Kopiuje pliki Electron (main/preload) oraz Python exe do katalogu appdist/,
// a renderer jest budowany przez Vite bezpośrednio do appdist/renderer (zgodnie z vite.config.js).

const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

(function main() {
  const APPDIST = "appdist";

  // 1) Upewnij się, że appdist istnieje
  ensureDir(APPDIST);

  // 2) Kopiuj main/preload do appdist/
  const mainSrc = path.join("src", "main.js");
  const preloadSrc = path.join("src", "preload.js");

  if (!exists(mainSrc)) {
    console.error(`Brak pliku: ${mainSrc}`);
    process.exit(1);
  }
  if (!exists(preloadSrc)) {
    console.error(`Brak pliku: ${preloadSrc}`);
    process.exit(1);
  }

  copyFile(mainSrc, path.join(APPDIST, "main.js"));
  copyFile(preloadSrc, path.join(APPDIST, "preload.js"));

  // 3) Skopiuj python exe z PyInstallera:
  // PyInstaller domyślnie tworzy dist/mycli.exe
  const pyExeName = "mycli.exe";
  const pyExeSrc = path.join("dist", pyExeName); // output PyInstallera
  const pyExeDst = path.join(APPDIST, "python", pyExeName);

  if (!exists(pyExeSrc)) {
    console.error(
      `Brak ${pyExeSrc}. Najpierw zbuduj Pythona: npm run build:python (lub pyinstaller ...)`
    );
    process.exit(1);
  }

  copyFile(pyExeSrc, pyExeDst);

  // 4) Renderer:
  // Renderer powinien być już zbudowany przez Vite do appdist/renderer
  // (czyli appdist/renderer/index.html ma istnieć)
  const rendererIndex = path.join(APPDIST, "renderer", "index.html");
  if (!exists(rendererIndex)) {
    console.warn(
      `UWAGA: Nie znaleziono ${rendererIndex}.\n` +
        `Upewnij się, że vite.config.js ma build.outDir ustawione na appdist/renderer\n` +
        `i że wykonałeś: npm run build:renderer`
    );
  }

  console.log("✅ Copied Electron main/preload + Python exe into appdist/");
})();
