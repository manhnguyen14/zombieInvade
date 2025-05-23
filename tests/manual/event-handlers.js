/**
 * Event Handlers Module
 *
 * Provides event handlers for the step-by-step ECS test.
 */

import { globals } from './globals-test.js';
import { updateEntityList, updateComponentPanel } from './ui-updaters.js';
import { createNormalZombie, createArmoredZombie, createGiantZombie, createSmallObstacle, createMediumObstacle, createLargeObstacle, createImpassableHazard, createSoldier, handleLaneCasualties } from './entity-factory.js';

/**
 * Add event listeners for game events
 */
export function addGameEventListeners() {
    // Listen for clicks on the canvas to select entities
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', (e) => {
        // Get click position relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find entity at click position
        const entities = globals.entityManager.getAllEntities();
        let clickedEntity = null;

        // Check in reverse order to select top entities first
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];

            // Skip lane background entities
            if (entity.hasTag('lane')) continue;

            // Check if entity has transform and render components
            if (entity.hasComponent('transform') && entity.hasComponent('render')) {
                const transform = entity.getComponent('transform');
                const render = entity.getComponent('render');

                // Simple bounding box check
                const halfWidth = render.width / 2;
                const halfHeight = render.height / 2;

                if (
                    x >= transform.x - halfWidth &&
                    x <= transform.x + halfWidth &&
                    y >= transform.y - halfHeight &&
                    y <= transform.y + halfHeight
                ) {
                    clickedEntity = entity;
                    break;
                }
            }
        }

        // Update selected entity
        globals.selectedEntity = clickedEntity;
        updateEntityList();
        updateComponentPanel();

    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Log key information for debugging
        console.log('Key pressed:', e.key, 'Key code:', e.code);
        // Don't handle shortcuts if typing in an input field
        if (e.target.tagName === 'INPUT') {
            return;
        }

        // Prevent default for our shortcuts
        if (['Delete', 'n', 'p', 's', 'r', 'c', '1', '2', '3', '4', '5', '6', '7', 'o', 'l', 'k', ';', 'a'].includes(e.key)) {
            e.preventDefault();
        }

        // Delete key: Remove selected entity
        if (e.key === 'Delete' && globals.selectedEntity) {
            globals.entityManager.removeEntity(globals.selectedEntity);
            globals.selectedEntity = null;
            updateEntityList();
            updateComponentPanel();
        }

        // 'n' key: Create new entity
        if (e.key === 'n') {
            const createEntityButton = document.querySelector('button:contains("Create Entity")');
            if (createEntityButton) {
                createEntityButton.click();
            }
        }

        // 'p' key: Create player entity
        if (e.key === 'p') {
            const createPlayerButton = document.querySelector('button:contains("Create Player")');
            if (createPlayerButton) {
                createPlayerButton.click();
            }
        }

        // 's' key: Step game
        if (e.key === 's') {
            const stepButton = document.querySelector('button:contains("Step")');
            if (stepButton) {
                stepButton.click();
            }
        }

        // 'r' key: Resume/pause game
        if (e.key === 'r') {
            if (globals.game.isPaused) {
                const resumeButton = document.querySelector('button:contains("Resume")');
                if (resumeButton) {
                    resumeButton.click();
                }
            } else {
                const pauseButton = document.querySelector('button:contains("Pause")');
                if (pauseButton) {
                    pauseButton.click();
                }
            }
        }

        // 'a' key: Add soldier
        if (e.key === 'a') {
            createSoldier();
        }

        // 'k' key: Kill lane
        if (e.key === 'k') {
            handleLaneCasualties();
        }

        // 'c' key: Clear console
        if (e.key === 'c' && e.ctrlKey) {
            console.clear();
            console.log('[DEBUG] Console cleared');
        }

        // '1' key: Create normal zombie
        if (e.key === '1') {
            createNormalZombie();
        }

        // '2' key: Create armored zombie
        if (e.key === '2') {
            createArmoredZombie();
        }

        // '3' key: Create giant zombie
        if (e.key === '3') {
            createGiantZombie();
        }

        // '4' key: Create small obstacle
        if (e.key === '4') {
            createSmallObstacle();
        }

        // '5' key: Create medium obstacle
        if (e.key === '5') {
            createMediumObstacle();
        }

        // '6' key: Create large obstacle
        if (e.key === '6') {
            createLargeObstacle();
        }

        // '7' key: Create impassable hazard
        if (e.key === '7') {
            createImpassableHazard();
        }
    });
}
