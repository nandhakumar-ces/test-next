// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import type { Config, Context } from 'https://edge.netlify.com';
// @ts-ignore
import { csp } from "https://deno.land/x/csp_nonce_html_transformer@v2.2.2/src/index-embedded-wasm.ts";

// Define CSP parameters for script-src nonce handling
const params = {
  strictDynamic: true,
  unsafeInline: true,
  self: true,
  https: true,
  http: true,
};

const handler = async (_request: Request, context: Context) => {
  try {
    const response = await context.next();

    // Debug header to confirm the function is invoked
    response.headers.set("x-debug-csp-nonce", "invoked");

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response; // Skip CSP for non-HTML files (e.g., fonts, CSS, JS)
    }

    // Apply CSP transformation for script-src nonce
    const transformedResponse = await csp(response, params);

    // Extract the dynamically generated script-src policy
    const transformedCSP = transformedResponse.headers.get("Content-Security-Policy") || "";

    // Define additional CSP directives (excluding script-src, which is handled dynamically)
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

    // Merge transformed script-src with additional CSP rules
    const finalCSP = `${transformedCSP}; ${additionalCSPDirectives}`;

    // Set the final Content-Security-Policy header
    transformedResponse.headers.set("Content-Security-Policy", finalCSP);

    return transformedResponse;
  } catch (error) {
    console.error("Edge function error:", error);
    return void 0;
  }
};

export const config: Config = {
  path: "/*",
  handler,
  onError: "bypass",
  method: "GET",
};

export default handler;
