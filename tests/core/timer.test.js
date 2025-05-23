/**
 * Timer Unit Tests
 * 
 * Tests for the Timer class to ensure it correctly
 * manages game timing, creates timers, and schedules events.
 */

import { Timer } from '../../src/core/timer.js';

// Define the test suite for Timer
suite('Timer', () => {
    let timer;
    
    // Create a new Timer instance before each test
    beforeEach(() => {
        timer = new Timer();
    });
    
    // Test constructor
    test('constructor should initialize with zero total time', (assert) => {
        assert.equal(timer.getTotalTime(), 0, 'Total time should be initialized to 0');
    });
    
    // Test update method
    test('update should increase total time', (assert) => {
        timer.update(1.5);
        assert.equal(timer.getTotalTime(), 1.5, 'Total time should increase by delta time');
        
        timer.update(0.5);
        assert.equal(timer.getTotalTime(), 2.0, 'Total time should accumulate delta time');
    });
    
    // Test resetTotalTime method
    test('resetTotalTime should set total time to zero', (assert) => {
        timer.update(2.0);
        assert.equal(timer.getTotalTime(), 2.0, 'Total time should be updated');
        
        timer.resetTotalTime();
        assert.equal(timer.getTotalTime(), 0, 'Total time should be reset to 0');
    });
    
    // Test createTimer method
    test('createTimer should create a timer with correct properties', (assert) => {
        const id = timer.createTimer(5, () => {}, false);
        
        assert.isTrue(timer.isTimerActive(id), 'Timer should be active after creation');
        assert.isDefined(id, 'Timer ID should be defined');
        assert.equal(typeof id, 'number', 'Timer ID should be a number');
    });
    
    // Test createTimer with invalid parameters
    test('createTimer should throw error with invalid parameters', (assert) => {
        assert.throws(
            () => timer.createTimer(-1, () => {}),
            /Timer duration must be a positive number/,
            'Should throw error for negative duration'
        );
        
        assert.throws(
            () => timer.createTimer(0, () => {}),
            /Timer duration must be a positive number/,
            'Should throw error for zero duration'
        );
        
        assert.throws(
            () => timer.createTimer('invalid', () => {}),
            /Timer duration must be a positive number/,
            'Should throw error for non-number duration'
        );
        
        assert.throws(
            () => timer.createTimer(1, 'not a function'),
            /Timer callback must be a function/,
            'Should throw error for non-function callback'
        );
    });
    
    // Test timer execution
    test('timer should execute callback when completed', (assert) => {
        let callbackExecuted = false;
        const id = timer.createTimer(2, () => {
            callbackExecuted = true;
        });
        
        // Timer hasn't completed yet
        timer.update(1);
        assert.isFalse(callbackExecuted, 'Callback should not be executed before timer completes');
        
        // Timer completes
        timer.update(1);
        assert.isTrue(callbackExecuted, 'Callback should be executed when timer completes');
        assert.isFalse(timer.isTimerActive(id), 'Timer should be inactive after completion');
    });
    
    // Test repeating timer
    test('repeating timer should execute callback multiple times', (assert) => {
        let callCount = 0;
        const id = timer.createTimer(1, () => {
            callCount++;
        }, true);
        
        // First execution
        timer.update(1);
        assert.equal(callCount, 1, 'Callback should be executed once');
        assert.isTrue(timer.isTimerActive(id), 'Repeating timer should remain active');
        
        // Second execution
        timer.update(1);
        assert.equal(callCount, 2, 'Callback should be executed twice');
        assert.isTrue(timer.isTimerActive(id), 'Repeating timer should remain active');
    });
    
    // Test cancelTimer method
    test('cancelTimer should remove an active timer', (assert) => {
        let callbackExecuted = false;
        const id = timer.createTimer(1, () => {
            callbackExecuted = true;
        });
        
        assert.isTrue(timer.isTimerActive(id), 'Timer should be active after creation');
        
        const result = timer.cancelTimer(id);
        assert.isTrue(result, 'cancelTimer should return true for successful cancellation');
        assert.isFalse(timer.isTimerActive(id), 'Timer should be inactive after cancellation');
        
        // Timer would have completed, but was cancelled
        timer.update(1);
        assert.isFalse(callbackExecuted, 'Callback should not be executed after timer is cancelled');
    });
    
    // Test cancelTimer with non-existent timer
    test('cancelTimer should return false for non-existent timer', (assert) => {
        const result = timer.cancelTimer(999);
        assert.isFalse(result, 'cancelTimer should return false for non-existent timer');
    });
    
    // Test getTimerRemaining method
    test('getTimerRemaining should return correct remaining time', (assert) => {
        const id = timer.createTimer(5, () => {});
        
        assert.equal(timer.getTimerRemaining(id), 5, 'Initial remaining time should match duration');
        
        timer.update(2);
        assert.equal(timer.getTimerRemaining(id), 3, 'Remaining time should decrease by update delta');
    });
    
    // Test getTimerRemaining with non-existent timer
    test('getTimerRemaining should return null for non-existent timer', (assert) => {
        const result = timer.getTimerRemaining(999);
        assert.isNull(result, 'getTimerRemaining should return null for non-existent timer');
    });
    
    // Test setTimeout convenience method
    test('setTimeout should create a non-repeating timer', (assert) => {
        let callbackExecuted = false;
        const id = timer.setTimeout(1, () => {
            callbackExecuted = true;
        });
        
        assert.isTrue(timer.isTimerActive(id), 'Timer should be active after setTimeout');
        
        timer.update(1);
        assert.isTrue(callbackExecuted, 'Callback should be executed');
        assert.isFalse(timer.isTimerActive(id), 'Timer should be inactive after completion');
    });
    
    // Test setInterval convenience method
    test('setInterval should create a repeating timer', (assert) => {
        let callCount = 0;
        const id = timer.setInterval(1, () => {
            callCount++;
        });
        
        assert.isTrue(timer.isTimerActive(id), 'Timer should be active after setInterval');
        
        timer.update(1);
        assert.equal(callCount, 1, 'Callback should be executed once');
        assert.isTrue(timer.isTimerActive(id), 'Timer should remain active after first execution');
        
        timer.update(1);
        assert.equal(callCount, 2, 'Callback should be executed twice');
    });
    
    // Test clearTimeout convenience method
    test('clearTimeout should cancel a non-repeating timer', (assert) => {
        let callbackExecuted = false;
        const id = timer.setTimeout(1, () => {
            callbackExecuted = true;
        });
        
        const result = timer.clearTimeout(id);
        assert.isTrue(result, 'clearTimeout should return true for successful cancellation');
        assert.isFalse(timer.isTimerActive(id), 'Timer should be inactive after clearTimeout');
        
        timer.update(1);
        assert.isFalse(callbackExecuted, 'Callback should not be executed after clearTimeout');
    });
    
    // Test clearInterval convenience method
    test('clearInterval should cancel a repeating timer', (assert) => {
        let callCount = 0;
        const id = timer.setInterval(1, () => {
            callCount++;
        });
        
        const result = timer.clearInterval(id);
        assert.isTrue(result, 'clearInterval should return true for successful cancellation');
        assert.isFalse(timer.isTimerActive(id), 'Timer should be inactive after clearInterval');
        
        timer.update(1);
        assert.equal(callCount, 0, 'Callback should not be executed after clearInterval');
    });
    
    // Test getActiveTimerCount method
    test('getActiveTimerCount should return correct count', (assert) => {
        assert.equal(timer.getActiveTimerCount(), 0, 'Initial timer count should be 0');
        
        timer.createTimer(1, () => {});
        assert.equal(timer.getActiveTimerCount(), 1, 'Timer count should be 1 after creating one timer');
        
        timer.createTimer(2, () => {});
        assert.equal(timer.getActiveTimerCount(), 2, 'Timer count should be 2 after creating two timers');
    });
    
    // Test cancelAllTimers method
    test('cancelAllTimers should remove all active timers', (assert) => {
        timer.createTimer(1, () => {});
        timer.createTimer(2, () => {});
        
        assert.equal(timer.getActiveTimerCount(), 2, 'Should have 2 active timers');
        
        timer.cancelAllTimers();
        assert.equal(timer.getActiveTimerCount(), 0, 'Should have 0 active timers after cancelAllTimers');
    });
    
    // Test destroy method
    test('destroy should cancel all timers', (assert) => {
        timer.createTimer(1, () => {});
        timer.createTimer(2, () => {});
        
        assert.equal(timer.getActiveTimerCount(), 2, 'Should have 2 active timers');
        
        timer.destroy();
        assert.equal(timer.getActiveTimerCount(), 0, 'Should have 0 active timers after destroy');
    });
});