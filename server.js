const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "2mb" }));

// Where your journal entries live (Markdown files)
const DATA_DIR = path.join(process.env.HOME, "second-brain", "daily");
fs.mkdirSync(DATA_DIR, { recursive: true });

// Serve the HTML UI
app.use(express.static(path.join(__dirname, "public")));

function safeName(name) {
  // allow only YYYY-MM-DD.md
  return /^\d{4}-\d{2}-\d{2}\.md$/.test(name);
}

function entryPath(name) {
  return path.join(DATA_DIR, name);
}

// List entries
app.get("/api/entries", (req, res) => {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".md") && safeName(f))
    .sort()
    .reverse();

  res.json(files);
});

// Read one entry
app.get("/api/entries/:name", (req, res) => {
  const name = req.params.name;
  if (!safeName(name)) return res.status(400).json({ error: "Invalid filename" });

  const p = entryPath(name);
  if (!fs.existsSync(p)) return res.status(404).json({ error: "Not found" });

  res.json({ name, content: fs.readFileSync(p, "utf8") });
});

// Create/update entry
app.post("/api/entries/:name", (req, res) => {
  const name = req.params.name;
  if (!safeName(name)) return res.status(400).json({ error: "Invalid filename" });

  const content = req.body?.content;
  if (typeof content !== "string") return res.status(400).json({ error: "content must be a string" });

  fs.writeFileSync(entryPath(name), content, "utf8");
  res.json({ ok: true, name });
});

// Optional: delete entry
app.delete("/api/entries/:name", (req, res) => {
  const name = req.params.name;
  if (!safeName(name)) return res.status(400).json({ error: "Invalid filename" });

  const p = entryPath(name);
  if (!fs.existsSync(p)) return res.status(404).json({ error: "Not found" });

  fs.unlinkSync(p);
  res.json({ ok: true, name });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Journal running: http://0.0.0.0:${PORT}`);
});
