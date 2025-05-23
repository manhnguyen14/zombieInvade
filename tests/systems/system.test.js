/**
 * System Unit Tests
 * 
 * Tests for the System base class to ensure it correctly
 * manages system state and lifecycle.
 */

import { System } from '../../src/systems/system.js';

// Define the test suite for System
suite('System', () => {
    let system;
    
    // Create a new System instance before each test
    beforeEach(() => {
        system = new System('testSystem');
    });
    
    // Test constructor
    test('constructor should initialize with correct name', (assert) => {
        assert.equal(system.name, 'testSystem', 'System should have the correct name');
        assert.isTrue(system.isEnabled(), 'System should be enabled by default');
        assert.equal(system.getPriority(), 0, 'System should have default priority of 0');
    });
    
    // Test constructor with invalid name
    test('constructor should throw error with invalid name', (assert) => {
        assert.throws(
            () => new System(''),
            /System name must be a non-empty string/,
            'Should throw error for empty name'
        );
        
        assert.throws(
            () => new System(null),
            /System name must be a non-empty string/,
            'Should throw error for null name'
        );
        
        assert.throws(
            () => new System(123),
            /System name must be a non-empty string/,
            'Should throw error for non-string name'
        );
    });
    
    // Test enable/disable methods
    test('enable and disable should change system state', (assert) => {
        system.disable();
        assert.isFalse(system.isEnabled(), 'System should be disabled after disable');
        
        system.enable();
        assert.isTrue(system.isEnabled(), 'System should be enabled after enable');
    });
    
    // Test method chaining
    test('enable and disable should return the system for chaining', (assert) => {
        const result1 = system.disable();
        assert.equal(result1, system, 'disable should return the system instance');
        
        const result2 = system.enable();
        assert.equal(result2, system, 'enable should return the system instance');
    });
    
    // Test priority methods
    test('setPriority and getPriority should manage priority', (assert) => {
        system.setPriority(10);
        assert.equal(system.getPriority(), 10, 'System should have the correct priority');
    });
    
    // Test setPriority with invalid value
    test('setPriority should throw error with invalid value', (assert) => {
        assert.throws(
            () => system.setPriority('not-a-number'),
            /Priority must be a number/,
            'Should throw error for non-numeric priority'
        );
    });
    
    // Test method chaining for setPriority
    test('setPriority should return the system for chaining', (assert) => {
        const result = system.setPriority(5);
        assert.equal(result, system, 'setPriority should return the system instance');
    });
    
    // Test update method
    test('update method should exist', (assert) => {
        assert.isFunction(system.update, 'System should have an update method');
        
        // This just verifies that no errors are thrown
        system.update(0.016);
        assert.pass('update should not throw error');
    });
    
    // Test initialize method
    test('initialize method should exist', (assert) => {
        assert.isFunction(system.initialize, 'System should have an initialize method');
        
        // This just verifies that no errors are thrown
        system.initialize();
        assert.pass('initialize should not throw error');
    });
    
    // Test destroy method
    test('destroy method should exist', (assert) => {
        assert.isFunction(system.destroy, 'System should have a destroy method');
        
        // This just verifies that no errors are thrown
        system.destroy();
        assert.pass('destroy should not throw error');
    });
    
    // Test extending the System class
    test('System can be extended with custom behavior', (assert) => {
        // Create a custom system class
        class TestSystem extends System {
            constructor() {
                super('customSystem');
                this.updateCount = 0;
            }
            
            update(deltaTime) {
                this.updateCount++;
            }
        }
        
        // Create an instance
        const testSystem = new TestSystem();
        
        // Test custom behavior
        testSystem.update(0.016);
        assert.equal(testSystem.updateCount, 1, 'Custom system should track updates');
        
        testSystem.update(0.016);
        assert.equal(testSystem.updateCount, 2, 'Custom system should track multiple updates');
    });
});
