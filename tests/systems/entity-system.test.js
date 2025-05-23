/**
 * EntitySystem Unit Tests
 * 
 * Tests for the EntitySystem class to ensure it correctly
 * processes entities with required components.
 */

import { EntitySystem } from '../../src/systems/entity-system.js';
import { EntityManager } from '../../src/core/entity-manager.js';
import { Component } from '../../src/entities/component.js';
import { ServiceLocator } from '../../src/core/service-locator.js';

// Define the test suite for EntitySystem
suite('EntitySystem', () => {
    let entitySystem;
    let entityManager;
    
    // Set up before each test
    beforeEach(() => {
        // Clear any existing services
        ServiceLocator.clearServices();
        
        // Create and register the entity manager
        entityManager = new EntityManager();
        ServiceLocator.registerService('entityManager', entityManager);
        
        // Create the entity system with required components
        entitySystem = new EntitySystem('testSystem', ['test1', 'test2']);
    });
    
    // Clean up after each test
    afterEach(() => {
        entityManager.destroy();
        entitySystem.destroy();
        ServiceLocator.clearServices();
    });
    
    // Test constructor
    test('constructor should initialize with correct name and required components', (assert) => {
        assert.equal(entitySystem.name, 'testSystem', 'EntitySystem should have the correct name');
        assert.deepEqual(entitySystem.requiredComponents, ['test1', 'test2'], 'EntitySystem should have the correct required components');
    });
    
    // Test constructor with invalid required components
    test('constructor should throw error with invalid required components', (assert) => {
        assert.throws(
            () => new EntitySystem('test', 'not-an-array'),
            /Required components must be an array/,
            'Should throw error for non-array required components'
        );
    });
    
    // Test getEntities method
    test('getEntities should return entities with required components', (assert) => {
        // Create test components
        class TestComponent1 extends Component {
            constructor() {
                super('test1');
            }
        }
        
        class TestComponent2 extends Component {
            constructor() {
                super('test2');
            }
        }
        
        // Create entities with different components
        const entity1 = entityManager.createEntity();
        entity1.addComponent(new TestComponent1());
        entity1.addComponent(new TestComponent2());
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new TestComponent1());
        
        const entity3 = entityManager.createEntity();
        entity3.addComponent(new TestComponent2());
        
        // Get entities with required components
        const entities = entitySystem.getEntities();
        
        assert.equal(entities.length, 1, 'Should return entities with all required components');
        assert.isTrue(entities.includes(entity1), 'Should include entity with all required components');
        assert.isFalse(entities.includes(entity2), 'Should not include entity missing a required component');
        assert.isFalse(entities.includes(entity3), 'Should not include entity missing a required component');
    });
    
    // Test getEntities with no required components
    test('getEntities should return all active entities when no required components', (assert) => {
        // Create entity system with no required components
        const allEntitiesSystem = new EntitySystem('allEntitiesSystem');
        
        // Create entities
        const entity1 = entityManager.createEntity();
        const entity2 = entityManager.createEntity();
        
        // Deactivate one entity
        entity2.deactivate();
        
        // Get all entities
        const entities = allEntitiesSystem.getEntities();
        
        assert.equal(entities.length, 1, 'Should return all active entities');
        assert.isTrue(entities.includes(entity1), 'Should include active entity');
        assert.isFalse(entities.includes(entity2), 'Should not include inactive entity');
    });
    
    // Test update method
    test('update should process entities with required components', (assert) => {
        // Create test components
        class TestComponent1 extends Component {
            constructor() {
                super('test1');
            }
        }
        
        class TestComponent2 extends Component {
            constructor() {
                super('test2');
            }
        }
        
        // Create entities with different components
        const entity1 = entityManager.createEntity();
        entity1.addComponent(new TestComponent1());
        entity1.addComponent(new TestComponent2());
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new TestComponent1());
        
        // Create a custom entity system that tracks processed entities
        class TestEntitySystem extends EntitySystem {
            constructor() {
                super('testSystem', ['test1', 'test2']);
                this.processedEntities = [];
            }
            
            processEntity(entity, deltaTime) {
                this.processedEntities.push(entity);
            }
        }
        
        const testEntitySystem = new TestEntitySystem();
        
        // Update the system
        testEntitySystem.update(0.016);
        
        assert.equal(testEntitySystem.processedEntities.length, 1, 'Should process entities with required components');
        assert.isTrue(testEntitySystem.processedEntities.includes(entity1), 'Should process entity with all required components');
        assert.isFalse(testEntitySystem.processedEntities.includes(entity2), 'Should not process entity missing a required component');
    });
    
    // Test update when disabled
    test('update should not process entities when system is disabled', (assert) => {
        // Create test components
        class TestComponent1 extends Component {
            constructor() {
                super('test1');
            }
        }
        
        class TestComponent2 extends Component {
            constructor() {
                super('test2');
            }
        }
        
        // Create entity with required components
        const entity = entityManager.createEntity();
        entity.addComponent(new TestComponent1());
        entity.addComponent(new TestComponent2());
        
        // Create a custom entity system that tracks processed entities
        class TestEntitySystem extends EntitySystem {
            constructor() {
                super('testSystem', ['test1', 'test2']);
                this.processedEntities = [];
            }
            
            processEntity(entity, deltaTime) {
                this.processedEntities.push(entity);
            }
        }
        
        const testEntitySystem = new TestEntitySystem();
        
        // Disable the system
        testEntitySystem.disable();
        
        // Update the system
        testEntitySystem.update(0.016);
        
        assert.equal(testEntitySystem.processedEntities.length, 0, 'Should not process entities when disabled');
    });
});
