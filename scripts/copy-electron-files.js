const fs = require("fs");
const path = require("path");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else copyFile(src, dst);
  }
}

(function main() {
  // dist/main.js i dist/preload.js
  ensureDir("dist");
  copyFile("src/main.js", "dist/main.js");
  copyFile("src/preload.js", "dist/preload.js");

  // Renderer już buduje Vite do dist/renderer, ale index.html jest tam.
  // (Vite to robi). Nic nie kopiujemy dodatkowo.

  // Python exe: po pyinstaller jest w dist/mycli.exe
  // kopiujemy do dist/python/mycli.exe (żeby electron-builder wziął extraResources)
  ensureDir("dist/python");
  const pyExe = path.join("dist", "mycli.exe");
  if (!fs.existsSync(pyExe)) {
    console.error("Brak dist/mycli.exe. Odpal najpierw: npm run build:python");
    process.exit(1);
  }
  copyFile(pyExe, "dist/python/mycli.exe");

  console.log("Copied electron files and python exe into dist/ ✅");
})();
