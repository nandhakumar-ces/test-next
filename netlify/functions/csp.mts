import { Config, Context } from "@netlify/functions";
// @ts-ignore
import { csp } from "https://deno.land/x/csp_nonce_html_transformer@v2.2.2/src/index-embedded-wasm.ts";

export default async (req: Request, context: Context) => {
  try {
    // Fetch the original request
    const response = await fetch(req.rawUrl);

    // Ensure it's an HTML response before modifying
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response; // Skip non-HTML responses (CSS, fonts, JS, etc.)
    }

    // Apply CSP transformation for script-src nonce
    const params = {
      strictDynamic: true,
      unsafeInline: true,
      self: true,
      https: true,
      http: true,
    };
    const transformedResponse = await csp(response, params);

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

    // ✅ Correct way to modify response (clone the response and add headers)
    const modifiedResponse = new Response(await transformedResponse.text(), {
      status: transformedResponse.status,
      statusText: transformedResponse.statusText,
      headers: new Headers({
        ...Object.fromEntries(transformedResponse.headers.entries()), // Copy existing headers
        "Content-Security-Policy": finalCSP,
        "x-debug-csp-nonce": "invoked",
      }),
    });

    return modifiedResponse;

  } catch (error) {
    console.error("Function error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// ✅ Path configuration is correct, no need to modify this
export const config: Config = {
  path: "/*"
};
