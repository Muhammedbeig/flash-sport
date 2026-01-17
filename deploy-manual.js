const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// --- GET ARGS ---
const args = process.argv.slice(2);
const REPO_URL = args[0];
const TARGET_BRANCH = args[1] || "gh-pages";
const BUILD_DIR = "out";

if (!REPO_URL) {
  console.error("❌ Error: Repository URL is required.");
  console.error("Usage: node deploy-manual.js <REPO_URL> <BRANCH_NAME>");
  process.exit(1);
}

const run = (command, opts = {}) => {
  execSync(command, { stdio: "inherit", ...opts });
};

const deploy = () => {
  const outPath = path.resolve(process.cwd(), BUILD_DIR);

  if (!fs.existsSync(outPath)) {
    console.error(`❌ Error: '${BUILD_DIR}' folder is missing. Run build first.`);
    process.exit(1);
  }

  // ✅ IMPORTANT: remove the previous git repo inside /out
  const gitDir = path.join(outPath, ".git");
  if (fs.existsSync(gitDir)) {
    console.log("🧹 Cleaning previous out/.git ...");
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  console.log(`🚀 Preparing deployment to:`);
  console.log(`   Repo:   ${REPO_URL}`);
  console.log(`   Branch: ${TARGET_BRANCH}`);

  process.chdir(outPath);

  run("git init");
  run(`git remote add origin ${REPO_URL}`);
  run("git checkout -B deploy-temp");
  run("git add -A");

  // ✅ won't fail even if nothing changed
  run(`git commit --allow-empty -m "Deploy via manual script"`);

  console.log(`📤 Pushing to ${TARGET_BRANCH}...`);
  run(`git push -f origin deploy-temp:${TARGET_BRANCH}`);

  console.log("✅ Deployment Success!");
};

deploy();
