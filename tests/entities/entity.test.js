/**
 * Entity Unit Tests
 * 
 * Tests for the Entity class to ensure it correctly
 * manages components and entity state.
 */

import { Entity } from '../../src/entities/entity.js';

// Define the test suite for Entity
suite('Entity', () => {
    let entity;
    
    // Create a new Entity instance before each test
    beforeEach(() => {
        entity = new Entity(1);
    });
    
    // Test constructor
    test('constructor should initialize with correct ID', (assert) => {
        assert.equal(entity.id, 1, 'Entity should have the correct ID');
        assert.isTrue(entity.isActive(), 'Entity should be active by default');
        assert.equal(entity.getComponentCount(), 0, 'Entity should have no components initially');
    });
    
    // Test constructor with invalid ID
    test('constructor should throw error with invalid ID', (assert) => {
        assert.throws(
            () => new Entity(-1),
            /Entity ID must be a non-negative number/,
            'Should throw error for negative ID'
        );
        
        assert.throws(
            () => new Entity('not-a-number'),
            /Entity ID must be a non-negative number/,
            'Should throw error for non-numeric ID'
        );
    });
    
    // Test component management
    test('addComponent should add a component', (assert) => {
        const component = { type: 'test' };
        entity.addComponent(component);
        
        assert.equal(entity.getComponentCount(), 1, 'Entity should have one component');
        assert.isTrue(entity.hasComponent('test'), 'Entity should have the test component');
        assert.equal(entity.getComponent('test'), component, 'getComponent should return the correct component');
    });
    
    // Test adding invalid component
    test('addComponent should throw error with invalid component', (assert) => {
        assert.throws(
            () => entity.addComponent(null),
            /Cannot add invalid component to entity/,
            'Should throw error for null component'
        );
        
        assert.throws(
            () => entity.addComponent({}),
            /Cannot add invalid component to entity/,
            'Should throw error for component without type'
        );
    });
    
    // Test component entity reference
    test('addComponent should set entity reference on component', (assert) => {
        let entityRef = null;
        const component = {
            type: 'test',
            setEntity(entity) {
                entityRef = entity;
            }
        };
        
        entity.addComponent(component);
        assert.equal(entityRef, entity, 'Component should have reference to entity');
    });
    
    // Test removing component
    test('removeComponent should remove a component', (assert) => {
        const component = { type: 'test' };
        entity.addComponent(component);
        
        assert.isTrue(entity.removeComponent('test'), 'removeComponent should return true for existing component');
        assert.equal(entity.getComponentCount(), 0, 'Entity should have no components after removal');
        assert.isFalse(entity.hasComponent('test'), 'Entity should not have the test component after removal');
        assert.isNull(entity.getComponent('test'), 'getComponent should return null for removed component');
    });
    
    // Test removing non-existent component
    test('removeComponent should return false for non-existent component', (assert) => {
        assert.isFalse(entity.removeComponent('non-existent'), 'removeComponent should return false for non-existent component');
    });
    
    // Test clearing entity reference on component removal
    test('removeComponent should clear entity reference on component', (assert) => {
        let entityRef = null;
        const component = {
            type: 'test',
            setEntity(entity) {
                entityRef = entity;
            }
        };
        
        entity.addComponent(component);
        entity.removeComponent('test');
        
        assert.isNull(entityRef, 'Component should have null entity reference after removal');
    });
    
    // Test hasAllComponents
    test('hasAllComponents should check for multiple components', (assert) => {
        entity.addComponent({ type: 'component1' });
        entity.addComponent({ type: 'component2' });
        
        assert.isTrue(entity.hasAllComponents(['component1', 'component2']), 'Should return true when entity has all components');
        assert.isTrue(entity.hasAllComponents(['component1']), 'Should return true when entity has all components (single)');
        assert.isFalse(entity.hasAllComponents(['component1', 'component3']), 'Should return false when entity is missing a component');
    });
    
    // Test hasAnyComponent
    test('hasAnyComponent should check for any of multiple components', (assert) => {
        entity.addComponent({ type: 'component1' });
        
        assert.isTrue(entity.hasAnyComponent(['component1', 'component2']), 'Should return true when entity has any component');
        assert.isFalse(entity.hasAnyComponent(['component2', 'component3']), 'Should return false when entity has none of the components');
    });
    
    // Test invalid component arrays
    test('hasAllComponents and hasAnyComponent should throw error with invalid input', (assert) => {
        assert.throws(
            () => entity.hasAllComponents('not-an-array'),
            /Component types must be an array/,
            'hasAllComponents should throw error for non-array input'
        );
        
        assert.throws(
            () => entity.hasAnyComponent('not-an-array'),
            /Component types must be an array/,
            'hasAnyComponent should throw error for non-array input'
        );
    });
    
    // Test getAllComponents
    test('getAllComponents should return all components', (assert) => {
        const component1 = { type: 'component1' };
        const component2 = { type: 'component2' };
        
        entity.addComponent(component1);
        entity.addComponent(component2);
        
        const allComponents = entity.getAllComponents();
        
        assert.equal(allComponents.length, 2, 'Should return all components');
        assert.isTrue(allComponents.includes(component1), 'Should include component1');
        assert.isTrue(allComponents.includes(component2), 'Should include component2');
    });
    
    // Test tag management
    test('tag methods should manage entity tags', (assert) => {
        entity.addTag('tag1');
        entity.addTag('tag2');
        
        assert.isTrue(entity.hasTag('tag1'), 'Entity should have tag1');
        assert.isTrue(entity.hasTag('tag2'), 'Entity should have tag2');
        assert.isFalse(entity.hasTag('tag3'), 'Entity should not have tag3');
        
        const allTags = entity.getAllTags();
        assert.equal(allTags.length, 2, 'Entity should have two tags');
        assert.isTrue(allTags.includes('tag1'), 'Tags should include tag1');
        assert.isTrue(allTags.includes('tag2'), 'Tags should include tag2');
        
        assert.isTrue(entity.removeTag('tag1'), 'removeTag should return true for existing tag');
        assert.isFalse(entity.hasTag('tag1'), 'Entity should not have tag1 after removal');
        assert.isFalse(entity.removeTag('tag3'), 'removeTag should return false for non-existent tag');
    });
    
    // Test invalid tags
    test('addTag should throw error with invalid tag', (assert) => {
        assert.throws(
            () => entity.addTag(''),
            /Tag must be a non-empty string/,
            'Should throw error for empty tag'
        );
        
        assert.throws(
            () => entity.addTag(null),
            /Tag must be a non-empty string/,
            'Should throw error for null tag'
        );
    });
    
    // Test activation/deactivation
    test('activate and deactivate should change entity state', (assert) => {
        entity.deactivate();
        assert.isFalse(entity.isActive(), 'Entity should be inactive after deactivate');
        
        entity.activate();
        assert.isTrue(entity.isActive(), 'Entity should be active after activate');
    });
    
    // Test destroy method
    test('destroy should clean up entity resources', (assert) => {
        entity.addComponent({ type: 'component1' });
        entity.addComponent({ type: 'component2' });
        entity.addTag('tag1');
        
        entity.destroy();
        
        assert.equal(entity.getComponentCount(), 0, 'Entity should have no components after destroy');
        assert.equal(entity.getAllTags().length, 0, 'Entity should have no tags after destroy');
        assert.isFalse(entity.isActive(), 'Entity should be inactive after destroy');
    });
});
