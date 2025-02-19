import { Config } from "@netlify/functions";
// @ts-ignore
import { csp } from "https://deno.land/x/csp_nonce_html_transformer@v2.2.2/src/index-embedded-wasm.ts";

export const handler = async (event) => {
  try {
    // Correctly reconstruct the full URL from the request event
    const siteUrl = process.env.URL || "https://your-site.netlify.app"; // Replace if needed
    const requestUrl = new URL(event.path, siteUrl).href;

    console.log("Processing request for:", requestUrl);

    // Fetch original response (forward the request)
    const response = await fetch(requestUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch original page: ${response.status}`);
    }

    // Ensure it's an HTML response before modifying
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response; // Skip non-HTML files (CSS, fonts, JS, etc.)
    }

    // Read the body (must be done before modifying headers)
    const body = await response.text();

    // Apply CSP transformation for script-src nonce
    const params = {
      strictDynamic: true,
      unsafeInline: true,
      self: true,
      https: true,
      http: true,
    };
    const transformedResponse = await csp(new Response(body, response), params);

    // Extract dynamically generated script-src policy
    const transformedCSP = transformedResponse.headers.get("Content-Security-Policy") || "";

    // Define additional CSP directives
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

    // Merge script-src nonce with other directives
    const finalCSP = `${transformedCSP}; ${additionalCSPDirectives}`;

    // Clone response and modify headers
    return new Response(body, {
      status: 200,
      headers: new Headers({
        "Content-Type": "text/html",
        "Content-Security-Policy": finalCSP,
        "x-debug-csp-nonce": "invoked",
      }),
    });

  } catch (error) {
    console.error("CSP Function Error:", error);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }
};

// Apply the function to all pages
export const config: Config = {
  path: "/*"
};
