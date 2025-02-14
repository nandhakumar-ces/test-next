const crypto = require('crypto');

exports.handler = async (event) => {
  // Generate a random nonce
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Construct full CSP with the nonce and all other directives
  const csp = `default-src 'self'; 
    script-src 'self' 'nonce-${nonce}'; 
    style-src 'self' 'unsafe-inline'; 
    img-src 'self' blob: data:; 
    connect-src 'self'; 
    font-src 'self'; 
    object-src 'none'; 
    base-uri 'self'; 
    form-action 'self'; 
    frame-ancestors 'self'; 
    upgrade-insecure-requests;`;
  
  return {
    statusCode: 200,
    headers: {
      'Content-Security-Policy': csp
    },
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Site</title>
          <script nonce="${nonce}">
            // Your inline scripts here
          </script>
        </head>
        <body>
          <!-- Your content here -->
        </body>
      </html>
    `
  };
};
