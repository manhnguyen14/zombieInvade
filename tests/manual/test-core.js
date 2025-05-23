/**
 * Test Core Components
 * 
 * This file provides a simple test to verify that the core components
 * work together correctly. It can be used to manually test the functionality
 * of the ServiceLocator, Game, Renderer, InputHandler, and Timer classes.
 */

import { ServiceLocator } from '../../src/core/service-locator.js';
import { Game } from '../../src/core/game.js';

// Function to run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Testing core components...');
    
    // Get the canvas element
    const canvas = document.getElementById('game-canvas');
    
    // Create a test UI element to display input and timer information
    const uiContainer = document.getElementById('ui-container');
    const testUI = document.createElement('div');
    testUI.style.position = 'absolute';
    testUI.style.top = '10px';
    testUI.style.left = '10px';
    testUI.style.color = 'white';
    testUI.style.fontFamily = 'monospace';
    testUI.style.fontSize = '14px';
    testUI.style.pointerEvents = 'none';
    uiContainer.appendChild(testUI);
    
    try {
        // Initialize the game with configuration
        const gameConfig = {
            canvas: canvas,
            width: 800,
            height: 600
        };
        
        // Create and start the game
        const game = new Game(gameConfig);
        
        // Register the game instance with the service locator
        ServiceLocator.registerService('game', game);
        
        // Get services from the service locator
        const renderer = ServiceLocator.getService('renderer');
        const inputHandler = ServiceLocator.getService('input');
        const timer = ServiceLocator.getService('timer');
        
        // Create a test timer that changes background color every 2 seconds
        let colorIndex = 0;
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
        
        timer.setInterval(2, () => {
            colorIndex = (colorIndex + 1) % colors.length;
        });
        
        // Start the game loop
        game.start();
        
        console.log('Core components test initialized successfully');
    } catch (error) {
        console.error('Failed to initialize core components test:', error);
        testUI.innerText = `ERROR: ${error.message}`;
    }
});
