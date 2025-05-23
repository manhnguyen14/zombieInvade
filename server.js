/**
 * Local Development Server for Zombie Lane Defense
 *
 * This simple Express server serves the project files and resolves CORS issues
 * for running tests and the game locally.
 */

const express = require('express');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// Redirect root to home screen
app.get('/', (req, res) => {
  res.redirect('/src/ui/home-screen.html');
});

// Start the server
app.listen(PORT, () => {
  console.log(`
=======================================================
  Zombie Lane Defense Development Server
=======================================================

  Server running at: http://localhost:${PORT}

  Available endpoints:
  - Home Screen: http://localhost:${PORT}/src/ui/home-screen.html
  - Game: http://localhost:${PORT}/index.html
  - Unit Tests: http://localhost:${PORT}/tests/test-runner.html
  - Manual Tests: http://localhost:${PORT}/tests/manual/index.html
  - Map Editor: http://localhost:${PORT}/src/map-editor/index.html

  Press Ctrl+C to stop the server
=======================================================
`);
});
