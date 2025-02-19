// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import type { Config, Context } from 'https://edge.netlify.com';
//@ts-ignore
import { csp } from 'https://deno.land/x/csp_nonce_html_transformer@v2.2.2/src/index-embedded-wasm.ts';


// Options for the dynamic nonce CSP transformer
const cspConfig = {
  strictDynamic: true,
  unsafeInline: true,
  self: true,
  https: true,
  http: true,
};

// Additional CSP directives
const cspExtensions = [
    "default-src 'none'",
    "style-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "img-src 'self'",
].join("; ");


export default async (request: Request, context: Context) => {
  try {
    const response = await context.next();

    // Only process HTML responses
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }
    
    // For debugging which routes use this edge function
    response.headers.set('x-debug-csp-nonce', 'invoked');

    // Apply the CSP transformation to inject dynamic nonces into <script> tags
    const responseWithNonce = await csp(response, cspConfig);

    // Append the additional CSP directives to the existing CSP header
    const currentCspHeader = responseWithNonce.headers.get('Content-Security-Policy') || '';
      
    responseWithNonce.headers.set(
      'Content-Security-Policy',
      `${currentCspHeader}; ${cspExtensions}`
    );

    return responseWithNonce;
      
  } catch (error) {
    console.error('Error in CSP Edge Function:', error);
    // Bypass the function on error so subsequent processing continues
    return void 0;
  }
};

// List of non-HTML asset file extensions to exclude from processing
const excludedExtensions = [
  'aspx', 'avif', 'babylon', 'bak', 'cgi', 'com', 'css', 'ds', 'env',
  'gif', 'gz', 'ico', 'ini', 'jpeg', 'jpg', 'js', 'json', 'jsp', 'log',
  'm4a', 'map', 'md', 'mjs', 'mp3', 'mp4', 'ogg', 'otf', 'pdf', 'php',
  'png', 'rar', 'sh', 'sql', 'svg', 'ttf', 'txt', 'wasm', 'wav', 'webm',
  'webmanifest', 'webp', 'woff', 'woff2', 'xml', 'xsd', 'yaml', 'yml', 'zip',
];

export const config: Config = {
  path: '/*', // Process all routes
  excludedPath: [
    '/.netlify*',
    `**/*.(${excludedExtensions.join('|')})`,
  ],
  onError: 'bypass',
  method: 'GET',
};
