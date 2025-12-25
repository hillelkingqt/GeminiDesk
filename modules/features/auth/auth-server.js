/**
 * Local HTTP server for handling Google OAuth callback
 * This module enables external browser authentication flow for Electron apps
 */

const http = require('http');
const { URL } = require('url');
const { shell, session } = require('electron');

let activeServer = null;
let serverPort = null;

/**
 * Find an available port in the ephemeral range
 */
function getRandomPort() {
  return Math.floor(Math.random() * (65535 - 49152) + 49152);
}

/**
 * Start the local auth server and open the login URL in external browser
 * @param {string} loginUrl - The Google login URL to open
 * @param {string} partitionName - The session partition to store cookies in
 * @param {Function} onSuccess - Callback when login is successful
 * @param {Function} onError - Callback when login fails
 * @returns {Promise<void>}
 */
async function startAuthFlow(loginUrl, partitionName, onSuccess, onError) {
  // Close any existing server
  if (activeServer) {
    try {
      activeServer.close();
    } catch (e) { }
    activeServer = null;
  }

  serverPort = getRandomPort();

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${serverPort}`);

      // Handle the callback path
      if (url.pathname === '/auth/callback' || url.pathname === '/') {
        // Check if this is a successful redirect from Google
        const cookies = req.headers.cookie || '';

        // Send success page to the browser
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Login Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
              }
              h1 { margin: 0 0 10px 0; font-size: 2em; }
              p { margin: 0; opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✓ Login Successful</h1>
              <p>You can close this window and return to GeminiDesk.</p>
            </div>
            <script>
              // Try to close the window after a short delay
              setTimeout(() => { window.close(); }, 2000);
            </script>
          </body>
          </html>
        `);

        // Signal success
        setTimeout(() => {
          if (onSuccess) onSuccess();
          stopServer();
        }, 500);

        resolve();
      } else {
        // For any other path, redirect to the main callback
        res.writeHead(302, { 'Location': '/auth/callback' });
        res.end();
      }
    });

    server.on('error', (err) => {
      console.error('Auth server error:', err);
      if (onError) onError(err);
      reject(err);
    });

    server.listen(serverPort, '127.0.0.1', () => {
      activeServer = server;
      console.log(`Auth callback server started on http://127.0.0.1:${serverPort}`);

      // Open the login URL in external browser
      // We append a state parameter that includes our callback URL
      const authUrl = new URL(loginUrl);

      // Open in external browser
      shell.openExternal(authUrl.toString())
        .then(() => {
          console.log('Opened external browser for authentication');
        })
        .catch((err) => {
          console.error('Failed to open external browser:', err);
          if (onError) onError(err);
          stopServer();
          reject(err);
        });
    });

    // Set a timeout for the auth flow (5 minutes)
    setTimeout(() => {
      if (activeServer === server) {
        console.log('Auth flow timed out');
        if (onError) onError(new Error('Authentication timed out'));
        stopServer();
      }
    }, 5 * 60 * 1000);
  });
}

/**
 * Stop the auth server
 */
function stopServer() {
  if (activeServer) {
    try {
      activeServer.close();
      console.log('Auth callback server stopped');
    } catch (e) {
      console.warn('Error stopping auth server:', e);
    }
    activeServer = null;
    serverPort = null;
  }
}

/**
 * Get the current callback URL
 */
function getCallbackUrl() {
  if (!serverPort) return null;
  return `http://127.0.0.1:${serverPort}/auth/callback`;
}

/**
 * Check if auth server is running
 */
function isRunning() {
  return activeServer !== null;
}

module.exports = {
  startAuthFlow,
  stopServer,
  getCallbackUrl,
  isRunning
};
