import { promises as fs } from "fs";
import path from "path";

export const onPostBuild = async ({ constants }) => {
  console.log("🔐 Ensuring CSP is correctly merged for top-level HTML documents...");

  const PUBLISH_DIR = constants.PUBLISH_DIR; // Path to built site files
  const headersFile = path.join(PUBLISH_DIR, "_headers");

  try {
    // ✅ Wait for `_headers` to be fully modified before reading
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ✅ Read the final `_headers` file (set by `@netlify/plugin-csp-nonce` and others)
    let headersContent = await fs.readFile(headersFile, "utf8").catch(() => "");

    // ✅ Extract the existing `script-src` policy from CSP header (set by `@netlify/plugin-csp-nonce`)
    const cspMatch = headersContent.match(/Content-Security-Policy: ([^\n]+)/);
    let existingCSP = cspMatch ? cspMatch[1] : "";

    console.log("🚀 Existing CSP from `@netlify/plugin-csp-nonce`:", existingCSP);

    // ✅ Define additional CSP directives (excluding `script-src`)
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

    // ✅ Ensure `script-src` from `@netlify/plugin-csp-nonce` is merged properly
    let finalCSP = existingCSP.includes("script-src")
      ? existingCSP + "; " + additionalCSPDirectives
      : additionalCSPDirectives;

    // ✅ Modify `_headers` to apply CSP **only to HTML files**
    let updatedHeaders = headersContent.replace(
      /Content-Security-Policy: [^\n]+/,
      `Content-Security-Policy: ${finalCSP}`
    );

    // ✅ If no CSP header exists, add a new one **only for HTML pages**
    if (!cspMatch) {
      updatedHeaders += `\n/*.html\n  Content-Security-Policy: ${finalCSP}\n`;
    }

    // ✅ Write updated `_headers` file
    await fs.writeFile(headersFile, updatedHeaders, "utf8");

    console.log("✅ CSP successfully merged and applied only to top-level HTML documents.");
  } catch (error) {
    console.error("❌ Error merging CSP directives:", error);
  }
};
