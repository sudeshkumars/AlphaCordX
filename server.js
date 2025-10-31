const express = require('express');
const axios = require('axios');
const config = require('./config.json');
const db = require('./database');

const app = express();
const pendingStates = new Map();

function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

app.get('/files/:id', (req, res) => {
  const linkId = req.params.id;
  const link = db.getLink(linkId);
  
  if (!link) {
    return res.status(404).send('Link not found');
  }

  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.includes('Discordbot') || userAgent.includes('Discord')) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta property="og:title" content="TotalEntity File" />
        <meta property="og:description" content="Click to access your file securely" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#5865F2" />
      </head>
      <body>TotalEntity File Access</body>
      </html>
    `);
  }

  const state = generateState();
  pendingStates.set(state, {
    linkId: linkId,
    originalUrl: link.original_url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  const oauthUrl = `https://discord.com/api/oauth2/authorize?` +
    `client_id=${config.clientId}&` +
    `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
    `response_type=code&` +
    `scope=identify&` +
    `state=${state}`;

  res.redirect(oauthUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!state || !pendingStates.has(state)) {
    return res.status(400).send('Invalid state parameter');
  }

  const pendingData = pendingStates.get(state);
  pendingStates.delete(state);

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.redirectUri
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = userResponse.data;

    db.logClick(
      pendingData.linkId,
      userData,
      pendingData.ip,
      pendingData.userAgent
    );

    global.notifyClick({
      linkId: pendingData.linkId,
      user: userData,
      timestamp: Date.now()
    });

    res.redirect(pendingData.originalUrl);

  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

function startServer() {
  app.get('/', (req, res) => {
  res.send('Hello from TotalEntity!');
});

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🌐 Web server running on port ${config.port}`);
    console.log(`📍 Redirect URI: ${config.redirectUri}`);
  });
}

module.exports = { startServer };