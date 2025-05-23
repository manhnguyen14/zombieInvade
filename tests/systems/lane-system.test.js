/**
 * Lane System Unit Tests
 * 
 * Tests for the LaneSystem class to ensure it correctly
 * manages lane-based positioning and logic.
 */

import { LaneSystem } from '../../src/systems/lane-system.js';
import { EntityManager } from '../../src/core/entity-manager.js';
import { ServiceLocator } from '../../src/core/service-locator.js';
import { Entity } from '../../src/entities/entity.js';
import { LaneComponent } from '../../src/entities/components/lane.js';
import { TransformComponent } from '../../src/entities/components/transform.js';

// Define the test suite for LaneSystem
suite('LaneSystem', () => {
    let laneSystem;
    let entityManager;
    
    // Set up before each test
    beforeEach(() => {
        // Create entity manager and register it with service locator
        entityManager = new EntityManager();
        ServiceLocator.registerService('entityManager', entityManager);
        
        // Create lane system with test configuration
        laneSystem = new LaneSystem({
            laneCount: 9,
            laneHeight: 50,
            laneWidth: 600,
            bonusLaneColor: '#ff0000',
            combatLaneColor: '#0000ff'
        });
    });
    
    // Clean up after each test
    afterEach(() => {
        ServiceLocator.removeService('entityManager');
    });
    
    // Test constructor
    test('constructor should initialize with correct configuration', (assert) => {
        assert.equal(laneSystem.laneCount, 9, 'Lane count should be 9');
        assert.equal(laneSystem.laneHeight, 50, 'Lane height should be 50');
        assert.equal(laneSystem.laneWidth, 600, 'Lane width should be 600');
        assert.equal(laneSystem.bonusLaneColor, '#ff0000', 'Bonus lane color should be #ff0000');
        assert.equal(laneSystem.combatLaneColor, '#0000ff', 'Combat lane color should be #0000ff');
    });
    
    // Test initialize method
    test('initialize should create lane background entities', (assert) => {
        // Initialize the lane system
        laneSystem.initialize();
        
        // Check that lane entities were created
        assert.equal(laneSystem.laneEntities.length, 9, 'Should create 9 lane entities');
        
        // Check that entities have correct components and tags
        for (let i = 0; i < laneSystem.laneCount; i++) {
            const entity = laneSystem.laneEntities[i];
            
            assert.isTrue(entity.hasComponent('transform'), `Lane ${i} should have transform component`);
            assert.isTrue(entity.hasComponent('render'), `Lane ${i} should have render component`);
            assert.isTrue(entity.hasComponent('lane'), `Lane ${i} should have lane component`);
            assert.isTrue(entity.hasTag('lane'), `Lane ${i} should have 'lane' tag`);
            assert.isTrue(entity.hasTag('background'), `Lane ${i} should have 'background' tag`);
            
            // Check lane component values
            const lane = entity.getComponent('lane');
            assert.equal(lane.laneIndex, i, `Lane ${i} should have correct lane index`);
            assert.equal(lane.laneWidth, 600, `Lane ${i} should have correct lane width`);
            assert.equal(lane.laneHeight, 50, `Lane ${i} should have correct lane height`);
            
            // Check transform component values
            const transform = entity.getComponent('transform');
            assert.equal(transform.x, 300, `Lane ${i} should have correct x position`);
            assert.equal(transform.y, i * 50 + 25, `Lane ${i} should have correct y position`);
        }
    });
    
    // Test processEntity method
    test('processEntity should update entity position based on lane', (assert) => {
        // Initialize the lane system
        laneSystem.initialize();
        
        // Create a test entity
        const entity = entityManager.createEntity();
        
        // Add transform component
        const transform = new TransformComponent();
        transform.init({ x: 100, y: 100 });
        entity.addComponent(transform);
        
        // Add lane component
        const lane = new LaneComponent();
        lane.init({ laneIndex: 3 });
        entity.addComponent(lane);
        
        // Process the entity
        laneSystem.processEntity(entity, 0.016);
        
        // Check that the entity's position was updated
        assert.equal(transform.y, 3 * 50 + 25, 'Entity should be positioned in lane 3');
        assert.equal(transform.x, 100, 'Entity x position should not change');
    });
    
    // Test lane utility methods
    test('lane utility methods should work correctly', (assert) => {
        // Test isValidLane
        assert.isTrue(laneSystem.isValidLane(0), 'Lane 0 should be valid');
        assert.isTrue(laneSystem.isValidLane(8), 'Lane 8 should be valid');
        assert.isFalse(laneSystem.isValidLane(-1), 'Lane -1 should be invalid');
        assert.isFalse(laneSystem.isValidLane(9), 'Lane 9 should be invalid');
        
        // Test isBonusLane
        assert.isTrue(laneSystem.isBonusLane(0), 'Lane 0 should be the bonus lane');
        assert.isFalse(laneSystem.isBonusLane(1), 'Lane 1 should not be the bonus lane');
        
        // Test isCombatLane
        assert.isFalse(laneSystem.isCombatLane(0), 'Lane 0 should not be a combat lane');
        assert.isTrue(laneSystem.isCombatLane(1), 'Lane 1 should be a combat lane');
        assert.isTrue(laneSystem.isCombatLane(8), 'Lane 8 should be a combat lane');
        assert.isFalse(laneSystem.isCombatLane(9), 'Lane 9 should not be a combat lane');
        
        // Test getter methods
        assert.equal(laneSystem.getLaneCount(), 9, 'Lane count should be 9');
        assert.equal(laneSystem.getLaneHeight(), 50, 'Lane height should be 50');
        assert.equal(laneSystem.getLaneWidth(), 600, 'Lane width should be 600');
    });
    
    // Test moveEntityToLane method
    test('moveEntityToLane should move entity to specified lane', (assert) => {
        // Initialize the lane system
        laneSystem.initialize();
        
        // Create a test entity
        const entity = entityManager.createEntity();
        
        // Add transform component
        const transform = new TransformComponent();
        transform.init({ x: 100, y: 100 });
        entity.addComponent(transform);
        
        // Add lane component
        const lane = new LaneComponent();
        lane.init({ laneIndex: 1 });
        entity.addComponent(lane);
        
        // Move entity to lane 5
        const result = laneSystem.moveEntityToLane(entity, 5);
        
        // Check that the entity was moved
        assert.isTrue(result, 'moveEntityToLane should return true');
        assert.equal(lane.laneIndex, 5, 'Entity should be in lane 5');
        assert.equal(transform.y, 5 * 50 + 25, 'Entity should be positioned in lane 5');
        
        // Try to move to invalid lane
        const invalidResult = laneSystem.moveEntityToLane(entity, 10);
        assert.isFalse(invalidResult, 'moveEntityToLane should return false for invalid lane');
        assert.equal(lane.laneIndex, 5, 'Entity should still be in lane 5');
    });
    
    // Test getEntitiesInLane method
    test('getEntitiesInLane should return entities in specified lane', (assert) => {
        // Initialize the lane system
        laneSystem.initialize();
        
        // Create test entities in different lanes
        const entity1 = entityManager.createEntity();
        entity1.addComponent(new LaneComponent().init({ laneIndex: 1 }));
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new LaneComponent().init({ laneIndex: 1 }));
        
        const entity3 = entityManager.createEntity();
        entity3.addComponent(new LaneComponent().init({ laneIndex: 2 }));
        
        // Get entities in lane 1
        const entitiesInLane1 = laneSystem.getEntitiesInLane(1);
        
        // Check that the correct entities were returned
        assert.equal(entitiesInLane1.length, 2, 'Should find 2 entities in lane 1');
        assert.isTrue(entitiesInLane1.includes(entity1), 'Should include entity1');
        assert.isTrue(entitiesInLane1.includes(entity2), 'Should include entity2');
        assert.isFalse(entitiesInLane1.includes(entity3), 'Should not include entity3');
        
        // Get entities in lane 2
        const entitiesInLane2 = laneSystem.getEntitiesInLane(2);
        
        // Check that the correct entities were returned
        assert.equal(entitiesInLane2.length, 1, 'Should find 1 entity in lane 2');
        assert.isTrue(entitiesInLane2.includes(entity3), 'Should include entity3');
        
        // Get entities in invalid lane
        const entitiesInInvalidLane = laneSystem.getEntitiesInLane(10);
        assert.equal(entitiesInInvalidLane.length, 0, 'Should find 0 entities in invalid lane');
    });
    
    // Test calculateLaneCoverage method
    test('calculateLaneCoverage should return correct lane coverage', (assert) => {
        assert.equal(laneSystem.calculateLaneCoverage(1), 1, '1 soldier should cover 1 lane');
        assert.equal(laneSystem.calculateLaneCoverage(5), 1, '5 soldiers should cover 1 lane');
        assert.equal(laneSystem.calculateLaneCoverage(6), 2, '6 soldiers should cover 2 lanes');
        assert.equal(laneSystem.calculateLaneCoverage(10), 2, '10 soldiers should cover 2 lanes');
        assert.equal(laneSystem.calculateLaneCoverage(11), 3, '11 soldiers should cover 3 lanes');
        assert.equal(laneSystem.calculateLaneCoverage(20), 3, '20 soldiers should cover 3 lanes');
    });
});
