/**
 * EventBus Unit Tests
 * 
 * Tests for the EventBus class to ensure it correctly
 * handles event subscriptions and publications.
 */

import { EventBus } from '../../src/core/event-bus.js';

// Define the test suite for EventBus
suite('EventBus', () => {
    let eventBus;
    
    // Create a new EventBus instance before each test
    beforeEach(() => {
        eventBus = new EventBus();
    });
    
    // Clean up after each test
    afterEach(() => {
        eventBus.destroy();
        eventBus = null;
    });
    
    // Test constructor
    test('constructor should initialize with empty subscribers', (assert) => {
        assert.equal(eventBus.getSubscriberCount('test'), 0, 'Should have no subscribers initially');
        assert.isFalse(eventBus.hasSubscribers('test'), 'Should have no subscribers initially');
    });
    
    // Test subscribe method
    test('subscribe should add a subscriber and return an ID', (assert) => {
        const callback = () => {};
        const id = eventBus.subscribe('test-event', callback);
        
        assert.isNumber(id, 'Subscribe should return a numeric ID');
        assert.isTrue(eventBus.hasSubscribers('test-event'), 'Event should have subscribers after subscribe');
        assert.equal(eventBus.getSubscriberCount('test-event'), 1, 'Event should have one subscriber');
    });
    
    // Test subscribe with invalid parameters
    test('subscribe should throw error with invalid parameters', (assert) => {
        assert.throws(
            () => eventBus.subscribe('', () => {}),
            /Event type must be a non-empty string/,
            'Should throw error for empty event type'
        );
        
        assert.throws(
            () => eventBus.subscribe(null, () => {}),
            /Event type must be a non-empty string/,
            'Should throw error for null event type'
        );
        
        assert.throws(
            () => eventBus.subscribe('test-event', null),
            /Callback must be a function/,
            'Should throw error for null callback'
        );
        
        assert.throws(
            () => eventBus.subscribe('test-event', 'not-a-function'),
            /Callback must be a function/,
            'Should throw error for non-function callback'
        );
    });
    
    // Test unsubscribe method
    test('unsubscribe should remove a subscriber', (assert) => {
        const callback = () => {};
        const id = eventBus.subscribe('test-event', callback);
        
        assert.isTrue(eventBus.unsubscribe('test-event', id), 'Unsubscribe should return true for valid ID');
        assert.isFalse(eventBus.hasSubscribers('test-event'), 'Event should have no subscribers after unsubscribe');
        assert.equal(eventBus.getSubscriberCount('test-event'), 0, 'Event should have zero subscribers');
    });
    
    // Test unsubscribe with invalid parameters
    test('unsubscribe should return false for non-existent event or ID', (assert) => {
        assert.isFalse(eventBus.unsubscribe('non-existent', 0), 'Unsubscribe should return false for non-existent event');
        
        const id = eventBus.subscribe('test-event', () => {});
        assert.isFalse(eventBus.unsubscribe('test-event', id + 1), 'Unsubscribe should return false for non-existent ID');
    });
    
    // Test publish method
    test('publish should call all subscribers for an event', (assert) => {
        let callCount1 = 0;
        let callCount2 = 0;
        let receivedData = null;
        
        eventBus.subscribe('test-event', (data) => {
            callCount1++;
            receivedData = data;
        });
        
        eventBus.subscribe('test-event', () => {
            callCount2++;
        });
        
        const testData = { test: 'data' };
        eventBus.publish('test-event', testData);
        
        assert.equal(callCount1, 1, 'First subscriber should be called once');
        assert.equal(callCount2, 1, 'Second subscriber should be called once');
        assert.deepEqual(receivedData, testData, 'Subscriber should receive the published data');
    });
    
    // Test publish with no subscribers
    test('publish should do nothing for events with no subscribers', (assert) => {
        // This test just verifies that no errors are thrown
        eventBus.publish('non-existent');
        assert.pass('Publish should not throw error for events with no subscribers');
    });
    
    // Test error handling in subscribers
    test('publish should handle errors in subscribers', (assert) => {
        // First subscriber throws an error
        eventBus.subscribe('test-event', () => {
            throw new Error('Test error');
        });
        
        // Second subscriber should still be called
        let secondCalled = false;
        eventBus.subscribe('test-event', () => {
            secondCalled = true;
        });
        
        // This should not throw
        eventBus.publish('test-event');
        
        assert.isTrue(secondCalled, 'Second subscriber should be called even if first throws');
    });
    
    // Test clearEventSubscribers method
    test('clearEventSubscribers should remove all subscribers for an event', (assert) => {
        eventBus.subscribe('test-event', () => {});
        eventBus.subscribe('test-event', () => {});
        
        assert.isTrue(eventBus.clearEventSubscribers('test-event'), 'Clear should return true for existing event');
        assert.isFalse(eventBus.hasSubscribers('test-event'), 'Event should have no subscribers after clear');
        assert.isFalse(eventBus.clearEventSubscribers('non-existent'), 'Clear should return false for non-existent event');
    });
    
    // Test clearAllSubscribers method
    test('clearAllSubscribers should remove all subscribers for all events', (assert) => {
        eventBus.subscribe('event1', () => {});
        eventBus.subscribe('event2', () => {});
        
        eventBus.clearAllSubscribers();
        
        assert.isFalse(eventBus.hasSubscribers('event1'), 'Event1 should have no subscribers after clear all');
        assert.isFalse(eventBus.hasSubscribers('event2'), 'Event2 should have no subscribers after clear all');
    });
});
