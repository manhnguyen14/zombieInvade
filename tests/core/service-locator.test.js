/**
 * ServiceLocator Unit Tests
 * 
 * Tests for the ServiceLocator class to ensure it correctly
 * registers, retrieves, and manages services.
 */

import { ServiceLocator } from '../../src/core/service-locator.js';

// Define the test suite for ServiceLocator
suite('ServiceLocator', () => {
    // Reset the ServiceLocator before each test
    beforeEach(() => {
        ServiceLocator.clearServices();
    });
    
    // Test registering a service
    test('registerService should add a service', (assert) => {
        const testService = { name: 'testService' };
        ServiceLocator.registerService('test', testService);
        
        assert.isTrue(ServiceLocator.hasService('test'), 'Service should be registered');
    });
    
    // Test registering with invalid name
    test('registerService should throw error with invalid name', (assert) => {
        assert.throws(
            () => ServiceLocator.registerService('', {}),
            /Service name must be a non-empty string/,
            'Should throw error for empty name'
        );
        
        assert.throws(
            () => ServiceLocator.registerService(null, {}),
            /Service name must be a non-empty string/,
            'Should throw error for null name'
        );
        
        assert.throws(
            () => ServiceLocator.registerService(123, {}),
            /Service name must be a non-empty string/,
            'Should throw error for non-string name'
        );
    });
    
    // Test registering with invalid service
    test('registerService should throw error with invalid service', (assert) => {
        assert.throws(
            () => ServiceLocator.registerService('test', null),
            /Cannot register null or undefined service/,
            'Should throw error for null service'
        );
        
        assert.throws(
            () => ServiceLocator.registerService('test', undefined),
            /Cannot register null or undefined service/,
            'Should throw error for undefined service'
        );
    });
    
    // Test retrieving a service
    test('getService should return the registered service', (assert) => {
        const testService = { name: 'testService' };
        ServiceLocator.registerService('test', testService);
        
        const retrievedService = ServiceLocator.getService('test');
        assert.equal(retrievedService, testService, 'Retrieved service should match registered service');
    });
    
    // Test retrieving a non-existent service
    test('getService should throw error for non-existent service', (assert) => {
        assert.throws(
            () => ServiceLocator.getService('nonExistent'),
            /Service 'nonExistent' not found/,
            'Should throw error for non-existent service'
        );
    });
    
    // Test checking if a service exists
    test('hasService should return true for registered services', (assert) => {
        const testService = { name: 'testService' };
        ServiceLocator.registerService('test', testService);
        
        assert.isTrue(ServiceLocator.hasService('test'), 'hasService should return true for registered service');
        assert.isFalse(ServiceLocator.hasService('nonExistent'), 'hasService should return false for non-existent service');
    });
    
    // Test removing a service
    test('removeService should remove a registered service', (assert) => {
        const testService = { name: 'testService' };
        ServiceLocator.registerService('test', testService);
        
        assert.isTrue(ServiceLocator.hasService('test'), 'Service should be registered initially');
        
        const result = ServiceLocator.removeService('test');
        assert.isTrue(result, 'removeService should return true for successful removal');
        assert.isFalse(ServiceLocator.hasService('test'), 'Service should be removed after removeService');
    });
    
    // Test removing a non-existent service
    test('removeService should return false for non-existent service', (assert) => {
        const result = ServiceLocator.removeService('nonExistent');
        assert.isFalse(result, 'removeService should return false for non-existent service');
    });
    
    // Test clearing all services
    test('clearServices should remove all registered services', (assert) => {
        ServiceLocator.registerService('test1', { name: 'testService1' });
        ServiceLocator.registerService('test2', { name: 'testService2' });
        
        assert.isTrue(ServiceLocator.hasService('test1'), 'First service should be registered');
        assert.isTrue(ServiceLocator.hasService('test2'), 'Second service should be registered');
        
        ServiceLocator.clearServices();
        
        assert.isFalse(ServiceLocator.hasService('test1'), 'First service should be removed after clearServices');
        assert.isFalse(ServiceLocator.hasService('test2'), 'Second service should be removed after clearServices');
    });
    
    // Test overwriting a service
    test('registerService should overwrite existing service with same name', (assert) => {
        const testService1 = { name: 'testService1' };
        const testService2 = { name: 'testService2' };
        
        ServiceLocator.registerService('test', testService1);
        assert.equal(ServiceLocator.getService('test'), testService1, 'First service should be registered');
        
        ServiceLocator.registerService('test', testService2);
        assert.equal(ServiceLocator.getService('test'), testService2, 'Second service should overwrite first service');
    });
});