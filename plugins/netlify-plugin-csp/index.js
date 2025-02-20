const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// A small helper to find all HTML files in your publish directory
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(filePath));
    } else if (filePath.endsWith(".html")) {
      results.push(filePath);
    }
  });
  return results;
}

module.exports = {
  // Netlify calls this plugin after your site has been built.
  onPostBuild: async ({ constants }) => {
    const publishDir = constants.PUBLISH_DIR;

    // 1. Generate a random nonce (base64).
    const nonce = crypto.randomBytes(16).toString("base64");

    // 2. Replace `{{nonce}}` in your _headers file (if it exists).
    //    If you use netlify.toml for headers, you’d parse & replace that similarly.
    const headersFile = path.join(publishDir, "_headers");
    if (fs.existsSync(headersFile)) {
      let headersContent = fs.readFileSync(headersFile, "utf-8");
      headersContent = headersContent.replace(/'nonce-\{\{nonce\}\}'/g, `'nonce-${nonce}'`);
      fs.writeFileSync(headersFile, headersContent);
      console.log(`Replaced nonce placeholder in _headers with nonce: ${nonce}`);
    } else {
      console.log("No _headers file found. Skipping CSP nonce replacement in headers.");
    }

    // 3. Inject the same nonce into every <script> tag in all HTML files.
    const htmlFiles = getHtmlFiles(publishDir);
    htmlFiles.forEach((htmlFile) => {
      let htmlContent = fs.readFileSync(htmlFile, "utf-8");

      // For each <script> tag, we insert nonce="..."
      // A naive regex approach; for complex HTML you might need an HTML parser.
      htmlContent = htmlContent.replace(
        /<script(?![^>]*\bnonce=)([^>]*)>/gi,
        `<script nonce="${nonce}" $1>`
      );

      fs.writeFileSync(htmlFile, htmlContent, "utf-8");
    });

    console.log(`Inserted nonce into <script> tags for ${htmlFiles.length} HTML files.`);
  },
};
