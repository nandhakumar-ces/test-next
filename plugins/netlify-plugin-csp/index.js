export default {
  onEnd({ netlifyConfig }) {
    console.log(netlifyConfig, "Netlify Configurations........");
    // 1. Read existing headers (possibly updated by the previous plugin)
    const { headers } = netlifyConfig;
    console.log(headers, "Headers from Netlify Configurations........");
    
    // 2. Find any CSP header entries
    headers.forEach((header) => {
      if (header.values["Content-Security-Policy"]) {
        // Merge your additional directives here
        const currentCsp = header.values["Content-Security-Policy"];
        const extraDirectives = "object-src 'none'; img-src 'self';";
        header.values["Content-Security-Policy"] = `${currentCsp}; ${extraDirectives}`;
      }
    });

    // 3. Save back into netlifyConfig (in-place mutation is typically enough)
    netlifyConfig.headers = headers;
  },
};
