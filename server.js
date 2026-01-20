/**
 * Hostinger/Node entry:
 * Prefer standalone build, fall back to Next's built-in server.
 * Build first: `npm run build`
 */
const fs = require("fs");
const path = require("path");

const standaloneServer = path.join(__dirname, ".next", "standalone", "server.js");

if (fs.existsSync(standaloneServer)) {
  require(standaloneServer);
} else {
  const { createServer } = require("http");
  const { parse } = require("url");
  const next = require("next");

  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();
  const port = Number(process.env.PORT || 3000);

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
}
