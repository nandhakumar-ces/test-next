import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Apply CSP **only** to top-level HTML document requests
  const isHtmlRequest = request.nextUrl.pathname === '/' || request.nextUrl.pathname.endsWith('.html');

  if (!isHtmlRequest) {
    return NextResponse.next(); // Skip middleware for non-HTML requests
  }

  console.log("Generating CSP Secure Nonce....")

  // Generate a secure nonce
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const nonce = btoa(String.fromCharCode(...array));

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http: 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Set headers only for document requests
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  console.log("CSP Headers....")

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Apply middleware **only to document requests**
export const config = {
  matcher: '/', // You can extend this if needed
};
