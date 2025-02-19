import { promises as fs } from "fs";
import path from "path";

export const onPostBuild = async ({ constants, netlifyConfig }) => {
  console.log("Merging CSP directives...");

  const PUBLISH_DIR = constants.PUBLISH_DIR; // Path to built files
  const headersFile = path.join(PUBLISH_DIR, "_headers");

  // Read existing `_headers` file (set by `@netlify/plugin-csp-nonce`)
  let headersContent = await fs.readFile(headersFile, "utf8").catch(() => "");

  // Extract the existing `script-src` policy from the CSP header
  const cspMatch = headersContent.match(/Content-Security-Policy: ([^\n]+)/);
  let existingCSP = cspMatch ? cspMatch[1] : "";

  console.log("Existing CSP:", existingCSP);

  // Define additional CSP directives (excluding `script-src`)
  const additionalCSPDirectives = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://cdn.example.com",
    "connect-src 'self' https://api.example.com",
    "frame-src 'self' https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  // Merge `script-src` from the existing CSP with other directives
  const finalCSP = existingCSP
    ? existingCSP + "; " + additionalCSPDirectives
    : additionalCSPDirectives;

  // Write updated `_headers` file with merged CSP policy
  const updatedHeaders = headersContent.replace(/Content-Security-Policy: [^\n]+/, `Content-Security-Policy: ${finalCSP}`);

  await fs.writeFile(headersFile, updatedHeaders, "utf8");

  console.log("✅ CSP successfully merged and updated.");
};
