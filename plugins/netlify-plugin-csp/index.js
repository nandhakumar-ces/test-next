import fs from "fs";
import path from "path";
import crypto from "crypto";

// Recursively find all .html files in a directory.
function getHtmlFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(itemPath));
    } else if (itemPath.endsWith(".html")) {
      results.push(itemPath);
    }
  }
  return results;
}

export default {
  async onPostBuild({ constants }) {
    const publishDir = constants.PUBLISH_DIR; 

    console.log(publishDir, "publish Directory....");

    const nonce = crypto.randomBytes(16).toString("base64");
    console.log(`\n[static-nonce-plugin] Generated nonce: ${nonce}\n`);

    const headersFile = path.join(publishDir, "_headers");
    console.log(headersFile, "headers file..........");
    
    if (fs.existsSync(headersFile)) {
      let headersContent = fs.readFileSync(headersFile, "utf-8");
      headersContent = headersContent.replace(
        /'nonce-\{\{nonce\}\}'/g,
        `'nonce-${nonce}'`
      );
      fs.writeFileSync(headersFile, headersContent, "utf-8");
      console.log(`[static-nonce-plugin] Replaced nonce placeholder in _headers with: ${nonce}`);
    } else {
      console.log("[static-nonce-plugin] No _headers file found in publish directory.");
    }

    const htmlFiles = getHtmlFiles(publishDir);

    console.log(htmlFiles, "html files..........");
    
    for (const htmlFile of htmlFiles) {
      let htmlContent = fs.readFileSync(htmlFile, "utf-8");

      htmlContent = htmlContent.replace(
        /<script(?![^>]*\bnonce=)([^>]*)>/gi,
        `<script nonce="${nonce}" $1>`
      );

      fs.writeFileSync(htmlFile, htmlContent, "utf-8");
    }
    console.log(`[static-nonce-plugin] Inserted nonce into <script> tags in ${htmlFiles.length} HTML files.\n`);
  },
};
