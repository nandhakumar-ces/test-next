// netlify/csp-middleware.ts

import type { Config, Context } from "https://edge.netlify.com";
import { csp } from "https://deno.land/x/csp_nonce_html_transformer@v2.2.2/src/index-embedded-wasm.ts";

// Define CSP parameters for dynamic nonce injection.
type Params = {
  reportOnly: boolean;
  reportUri?: string;
  unsafeEval: boolean;
  path: string | string[];
  excludedPath: string[];
  strictDynamic?: boolean;
  unsafeInline?: boolean;
  self?: boolean;
  https?: boolean;
  http?: boolean;
};

const cspParams: Params = {
  reportOnly: false,
  reportUri: "/api/csp-violations", // Set your report endpoint here.
  unsafeEval: false,
  path: "/*", // Applies to all paths.
  excludedPath: [], // No additional exclusions; see below in the config.
  strictDynamic: true,       // Use strict-dynamic for script-src.
  unsafeInline: true,        // Allows inline scripts if they have a valid nonce.
  self: true,
  https: true,
  http: true,
};

export const handler = async (request: Request, context: Context) => {
  // Get the original response from the next middleware or origin.
  const response = await context.next();

  // Process only HTML responses.
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  // Optionally bypass CSP transformation (e.g., for debugging).
  const url = new URL(request.url);
  if (url.searchParams.get("nocsp") === "true") {
    return response;
  }

  // Prevent caching so that each response gets a fresh nonce.
  response.headers.set("cache-control", "no-store");

  // Apply the CSP transformation to inject dynamic nonces into <script> tags.
  const transformedResponse = await csp(response, cspParams);

  // Append additional CSP directives.
  // For example: disallow object embedding and restrict image sources.
  const currentCsp = transformedResponse.headers.get("Content-Security-Policy") || "";
  const additionalDirectives = " object-src 'none'; img-src 'self' https://trusted-images.example.com;";
  transformedResponse.headers.set("Content-Security-Policy", `${currentCsp} ${additionalDirectives}`);

  return transformedResponse;
};

export const config: Config = {
  // Apply this middleware to all routes.
  path: "/*",
  // Exclude known static assets (adjust as needed for your site).
  excludedPath: ["/.netlify*", "**/*.{js,css,png,jpg,jpeg,gif,svg,ico,json}"],
  handler,
  onError: "bypass",
  method: "GET",
};

export default handler;
