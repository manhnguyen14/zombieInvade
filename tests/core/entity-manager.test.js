/**
 * EntityManager Unit Tests
 * 
 * Tests for the EntityManager class to ensure it correctly
 * manages entity creation, deletion, and querying.
 */

import { EntityManager } from '../../src/core/entity-manager.js';
import { Component } from '../../src/entities/component.js';

// Define the test suite for EntityManager
suite('EntityManager', () => {
    let entityManager;
    
    // Create a new EntityManager instance before each test
    beforeEach(() => {
        entityManager = new EntityManager();
    });
    
    // Clean up after each test
    afterEach(() => {
        entityManager.destroy();
        entityManager = null;
    });
    
    // Test constructor
    test('constructor should initialize with empty entities', (assert) => {
        assert.equal(entityManager.getEntityCount(), 0, 'Should have no entities initially');
    });
    
    // Test entity creation
    test('createEntity should create and return a new entity', (assert) => {
        const entity = entityManager.createEntity();
        
        assert.isNotNull(entity, 'Should return a non-null entity');
        assert.isTrue(entityManager.hasEntity(entity.id), 'Entity should exist in the manager');
        assert.equal(entityManager.getEntityCount(), 1, 'Manager should have one entity');
    });
    
    // Test entity retrieval
    test('getEntity should return the correct entity', (assert) => {
        const entity = entityManager.createEntity();
        
        const retrievedEntity = entityManager.getEntity(entity.id);
        assert.equal(retrievedEntity, entity, 'Should return the correct entity');
        
        const nonExistentEntity = entityManager.getEntity(999);
        assert.isNull(nonExistentEntity, 'Should return null for non-existent entity');
    });
    
    // Test entity removal
    test('removeEntity should remove an entity', (assert) => {
        const entity = entityManager.createEntity();
        
        assert.isTrue(entityManager.removeEntity(entity), 'Should return true when removing existing entity');
        assert.isFalse(entityManager.hasEntity(entity.id), 'Entity should no longer exist in the manager');
        assert.equal(entityManager.getEntityCount(), 0, 'Manager should have no entities');
    });
    
    // Test removing non-existent entity
    test('removeEntity should return false for non-existent entity', (assert) => {
        assert.isFalse(entityManager.removeEntity(999), 'Should return false for non-existent entity');
    });
    
    // Test removing entity by ID
    test('removeEntity should work with entity ID', (assert) => {
        const entity = entityManager.createEntity();
        
        assert.isTrue(entityManager.removeEntity(entity.id), 'Should return true when removing by ID');
        assert.isFalse(entityManager.hasEntity(entity.id), 'Entity should no longer exist in the manager');
    });
    
    // Test getAllEntities
    test('getAllEntities should return all entities', (assert) => {
        const entity1 = entityManager.createEntity();
        const entity2 = entityManager.createEntity();
        
        const allEntities = entityManager.getAllEntities();
        
        assert.equal(allEntities.length, 2, 'Should return all entities');
        assert.isTrue(allEntities.includes(entity1), 'Should include entity1');
        assert.isTrue(allEntities.includes(entity2), 'Should include entity2');
    });
    
    // Test getActiveEntities
    test('getActiveEntities should return only active entities', (assert) => {
        const entity1 = entityManager.createEntity();
        const entity2 = entityManager.createEntity();
        
        entity2.deactivate();
        
        const activeEntities = entityManager.getActiveEntities();
        
        assert.equal(activeEntities.length, 1, 'Should return only active entities');
        assert.isTrue(activeEntities.includes(entity1), 'Should include active entity');
        assert.isFalse(activeEntities.includes(entity2), 'Should not include inactive entity');
    });
    
    // Test component filtering
    test('getEntitiesWithComponent should filter by component', (assert) => {
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
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new TestComponent1());
        entity2.addComponent(new TestComponent2());
        
        const entity3 = entityManager.createEntity();
        entity3.addComponent(new TestComponent2());
        
        // Test filtering by single component
        const entitiesWithTest1 = entityManager.getEntitiesWithComponent('test1');
        assert.equal(entitiesWithTest1.length, 2, 'Should find entities with test1 component');
        assert.isTrue(entitiesWithTest1.includes(entity1), 'Should include entity1');
        assert.isTrue(entitiesWithTest1.includes(entity2), 'Should include entity2');
        
        const entitiesWithTest2 = entityManager.getEntitiesWithComponent('test2');
        assert.equal(entitiesWithTest2.length, 2, 'Should find entities with test2 component');
        assert.isTrue(entitiesWithTest2.includes(entity2), 'Should include entity2');
        assert.isTrue(entitiesWithTest2.includes(entity3), 'Should include entity3');
    });
    
    // Test filtering by multiple components
    test('getEntitiesWithAllComponents should filter by all components', (assert) => {
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
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new TestComponent1());
        entity2.addComponent(new TestComponent2());
        
        const entity3 = entityManager.createEntity();
        entity3.addComponent(new TestComponent2());
        
        // Test filtering by multiple components
        const entitiesWithBoth = entityManager.getEntitiesWithAllComponents(['test1', 'test2']);
        assert.equal(entitiesWithBoth.length, 1, 'Should find entities with both components');
        assert.isTrue(entitiesWithBoth.includes(entity2), 'Should include entity2');
    });
    
    // Test filtering by any component
    test('getEntitiesWithAnyComponent should filter by any component', (assert) => {
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
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new TestComponent2());
        
        const entity3 = entityManager.createEntity();
        
        // Test filtering by any component
        const entitiesWithAny = entityManager.getEntitiesWithAnyComponent(['test1', 'test2']);
        assert.equal(entitiesWithAny.length, 2, 'Should find entities with any component');
        assert.isTrue(entitiesWithAny.includes(entity1), 'Should include entity1');
        assert.isTrue(entitiesWithAny.includes(entity2), 'Should include entity2');
    });
    
    // Test tag filtering
    test('getEntitiesWithTag should filter by tag', (assert) => {
        // Create entities with different tags
        const entity1 = entityManager.createEntity();
        entity1.addTag('tag1');
        
        const entity2 = entityManager.createEntity();
        entity2.addTag('tag1');
        entity2.addTag('tag2');
        
        const entity3 = entityManager.createEntity();
        entity3.addTag('tag2');
        
        // Test filtering by single tag
        const entitiesWithTag1 = entityManager.getEntitiesWithTag('tag1');
        assert.equal(entitiesWithTag1.length, 2, 'Should find entities with tag1');
        assert.isTrue(entitiesWithTag1.includes(entity1), 'Should include entity1');
        assert.isTrue(entitiesWithTag1.includes(entity2), 'Should include entity2');
        
        const entitiesWithTag2 = entityManager.getEntitiesWithTag('tag2');
        assert.equal(entitiesWithTag2.length, 2, 'Should find entities with tag2');
        assert.isTrue(entitiesWithTag2.includes(entity2), 'Should include entity2');
        assert.isTrue(entitiesWithTag2.includes(entity3), 'Should include entity3');
    });
    
    // Test filtering by multiple tags
    test('getEntitiesWithAllTags should filter by all tags', (assert) => {
        // Create entities with different tags
        const entity1 = entityManager.createEntity();
        entity1.addTag('tag1');
        
        const entity2 = entityManager.createEntity();
        entity2.addTag('tag1');
        entity2.addTag('tag2');
        
        const entity3 = entityManager.createEntity();
        entity3.addTag('tag2');
        
        // Test filtering by multiple tags
        const entitiesWithBothTags = entityManager.getEntitiesWithAllTags(['tag1', 'tag2']);
        assert.equal(entitiesWithBothTags.length, 1, 'Should find entities with both tags');
        assert.isTrue(entitiesWithBothTags.includes(entity2), 'Should include entity2');
    });
    
    // Test filtering by any tag
    test('getEntitiesWithAnyTag should filter by any tag', (assert) => {
        // Create entities with different tags
        const entity1 = entityManager.createEntity();
        entity1.addTag('tag1');
        
        const entity2 = entityManager.createEntity();
        entity2.addTag('tag2');
        
        const entity3 = entityManager.createEntity();
        
        // Test filtering by any tag
        const entitiesWithAnyTag = entityManager.getEntitiesWithAnyTag(['tag1', 'tag2']);
        assert.equal(entitiesWithAnyTag.length, 2, 'Should find entities with any tag');
        assert.isTrue(entitiesWithAnyTag.includes(entity1), 'Should include entity1');
        assert.isTrue(entitiesWithAnyTag.includes(entity2), 'Should include entity2');
    });
    
    // Test inactive entities are filtered out
    test('entity queries should filter out inactive entities', (assert) => {
        // Create test component
        class TestComponent extends Component {
            constructor() {
                super('test');
            }
        }
        
        // Create entities
        const entity1 = entityManager.createEntity();
        entity1.addComponent(new TestComponent());
        entity1.addTag('tag');
        
        const entity2 = entityManager.createEntity();
        entity2.addComponent(new TestComponent());
        entity2.addTag('tag');
        entity2.deactivate();
        
        // Test component filtering
        const entitiesWithComponent = entityManager.getEntitiesWithComponent('test');
        assert.equal(entitiesWithComponent.length, 1, 'Should only include active entities');
        assert.isTrue(entitiesWithComponent.includes(entity1), 'Should include active entity');
        assert.isFalse(entitiesWithComponent.includes(entity2), 'Should not include inactive entity');
        
        // Test tag filtering
        const entitiesWithTag = entityManager.getEntitiesWithTag('tag');
        assert.equal(entitiesWithTag.length, 1, 'Should only include active entities');
        assert.isTrue(entitiesWithTag.includes(entity1), 'Should include active entity');
        assert.isFalse(entitiesWithTag.includes(entity2), 'Should not include inactive entity');
    });
    
    // Test removeAllEntities
    test('removeAllEntities should remove all entities', (assert) => {
        entityManager.createEntity();
        entityManager.createEntity();
        
        entityManager.removeAllEntities();
        
        assert.equal(entityManager.getEntityCount(), 0, 'Should have no entities after removing all');
    });
});
