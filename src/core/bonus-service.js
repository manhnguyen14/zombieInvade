/**
 * Bonus Service
 * 
 * Handles bonus collection and application.
 * Manages gun bonuses for player and soldiers.
 */

import { ServiceLocator } from './service-locator.js';
import { GunType } from '../entities/components/gun.js';
import { PlayerSoldierService } from './player-soldier-service.js';

export class BonusService {
    /**
     * Create a new BonusService instance
     */
    constructor() {
        // Entity manager reference
        this.entityManager = null;
        
        // Event bus reference
        this.eventBus = null;
    }
    
    /**
     * Initialize the service
     */
    initialize() {
        // Get entity manager
        this.entityManager = ServiceLocator.getService('entityManager');
        if (!this.entityManager) {
            console.error('[BONUS_SERVICE] Entity manager not found');
            return;
        }
        
        console.log('[BONUS_SERVICE] Initialized');
    }
    
    /**
     * Update a bonus's timer
     * @param {Entity} bonusEntity - The bonus entity
     * @param {number} deltaTime - Time elapsed since last update in milliseconds
     * @returns {boolean} True if bonus is still valid, false if expired
     */
    updateBonusTimer(bonusEntity, deltaTime) {
        // only count down when in canvas
        const transform = bonusEntity.getComponent('transform');
        if (!transform) return false;
        if (transform.x < 10 || transform.x > 790) return true;

        const bonus = bonusEntity.getComponent('bonus');

        if (!bonus) return false;

        bonus.timeRemaining -= deltaTime;
        return bonus.timeRemaining > 0;
    }

    /**
     * Check if a bonus is expired
     * @param {Entity} bonusEntity - The bonus entity
     * @returns {boolean} True if bonus is expired
     */
    isBonusExpired(bonusEntity) {
        const bonus = bonusEntity.getComponent('bonus');
        if (!bonus) return true;

        return bonus.timeRemaining <= 0;
    }

    /**
     * Get bonus progress (0 to 1)
     * @param {Entity} bonusEntity - The bonus entity
     * @returns {number} Progress from 0 to 1
     */
    getBonusProgress(bonusEntity) {
        const bonus = bonusEntity.getComponent('bonus');
        if (!bonus) return 0;

        return bonus.timeRemaining / bonus.lifetime;
    }

    /**
     * Handle bonus collected event
     * @param {Entity} player - The player entity
     * @param {Entity} bonusEntity - The bonus entity
     */
    handleBonusCollected(player, bonusEntity) {
        const bonus = bonusEntity.getComponent('bonus');
        if (!bonus) return;

        switch (bonus.bonusType) {
            case 'gun':
                this.applyGunBonus(player, bonus.bonusVariant);
                break;
            case 'grenade':
                this.applyGrenadeBonus(player, bonus.bonusVariant);
                break;
            case 'soldier':
                this.applySoldierBonus(player);
                break;
            default:
                console.warn('[BONUS_SERVICE] Unknown bonus type:', bonusData.bonusType);
                break;
        }
    }
    
    /**
     * Apply gun bonus to player and soldiers
     * @param {Entity} playerEntity - Player entity
     * @param {string} gunType - Gun type
     */
    applyGunBonus(playerEntity, gunType) {
        console.log(`[BONUS_SERVICE] Applying gun bonus: ${gunType}`);
        if (!playerEntity || !playerEntity.hasTag('player')) {
            console.warn('[BONUS_SERVICE] Player instance not found');
            return;
        }
        // Find the Player entityManager from the game
        const game = ServiceLocator.getService('game');
        const entityManager = ServiceLocator.getService('entityManager');
        // Get all guns (player first, then all soldiers)
        const entities = [playerEntity];
        const liveSoldiers = PlayerSoldierService.getSoldiers(entityManager, playerEntity).filter(soldier => !PlayerSoldierService.isSoldierDead(soldier));
        entities.push(...liveSoldiers);
        // Store the current gun types before updating
        const guns = entities.map(entity => entity.getComponent('gun'));
        const oldGunTypes = guns.map(gun => gun ? gun.gunType : 'glock_17');
        // Apply new gun to player
        this.updateEntityGun(playerEntity, gunType);
        // Cascade guns down to soldiers
        for (let i = 1; i < entities.length; i++) {
            this.updateEntityGun(entities[i], oldGunTypes[i-1]);
        }
        console.log(`[BONUS_SERVICE] Cascaded guns through ${entities.length} entities`);
    }
    
    /**
     * Update an entity's gun
     * @param {Entity} entity - Entity to update
     * @param {string} gunType - Gun type
     */
    updateEntityGun(entity, gunType) {
        // Get gun component
        let gun = entity.getComponent('gun');
        
        // If entity doesn't have a gun component, add one
        if (!gun) {
            // Import gun component dynamically to avoid circular dependencies
            import('../entities/components/gun.js').then(module => {
                const GunComponent = module.GunComponent;
                gun = new GunComponent();
                gun.init({ gunType });
                entity.addComponent(gun);
                
                console.log(`[BONUS_SERVICE] Added gun component to entity ${entity.id} with gun type ${gunType}`);
            });
            return;
        }
        
        // Update gun type
        gun.setGunType(gunType);
        
        console.log(`[BONUS_SERVICE] Updated entity ${entity.id} gun to ${gunType}`);
    }
    /**
     * Apply grenade bonus to player and soldiers
     * @param {Entity} playerEntity - Player entity
     * @param {string} grenadeType - Grenade type
     */
    applyGrenadeBonus(playerEntity, grenadeType) {
        console.log(`[BONUS_SERVICE] Applying grenade bonus: ${grenadeType}`);
        if (!playerEntity || !playerEntity.hasTag('player')) {
            console.warn('[BONUS_SERVICE] Player instance not found');
            return;
        }
        PlayerSoldierService.addGrenades(playerEntity, grenadeType, 1);
    }

    /**
     * Apply soldier bonus to player and soldiers
     * @param {Entity} playerEntity - Player entity
     */
    applySoldierBonus(playerEntity) {
        console.log(`[BONUS_SERVICE] Applying soldier bonus`);
        if (!playerEntity || !playerEntity.hasTag('player')) {
            console.warn('[BONUS_SERVICE] Player instance not found');
            return;
        }
        const entityManager = ServiceLocator.getService('entityManager');
        PlayerSoldierService.addSoldier(entityManager, playerEntity);
    }

    /**
     * Clean up resources when the service is destroyed
     */
    destroy() {
        this.entityManager = null;
        this.eventBus = null;
    }
}