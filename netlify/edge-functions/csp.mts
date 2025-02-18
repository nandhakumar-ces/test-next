// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import type { Config, Context } from 'https://edge.netlify.com';
// @ts-ignore
import { csp } from "https://deno.land/x/csp_nonce_html_transformer@v2.2.2/src/index-embedded-wasm.ts";

type Params = {
  // reportOnly: boolean;
  // reportUri?: string;
  // unsafeEval: boolean;
  path: string | string[];
  excludedPath: string[];
  // distribution?: string;
  strictDynamic?: boolean;
  unsafeInline?: boolean;
  self?: boolean;
  https?: boolean;
  http?: boolean;
};

const params = {
  strictDynamic: true,
  unsafeInline: true,
  self: true,
  https: true,
  http: true,
} as Params;

const handler = async (_request: Request, context: Context) => {
  try {
    const response = await context.next();
    response.headers.set("x-debug-csp-nonce", "invoked");

    // First, let csp() apply its transformation
    const transformedResponse = await csp(response, params);

    // Extract the dynamically generated CSP header
    const transformedCSP = transformedResponse.headers.get("Content-Security-Policy") || "";

    // Define other CSP directives (excluding script-src)
    const additionalCSPDirectives = [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "object-src 'none'",
    ].join("; ");

    // Merge transformed script-src with other directives
    const finalCSP = `${transformedCSP}; ${additionalCSPDirectives}`;

    // Set the final CSP header
    transformedResponse.headers.set("Content-Security-Policy", finalCSP);

    return transformedResponse;
  } catch {
    return void 0;
  }
};

// Top 50 most common extensions (minus .html and .htm) according to Humio
const excludedExtensions = [
  "aspx",
  "avif",
  "babylon",
  "bak",
  "cgi",
  "com",
  "css",
  "ds",
  "env",
  "gif",
  "gz",
  "ico",
  "ini",
  "jpeg",
  "jpg",
  "js",
  "json",
  "jsp",
  "log",
  "m4a",
  "map",
  "md",
  "mjs",
  "mp3",
  "mp4",
  "ogg",
  "otf",
  "pdf",
  "php",
  "png",
  "rar",
  "sh",
  "sql",
  "svg",
  "ttf",
  "txt",
  "wasm",
  "wav",
  "webm",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
  "xml",
  "xsd",
  "yaml",
  "yml",
  "zip",
];

export const config: Config = {
  path: "/*",
  excludedPath: ["/.netlify*", `**/*.(${excludedExtensions.join("|")})`],
  handler,
  onError: "bypass",
  method: "GET",
};

export default handler;
