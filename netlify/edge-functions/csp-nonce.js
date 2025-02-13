export default async (request, context) => {
  // Generate a dynamic nonce per request
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

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
  `.replace(/\s{2,}/g, " ").trim(); // Remove extra spaces

  // Modify the response to include CSP header
  const response = await context.next();
  response.headers.set("Content-Security-Policy", cspHeader);
  
  return response;
};
