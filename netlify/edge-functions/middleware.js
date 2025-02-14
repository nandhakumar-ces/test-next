export default async (request, context) => {
    const response = await context.next();
    
    // Get existing CSP header
    const existingCsp = response.headers.get("Content-Security-Policy") || "";
    
    // Your custom CSP
    const customCsp = "img-src 'self' blob: data:; upgrade-insecure-requests; script-src 'sha256-test'";

    // Merge CSP
    const mergedCsp = existingCsp ? `${existingCsp}; ${customCsp}` : customCsp;

    // Set the merged CSP in response headers
    response.headers.set("Content-Security-Policy", mergedCsp);
    
    return response;
};
