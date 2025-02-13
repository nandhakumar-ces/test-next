export default async (request, context) => {
  // Generate a secure nonce using crypto.randomUUID() and encode with btoa()
  const nonce = btoa(crypto.randomUUID());

  // Define CSP with dynamic nonce
  const cspHeader = `
    default-src 'self';
    object-src 'none';
    script-src 'self' 'nonce-${nonce}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self' data:;
    connect-src 'self' https:;
    frame-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, " ").trim(); // Clean up spaces

  // Modify response headers
  const response = await context.next();
  response.headers.set("Content-Security-Policy", cspHeader);
  
  return response;
};
