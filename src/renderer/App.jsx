import React, { useState } from "react";

export default function App() {
  const [cmd, setCmd] = useState("ping");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRun() {
    setLoading(true);
    setOut("");
    try {
      const res = await window.api.runPython(cmd);
      setOut(res);
    } catch (e) {
      setOut(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h2>Electron + React + Python (PyInstaller)</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="np. ping"
          style={{ padding: 8, width: 240 }}
        />
        <button onClick={onRun} disabled={loading} style={{ padding: "8px 12px" }}>
          {loading ? "Running..." : "Run Python"}
        </button>
      </div>

      <pre
        style={{
          marginTop: 16,
          padding: 12,
          background: "#111",
          color: "#0f0",
          borderRadius: 8,
          minHeight: 120,
          whiteSpace: "pre-wrap",
        }}
      >
        {out || "Output will appear here..."}
      </pre>

      <p style={{ opacity: 0.7 }}>
        To odpala spakowane <code>mycli.exe</code> i wyświetla jego stdout.
      </p>
    </div>
  );
}
