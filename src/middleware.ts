import { NextResponse } from "next/server";

export function middleware() {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    `
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
    `.trim()
  );

  return response;
}
