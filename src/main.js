/**
 * Zombie Lane Defense - Main Entry Point
 *
 * This file serves as the entry point for the game, initializing the core components
 * and starting the game loop.
 */

// Import the ECS framework test module
// Note: We're not importing the test module here anymore
// It will be loaded directly by the test HTML files

// The actual game initialization will be implemented here after testing
console.log('Main module loaded');

// Basic initialization code
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initializing...');

    // Get the canvas element
    const canvas = document.getElementById('game-canvas');

    // Create a message to direct users to the test pages
    const uiContainer = document.getElementById('ui-container');
    const message = document.createElement('div');
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.color = 'white';
    message.style.fontFamily = 'Arial, sans-serif';
    message.style.fontSize = '24px';
    message.style.textAlign = 'center';
    message.style.maxWidth = '80%';
    message.style.padding = '20px';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    message.style.borderRadius = '10px';

    message.innerHTML = `
        <h2>Zombie Lane Defense</h2>
        <p>The game is currently in development.</p>
        <p>Please visit the test pages to see the current progress:</p>
        <p><a href="tests/manual/index.html" style="color: #3498db;">Go to Test Pages</a></p>
    `;

    uiContainer.appendChild(message);

    // Fill the background with a dark color
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
