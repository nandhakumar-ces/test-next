import { promises as fs } from "fs";
import path from "path";

export const onPostBuild = async ({ constants }) => {
  console.log("🔐 Merging CSP directives...");

  const PUBLISH_DIR = constants.PUBLISH_DIR; // Path to built site files
  const headersFile = path.join(PUBLISH_DIR, "_headers");

  try {
    // ✅ Read the existing `_headers` file (set by `@netlify/plugin-csp-nonce`)
    let headersContent = await fs.readFile(headersFile, "utf8").catch(() => "");

    // ✅ Extract the existing `script-src` policy from CSP header
    const cspMatch = headersContent.match(/Content-Security-Policy: ([^\n]+)/);
    let existingCSP = cspMatch ? cspMatch[1] : "";

    console.log("Existing CSP:", existingCSP);

    // ✅ Define additional CSP directives (excluding `script-src`, since it's handled by Netlify's plugin)
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

    // ✅ Ensure `script-src` from `@netlify/plugin-csp-nonce` is preserved
    let finalCSP = existingCSP.includes("script-src")
      ? existingCSP + "; " + additionalCSPDirectives
      : additionalCSPDirectives;

    // ✅ Append our new CSP rules without removing `script-src`
    let updatedHeaders = headersContent.replace(
      /Content-Security-Policy: [^\n]+/,
      `Content-Security-Policy: ${finalCSP}`
    );

    // ✅ If no CSP header exists, add a new one
    if (!cspMatch) {
      updatedHeaders += `\n/*\n  Content-Security-Policy: ${finalCSP}\n`;
    }

    // ✅ Write updated `_headers` file with merged CSP
    await fs.writeFile(headersFile, updatedHeaders, "utf8");

    console.log("✅ CSP successfully merged and updated.");
  } catch (error) {
    console.error("❌ Error merging CSP directives:", error);
  }
};
