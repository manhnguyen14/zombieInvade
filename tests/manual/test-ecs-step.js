/**
 * Step-by-Step ECS Testing Interface
 *
 * This file provides a manual testing interface for the Entity-Component-System framework.
 * It allows step-by-step execution and visualization of the ECS architecture.
 */

import { ServiceLocator } from '../../src/core/service-locator.js';
import { createDebugUI } from './debug-ui.js';
import { createTestSystems } from './test-systems.js';
import { addGameEventListeners } from './event-handlers.js';
import { globals, initGlobals } from './globals-test.js';
import { updateEntityList } from './ui-updaters.js';

// Function to run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Get the canvas element
    const canvas = document.getElementById('game-canvas');

    try {

        // Initialize global variables
        initGlobals(canvas);

        // Create the debug UI
        createDebugUI();

        // Create the test systems
        createTestSystems();

        // Add event listeners for game events
        addGameEventListeners();

        // Check if there's map data to load
        const mapData = localStorage.getItem('debugMapData');
        if (mapData) {
            try {
                const map = JSON.parse(mapData);
                console.log('Loading map data for debugging:', map.name);
                
                // Import the EntityAdapter dynamically
                import('../../src/ui/entity-adapter.js').then(module => {
                    const EntityAdapter = module.EntityAdapter;
                    
                    // Create entities from map data
                    EntityAdapter.createEntitiesFromMap(map);
                    
                    console.log(`Loaded ${map.objects.length} entities from map "${map.name}"`);
                    
                    // Update the entity list in the UI
                    updateEntityList();
                }).catch(error => {
                    console.error('Error importing EntityAdapter:', error);
                });
            } catch (error) {
                console.error('Error parsing map data:', error);
            }
        }

        // Add a debug method to check entities
        window.debugEntities = () => {
            const allEntities = globals.entityManager.getAllEntities();
        };

        // Add direct event listeners for K and ; keys
        window.addEventListener('keydown', (e) => {
            if (e.key === 'k' || e.key === 'K') {
                const speedController = ServiceLocator.getService('speedController');
                if (speedController) {
                    const newSpeed = speedController.decreasePlayerSpeed();

                    // Update speed display if it exists
                    const speedDisplay = document.getElementById('speed-display');
                    if (speedDisplay) {
                        speedDisplay.textContent = newSpeed;

                        // Change color based on speed
                        if (newSpeed <= 2) {
                            speedDisplay.style.color = 'rgba(255, 100, 100, 0.3)'; // Red for slow
                        } else if (newSpeed >= 6) {
                            speedDisplay.style.color = 'rgba(100, 255, 100, 0.3)'; // Green for fast
                        } else {
                            speedDisplay.style.color = 'rgba(255, 255, 255, 0.3)'; // White for normal
                        }
                    }
                }
            }
            if (e.key === ';' || e.key === ':') {
                const speedController = ServiceLocator.getService('speedController');
                if (speedController) {
                    const newSpeed = speedController.increasePlayerSpeed();

                    // Update speed display if it exists
                    const speedDisplay = document.getElementById('speed-display');
                    if (speedDisplay) {
                        speedDisplay.textContent = newSpeed;

                        // Change color based on speed
                        if (newSpeed <= 2) {
                            speedDisplay.style.color = 'rgba(255, 100, 100, 0.3)'; // Red for slow
                        } else if (newSpeed >= 6) {
                            speedDisplay.style.color = 'rgba(100, 255, 100, 0.3)'; // Green for fast
                        } else {
                            speedDisplay.style.color = 'rgba(255, 255, 255, 0.3)'; // White for normal
                        }
                    }
                }
            }
        });

        // Start the game in paused mode
        globals.game.start(true);

        // Initial render
        globals.game.step();

        // Log instructions
    } catch (error) {
        console.error('Failed to initialize Step-by-Step ECS Test:', error);
    }
});

