/**
 * Test Shooting Module
 * 
 * Tests the shooting mechanic, gun bonuses, and bullet damage.
 */

import { globals } from './globals-test.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { ShootingSystem } from '../../src/systems/shooting-system.js';
import { BonusService } from '../../src/core/bonus-service.js';
import { GunType } from '../../src/entities/components/gun.js';
import { EntityFactory } from '../../src/entities/entity-factory.js';
import { CollisionType } from '../../src/entities/components/collision.js';

/**
 * Initialize the shooting test
 */
export function initShootingTest() {
    console.log('[TEST_SHOOTING] Initializing shooting test...');
    
    // Create and register the shooting system
    const shootingSystem = new ShootingSystem();
    globals.systems.shootingSystem = shootingSystem;
    ServiceLocator.registerService('shootingSystem', shootingSystem);
    
    // Create and register the bonus service
    const bonusService = new BonusService();
    ServiceLocator.registerService('bonusService', bonusService);
    
    // Add the shooting system to the game
    globals.game.addSystem(shootingSystem);
    
    // Initialize the bonus service
    bonusService.initialize();
    
    // Create UI for gun bonuses
    createGunBonusUI();
    
    // Create test enemies
    createTestEnemies();
    
    console.log('[TEST_SHOOTING] Shooting test initialized');
}

/**
 * Create UI for gun bonuses
 */
function createGunBonusUI() {
    // Create a container for the gun bonus controls
    const container = document.createElement('div');
    container.className = 'gun-bonus-controls';
    container.style.position = 'absolute';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.padding = '10px';
    container.style.borderRadius = '5px';
    container.style.color = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Create a label
    const label = document.createElement('div');
    label.textContent = 'Gun Bonuses:';
    container.appendChild(label);
    
    // Create buttons for each gun type
    const gunTypes = [
        { type: GunType.GLOCK_17, label: 'Glock 17' },
        { type: GunType.DESERT_EAGLE, label: 'Desert Eagle' },
        { type: GunType.BENELLI_M4, label: 'Benelli M4' },
        { type: GunType.AK47, label: 'AK47' },
        { type: GunType.BARRETT_XM109, label: 'Barrett XM109' }
    ];
    
    // Create a div for the buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '5px';
    buttonsContainer.style.marginTop = '5px';
    
    // Add buttons for each gun type
    for (const gun of gunTypes) {
        const button = document.createElement('button');
        button.textContent = gun.label;
        button.onclick = () => {
            applyGunBonus(gun.type);
        };
        buttonsContainer.appendChild(button);
    }
    
    container.appendChild(buttonsContainer);
    document.body.appendChild(container);
}

/**
 * Apply a gun bonus to the player
 * @param {string} gunType - Gun type
 */
function applyGunBonus(gunType) {
    console.log(`[TEST_SHOOTING] Applying gun bonus: ${gunType}`);
    
    // Get the player entity
    const entityManager = ServiceLocator.getService('entityManager');
    const playerEntities = entityManager.getEntitiesWithTag('player');
    
    if (playerEntities.length === 0) {
        console.error('[TEST_SHOOTING] No player entity found');
        return;
    }
    
    const playerEntity = playerEntities[0];
    
    // Get the bonus service
    const bonusService = ServiceLocator.getService('bonusService');
    if (!bonusService) {
        console.error('[TEST_SHOOTING] Bonus service not found');
        return;
    }
    
    // Apply the gun bonus
    bonusService.applyGunBonus(playerEntity, gunType);
}

/**
 * Create test enemies
 */
function createTestEnemies() {
    console.log('[TEST_SHOOTING] Creating test enemies...');
    
    // Get the entity manager
    const entityManager = ServiceLocator.getService('entityManager');
    if (!entityManager) {
        console.error('[TEST_SHOOTING] Entity manager not found');
        return;
    }
    
    // Create enemies in each lane
    for (let lane = 1; lane <= 8; lane++) {
        // Skip lane 8 (bonus lane)
        if (lane === 8) continue;
        
        // Create a normal zombie in this lane
        const zombie = EntityFactory.createZombie(entityManager, 'normal', 'Standard', {
            laneIndex: lane,
            x: 700, // Position on the right side of the screen
            y: lane * 60 + 30 // Position in the middle of the lane
        });
        
        console.log(`[TEST_SHOOTING] Created zombie in lane ${lane}`);
    }
}

/**
 * Clean up the shooting test
 */
export function cleanupShootingTest() {
    console.log('[TEST_SHOOTING] Cleaning up shooting test...');
    
    // Remove the shooting system
    if (globals.systems.shootingSystem) {
        globals.game.removeSystem(globals.systems.shootingSystem);
        delete globals.systems.shootingSystem;
    }
    
    // Remove the bonus service
    const bonusService = ServiceLocator.getService('bonusService');
    if (bonusService) {
        bonusService.destroy();
        ServiceLocator.unregisterService('bonusService');
    }
    
    // Remove the gun bonus UI
    const container = document.querySelector('.gun-bonus-controls');
    if (container) {
        container.remove();
    }
    
    console.log('[TEST_SHOOTING] Shooting test cleaned up');
}