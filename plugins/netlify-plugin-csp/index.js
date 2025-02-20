export default {
  onPreBuild({ netlifyConfig }) {
    console.log(netlifyConfig, "Netlify Configurations........");
    const { headers } = netlifyConfig;
    console.log(headers, "Headers from Netlify Configurations........");
    
    netlifyConfig.headers.push({
      for: "/*",
      values: {
        "Content-Security-Policy":
          "default-src 'self'; object-src 'none'; img-src 'self' https://trusted.example.com;",
      },
    });

    console.log(netlifyConfig.headers, "Updated headers with custom csp directives");
  },
};
