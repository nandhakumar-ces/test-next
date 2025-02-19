

import { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  try {
    const response = await context.next();

    response.headers.set("x-debug-csp-nonce", "invoked");

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    const transformedResponse = await csp(response, params);

    const transformedCSP = transformedResponse.headers.get("Content-Security-Policy") || "";

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

    const finalCSP = `${transformedCSP}; ${additionalCSPDirectives}`;

    transformedResponse.headers.set("Content-Security-Policy", finalCSP);

    return transformedResponse;
  } catch (error) {
    console.error("function error:", error);
  }
};

export const config: Config = {
  path: "/*"
};
