export default async (request, context) => {
    const response = await context.next();

    const existingCsp = response.headers.get("Content-Security-Policy") || "";

    const customCsp = "img-src 'self' blob: data:; upgrade-insecure-requests; script-src 'sha256-test'";

    const mergedCsp = existingCsp ? `${existingCsp}; ${customCsp}` : customCsp;

    response.headers.set("Content-Security-Policy", mergedCsp);
    
    return response;
};
