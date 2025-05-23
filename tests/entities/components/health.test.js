/**
 * HealthComponent Unit Tests
 * 
 * Tests for the HealthComponent class to ensure it correctly
 * manages health, damage, and healing.
 */

import { HealthComponent } from '../../../src/entities/components/health.js';

// Define the test suite for HealthComponent
suite('HealthComponent', () => {
    let healthComponent;
    
    // Create a new HealthComponent instance before each test
    beforeEach(() => {
        healthComponent = new HealthComponent();
    });
    
    // Test constructor
    test('constructor should initialize with default values', (assert) => {
        assert.equal(healthComponent.type, 'health', 'Component should have the correct type');
        assert.equal(healthComponent.currentHealth, 1, 'Default current health should be 1');
        assert.equal(healthComponent.maxHealth, 1, 'Default max health should be 1');
        assert.isFalse(healthComponent.invulnerable, 'Should not be invulnerable by default');
        assert.isFalse(healthComponent.isDead, 'Should not be dead by default');
        assert.equal(healthComponent.armor, 0, 'Default armor should be 0');
    });
    
    // Test init method
    test('init should set properties correctly', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10,
            invulnerable: true,
            armor: 2
        });
        
        assert.equal(healthComponent.currentHealth, 5, 'Current health should be set to 5');
        assert.equal(healthComponent.maxHealth, 10, 'Max health should be set to 10');
        assert.isTrue(healthComponent.invulnerable, 'Should be invulnerable');
        assert.equal(healthComponent.armor, 2, 'Armor should be set to 2');
        assert.isFalse(healthComponent.isDead, 'Should not be dead');
    });
    
    // Test reset method
    test('reset should restore health to max', (assert) => {
        healthComponent.init({
            currentHealth: 2,
            maxHealth: 10
        });
        
        healthComponent.takeDamage(5); // Reduce health to 2 - 5 = 0 (dead)
        assert.isTrue(healthComponent.isDead, 'Should be dead after taking damage');
        
        healthComponent.reset();
        assert.equal(healthComponent.currentHealth, 10, 'Current health should be restored to max');
        assert.isFalse(healthComponent.isDead, 'Should not be dead after reset');
    });
    
    // Test takeDamage method
    test('takeDamage should reduce health correctly', (assert) => {
        healthComponent.init({
            currentHealth: 10,
            maxHealth: 10
        });
        
        const damageTaken = healthComponent.takeDamage(3);
        
        assert.equal(damageTaken, 3, 'Should return the amount of damage taken');
        assert.equal(healthComponent.currentHealth, 7, 'Health should be reduced by damage amount');
        assert.isFalse(healthComponent.isDead, 'Should not be dead yet');
    });
    
    // Test takeDamage with armor
    test('takeDamage should account for armor', (assert) => {
        healthComponent.init({
            currentHealth: 10,
            maxHealth: 10,
            armor: 2
        });
        
        const damageTaken = healthComponent.takeDamage(5);
        
        assert.equal(damageTaken, 3, 'Damage taken should be reduced by armor');
        assert.equal(healthComponent.currentHealth, 7, 'Health should be reduced by damage minus armor');
    });
    
    // Test takeDamage with invulnerability
    test('takeDamage should not affect invulnerable entities', (assert) => {
        healthComponent.init({
            currentHealth: 10,
            maxHealth: 10,
            invulnerable: true
        });
        
        const damageTaken = healthComponent.takeDamage(5);
        
        assert.equal(damageTaken, 0, 'Invulnerable entities should take no damage');
        assert.equal(healthComponent.currentHealth, 10, 'Health should not change');
    });
    
    // Test takeDamage causing death
    test('takeDamage should set isDead when health reaches 0', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10
        });
        
        healthComponent.takeDamage(5);
        assert.equal(healthComponent.currentHealth, 0, 'Health should be 0');
        assert.isTrue(healthComponent.isDead, 'Should be dead when health reaches 0');
    });
    
    // Test heal method
    test('heal should restore health correctly', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10
        });
        
        const amountHealed = healthComponent.heal(3);
        
        assert.equal(amountHealed, 3, 'Should return the amount healed');
        assert.equal(healthComponent.currentHealth, 8, 'Health should be increased by heal amount');
    });
    
    // Test heal not exceeding max health
    test('heal should not exceed max health', (assert) => {
        healthComponent.init({
            currentHealth: 8,
            maxHealth: 10
        });
        
        const amountHealed = healthComponent.heal(5);
        
        assert.equal(amountHealed, 2, 'Should only heal up to max health');
        assert.equal(healthComponent.currentHealth, 10, 'Health should be capped at max health');
    });
    
    // Test heal on dead entity
    test('heal should not work on dead entities', (assert) => {
        healthComponent.init({
            currentHealth: 0,
            maxHealth: 10,
            isDead: true
        });
        
        const amountHealed = healthComponent.heal(5);
        
        assert.equal(amountHealed, 0, 'Dead entities cannot be healed');
        assert.equal(healthComponent.currentHealth, 0, 'Health should not change');
    });
    
    // Test setMaxHealth
    test('setMaxHealth should update max health correctly', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10
        });
        
        healthComponent.setMaxHealth(15);
        
        assert.equal(healthComponent.maxHealth, 15, 'Max health should be updated');
        assert.equal(healthComponent.currentHealth, 5, 'Current health should not change by default');
    });
    
    // Test setMaxHealth with healToFull
    test('setMaxHealth with healToFull should restore health', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10
        });
        
        healthComponent.setMaxHealth(15, true);
        
        assert.equal(healthComponent.maxHealth, 15, 'Max health should be updated');
        assert.equal(healthComponent.currentHealth, 15, 'Current health should be set to new max');
    });
    
    // Test setMaxHealth reducing current health
    test('setMaxHealth should reduce current health if needed', (assert) => {
        healthComponent.init({
            currentHealth: 10,
            maxHealth: 10
        });
        
        healthComponent.setMaxHealth(5);
        
        assert.equal(healthComponent.maxHealth, 5, 'Max health should be updated');
        assert.equal(healthComponent.currentHealth, 5, 'Current health should be capped at new max');
    });
    
    // Test kill method
    test('kill should set health to 0 and mark as dead', (assert) => {
        healthComponent.init({
            currentHealth: 10,
            maxHealth: 10
        });
        
        healthComponent.kill();
        
        assert.equal(healthComponent.currentHealth, 0, 'Health should be set to 0');
        assert.isTrue(healthComponent.isDead, 'Should be marked as dead');
    });
    
    // Test kill on invulnerable entity
    test('kill should not affect invulnerable entities', (assert) => {
        healthComponent.init({
            currentHealth: 10,
            maxHealth: 10,
            invulnerable: true
        });
        
        healthComponent.kill();
        
        assert.equal(healthComponent.currentHealth, 10, 'Invulnerable entities cannot be killed');
        assert.isFalse(healthComponent.isDead, 'Invulnerable entities should not be marked as dead');
    });
    
    // Test revive method
    test('revive should restore health and mark as alive', (assert) => {
        healthComponent.init({
            currentHealth: 0,
            maxHealth: 10,
            isDead: true
        });
        
        healthComponent.revive();
        
        assert.equal(healthComponent.currentHealth, 10, 'Health should be restored to max by default');
        assert.isFalse(healthComponent.isDead, 'Should be marked as alive');
    });
    
    // Test revive with specific health
    test('revive with specific health should set that health', (assert) => {
        healthComponent.init({
            currentHealth: 0,
            maxHealth: 10,
            isDead: true
        });
        
        healthComponent.revive(5);
        
        assert.equal(healthComponent.currentHealth, 5, 'Health should be set to specified value');
        assert.isFalse(healthComponent.isDead, 'Should be marked as alive');
    });
    
    // Test getHealthPercentage
    test('getHealthPercentage should return correct percentage', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10
        });
        
        const percentage = healthComponent.getHealthPercentage();
        
        assert.equal(percentage, 0.5, 'Health percentage should be 0.5 (5/10)');
    });
    
    // Test isAlive method
    test('isAlive should return correct status', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10
        });
        
        assert.isTrue(healthComponent.isAlive(), 'Should be alive with positive health');
        
        healthComponent.kill();
        
        assert.isFalse(healthComponent.isAlive(), 'Should not be alive after being killed');
    });
    
    // Test clone method
    test('clone should create a copy with the same properties', (assert) => {
        healthComponent.init({
            currentHealth: 5,
            maxHealth: 10,
            invulnerable: true,
            armor: 2
        });
        
        const clone = healthComponent.clone();
        
        assert.equal(clone.type, 'health', 'Clone should have the same type');
        assert.equal(clone.currentHealth, 5, 'Clone should have the same current health');
        assert.equal(clone.maxHealth, 10, 'Clone should have the same max health');
        assert.isTrue(clone.invulnerable, 'Clone should have the same invulnerability');
        assert.equal(clone.armor, 2, 'Clone should have the same armor');
        assert.isNull(clone.entity, 'Clone should not have an entity reference');
    });
});
