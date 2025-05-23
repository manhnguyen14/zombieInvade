/**
 * Component Unit Tests
 * 
 * Tests for the Component base class to ensure it correctly
 * manages component state and entity references.
 */

import { Component } from '../../src/entities/component.js';

// Define the test suite for Component
suite('Component', () => {
    let component;
    
    // Create a new Component instance before each test
    beforeEach(() => {
        component = new Component('test');
    });
    
    // Test constructor
    test('constructor should initialize with correct type', (assert) => {
        assert.equal(component.type, 'test', 'Component should have the correct type');
        assert.isNull(component.getEntity(), 'Component should have no entity initially');
    });
    
    // Test constructor with invalid type
    test('constructor should throw error with invalid type', (assert) => {
        assert.throws(
            () => new Component(''),
            /Component type must be a non-empty string/,
            'Should throw error for empty type'
        );
        
        assert.throws(
            () => new Component(null),
            /Component type must be a non-empty string/,
            'Should throw error for null type'
        );
        
        assert.throws(
            () => new Component(123),
            /Component type must be a non-empty string/,
            'Should throw error for non-string type'
        );
    });
    
    // Test entity reference
    test('setEntity and getEntity should manage entity reference', (assert) => {
        const mockEntity = { id: 1 };
        
        component.setEntity(mockEntity);
        assert.equal(component.getEntity(), mockEntity, 'Component should have the correct entity reference');
        
        component.setEntity(null);
        assert.isNull(component.getEntity(), 'Component should have null entity after clearing');
    });
    
    // Test init method
    test('init should return the component for chaining', (assert) => {
        const result = component.init({ test: 'data' });
        assert.equal(result, component, 'init should return the component instance');
    });
    
    // Test reset method
    test('reset should return the component for chaining', (assert) => {
        const result = component.reset();
        assert.equal(result, component, 'reset should return the component instance');
    });
    
    // Test clone method
    test('clone should create a new component with same properties', (assert) => {
        // Add a test property
        component.testProperty = 'test value';
        
        // Set an entity reference
        component.setEntity({ id: 1 });
        
        // Clone the component
        const clone = component.clone();
        
        assert.notEqual(clone, component, 'Clone should be a different instance');
        assert.equal(clone.type, component.type, 'Clone should have the same type');
        assert.equal(clone.testProperty, component.testProperty, 'Clone should have copied properties');
        assert.isNull(clone.getEntity(), 'Clone should have null entity reference');
    });
    
    // Test destroy method
    test('destroy should clean up component resources', (assert) => {
        // Set an entity reference
        component.setEntity({ id: 1 });
        
        // Destroy the component
        component.destroy();
        
        assert.isNull(component.getEntity(), 'Component should have null entity after destroy');
    });
    
    // Test extending the Component class
    test('Component can be extended with custom properties and methods', (assert) => {
        // Create a custom component class
        class TestComponent extends Component {
            constructor() {
                super('testComponent');
                this.value = 0;
            }
            
            init(data) {
                this.value = data.value || 0;
                return this;
            }
            
            reset() {
                this.value = 0;
                return this;
            }
        }
        
        // Create an instance
        const testComponent = new TestComponent();
        
        // Test initialization
        testComponent.init({ value: 42 });
        assert.equal(testComponent.value, 42, 'Custom component should initialize properties');
        
        // Test reset
        testComponent.reset();
        assert.equal(testComponent.value, 0, 'Custom component should reset properties');
        
        // Test cloning
        testComponent.value = 100;
        const clone = testComponent.clone();
        assert.equal(clone.value, 100, 'Clone should copy custom properties');
    });
});
