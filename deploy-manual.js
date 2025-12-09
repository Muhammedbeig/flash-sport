const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- GET ARGS ---
const args = process.argv.slice(2);
const REPO_URL = args[0];
const TARGET_BRANCH = args[1] || 'gh-pages'; // Default to gh-pages
const BUILD_DIR = 'out';

if (!REPO_URL) {
  console.error("❌ Error: Repository URL is required.");
  console.error("Usage: node deploy-manual.js <REPO_URL> <BRANCH_NAME>");
  process.exit(1);
}
// ----------------

const run = (command) => {
  try {
    // stdio: 'inherit' lets you see the git output in real-time
    execSync(command, { stdio: 'inherit' });
  } catch (e) {
    console.error(`❌ Failed to execute: ${command}`);
    process.exit(1);
  }
};

const deploy = () => {
  const outPath = path.resolve(__dirname, BUILD_DIR);

  if (!fs.existsSync(outPath)) {
    console.error(`❌ Error: '${BUILD_DIR}' folder is missing. Run build first.`);
    process.exit(1);
  }

  console.log(`🚀 Preparing deployment to:`);
  console.log(`   Repo:   ${REPO_URL}`);
  console.log(`   Branch: ${TARGET_BRANCH}`);

  // Change directory to the build output 'out'
  process.chdir(outPath);

  // Initialize a temporary git repo just for this deployment
  // This method avoids the "Name Too Long" error on Windows
  run('git init');
  run(`git remote add origin ${REPO_URL}`);
  run('git checkout -b deploy-temp');
  run('git add -A');
  run('git commit -m "Deploy via manual script"');

  // Force push to the target branch
  console.log(`📤 Pushing to ${TARGET_BRANCH}...`);
  run(`git push -f origin deploy-temp:${TARGET_BRANCH}`);

  console.log('✅ Deployment Success!');
};

deploy();