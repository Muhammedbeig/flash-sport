const fs = require("fs");
const path = require("path");

const DEPLOY_TARGET = process.env.DEPLOY_TARGET || "hostinger";
const isGhPages = DEPLOY_TARGET === "gh-pages";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function rmIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  ensureDir(dest);

  // Node 16+ supports cpSync (Hostinger usually Node 18/20)
  if (fs.cpSync) {
    fs.cpSync(src, dest, { recursive: true });
    return;
  }

  // Fallback (rare)
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  // ✅ If we are exporting for GH pages, standalone prep is not needed.
  if (isGhPages) {
    console.log("ℹ️ DEPLOY_TARGET=gh-pages → skipping standalone preparation.");
    return;
  }

  const root = process.cwd();
  const standaloneDir = path.join(root, ".next", "standalone");

  if (!fs.existsSync(standaloneDir)) {
    console.error("❌ Standalone folder not found:", standaloneDir);
    console.error("Make sure next.config.ts has output: 'standalone' and you ran `next build`.");
    process.exit(1);
  }

  // ✅ Copy .next/static → .next/standalone/.next/static
  const staticSrc = path.join(root, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");
  rmIfExists(staticDest);
  copyDir(staticSrc, staticDest);

  // ✅ Copy public → .next/standalone/public (needed for /public assets)
  const publicSrc = path.join(root, "public");
  const publicDest = path.join(standaloneDir, "public");
  rmIfExists(publicDest);
  copyDir(publicSrc, publicDest);

  console.log("✅ Standalone build prepared:");
  console.log("   - .next/static copied to .next/standalone/.next/static");
  console.log("   - public copied to .next/standalone/public");
}

main();
