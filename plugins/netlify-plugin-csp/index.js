import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Recursively gather all .html files from the given directory.
 */
function getHtmlFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(itemPath));
    } else if (itemPath.endsWith('.html')) {
      results.push(itemPath);
    }
  }

  return results;
}

export default {
  /**
   * The onPostBuild hook runs after Netlify finishes building your site.
   * This is where we replace the CSP nonce placeholder and insert the nonce into <script> tags.
   */
  async onPostBuild({ constants }) {
    const publishDir = constants.PUBLISH_DIR;

    // 1. Generate a single random nonce for this build.
    const nonce = crypto.randomBytes(16).toString('base64');
    console.log(`Generated CSP nonce for this build: ${nonce}`);

    // 2. Check for a _headers file and replace 'nonce-{{nonce}}' with our real nonce.
    const headersFile = path.join(publishDir, '_headers');
    if (fs.existsSync(headersFile)) {
      let headersContent = fs.readFileSync(headersFile, 'utf-8');
      // Replace occurrences of 'nonce-{{nonce}}'
      headersContent = headersContent.replace(
        /'nonce-\{\{nonce\}\}'/g,
        `'nonce-${nonce}'`
      );
      fs.writeFileSync(headersFile, headersContent, 'utf-8');
      console.log(`Replaced nonce placeholder in _headers with nonce: ${nonce}`);
    } else {
      console.log('No _headers file found. Skipping CSP nonce replacement in headers.');
    }

    // 3. Insert the same nonce into every <script> tag in all built .html files.
    const htmlFiles = getHtmlFiles(publishDir);
    for (const htmlFile of htmlFiles) {
      let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

      // A simple regex to add nonce="..." to any <script> that doesn't already have a nonce.
      // If your HTML or <script> usage is complex, consider using an HTML parser.
      htmlContent = htmlContent.replace(
        /<script(?![^>]*\bnonce=)([^>]*)>/gi,
        `<script nonce="${nonce}" $1>`
      );

      fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
    }

    console.log(`Inserted nonce into <script> tags for ${htmlFiles.length} HTML files.`);
  },
};
