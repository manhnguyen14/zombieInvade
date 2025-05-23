/**
 * InputHandler Unit Tests
 * 
 * Tests for the InputHandler class to ensure it correctly
 * handles keyboard and touch input events.
 */

import { InputHandler } from '../../src/core/input-handler.js';

// Define the test suite for InputHandler
suite('InputHandler', () => {
    let inputHandler;
    
    // Create a new InputHandler instance before each test
    beforeEach(() => {
        inputHandler = new InputHandler();
    });
    
    // Clean up after each test
    afterEach(() => {
        inputHandler.destroy();
        inputHandler = null;
    });
    
    // Test constructor
    test('constructor should initialize with empty state', (assert) => {
        assert.isFalse(inputHandler.isTouchActive(), 'Touch should not be active initially');
        assert.equal(inputHandler.getTouchPositions().length, 0, 'Touch positions should be empty initially');
        assert.isNull(inputHandler.getPrimaryTouchPosition(), 'Primary touch position should be null initially');
    });
    
    // Test key press tracking
    test('isKeyPressed should track key state', (assert) => {
        // Initially no keys are pressed
        assert.isFalse(inputHandler.isKeyPressed('KeyA'), 'Key should not be pressed initially');
        
        // Simulate key down event
        const keyDownEvent = new KeyboardEvent('keydown', { code: 'KeyA' });
        window.dispatchEvent(keyDownEvent);
        
        assert.isTrue(inputHandler.isKeyPressed('KeyA'), 'Key should be pressed after keydown event');
        
        // Simulate key up event
        const keyUpEvent = new KeyboardEvent('keyup', { code: 'KeyA' });
        window.dispatchEvent(keyUpEvent);
        
        assert.isFalse(inputHandler.isKeyPressed('KeyA'), 'Key should not be pressed after keyup event');
    });
    
    // Test wasKeyJustPressed
    test('wasKeyJustPressed should detect single press', (assert) => {
        // Simulate key down event
        const keyDownEvent = new KeyboardEvent('keydown', { code: 'KeyB' });
        window.dispatchEvent(keyDownEvent);
        
        assert.isTrue(inputHandler.wasKeyJustPressed('KeyB'), 'wasKeyJustPressed should return true on first check');
        assert.isFalse(inputHandler.wasKeyJustPressed('KeyB'), 'wasKeyJustPressed should return false on second check');
        
        // Key is still down, but wasKeyJustPressed should only return true once
        assert.isTrue(inputHandler.isKeyPressed('KeyB'), 'Key should still be pressed');
        assert.isFalse(inputHandler.wasKeyJustPressed('KeyB'), 'wasKeyJustPressed should return false while key is held');
        
        // Release and press again
        const keyUpEvent = new KeyboardEvent('keyup', { code: 'KeyB' });
        window.dispatchEvent(keyUpEvent);
        window.dispatchEvent(keyDownEvent);
        
        assert.isTrue(inputHandler.wasKeyJustPressed('KeyB'), 'wasKeyJustPressed should return true after key is released and pressed again');
    });
    
    // Test wasKeyJustReleased
    test('wasKeyJustReleased should detect key release', (assert) => {
        // Press and release a key
        const keyDownEvent = new KeyboardEvent('keydown', { code: 'KeyC' });
        window.dispatchEvent(keyDownEvent);
        
        const keyUpEvent = new KeyboardEvent('keyup', { code: 'KeyC' });
        window.dispatchEvent(keyUpEvent);
        
        assert.isTrue(inputHandler.wasKeyJustReleased('KeyC'), 'wasKeyJustReleased should return true on first check after release');
        assert.isFalse(inputHandler.wasKeyJustReleased('KeyC'), 'wasKeyJustReleased should return false on second check');
    });
    
    // Test multiple key tracking
    test('should track multiple keys independently', (assert) => {
        // Press two keys
        const keyDownA = new KeyboardEvent('keydown', { code: 'KeyA' });
        const keyDownB = new KeyboardEvent('keydown', { code: 'KeyB' });
        
        window.dispatchEvent(keyDownA);
        window.dispatchEvent(keyDownB);
        
        assert.isTrue(inputHandler.isKeyPressed('KeyA'), 'First key should be pressed');
        assert.isTrue(inputHandler.isKeyPressed('KeyB'), 'Second key should be pressed');
        
        // Release one key
        const keyUpA = new KeyboardEvent('keyup', { code: 'KeyA' });
        window.dispatchEvent(keyUpA);
        
        assert.isFalse(inputHandler.isKeyPressed('KeyA'), 'First key should be released');
        assert.isTrue(inputHandler.isKeyPressed('KeyB'), 'Second key should still be pressed');
    });
    
    // Test touch handling
    // Note: These tests simulate touch events, but the actual DOM touch events
    // are more complex. In a real environment, you might need to use a testing
    // library that can better simulate touch events.
    test('touch tracking should update state', (assert) => {
        // Initially no touch
        assert.isFalse(inputHandler.isTouchActive(), 'Touch should not be active initially');
        
        // Create a mock touch event
        const touchStartEvent = new Event('touchstart');
        touchStartEvent.touches = [
            { identifier: 1, clientX: 100, clientY: 200 }
        ];
        touchStartEvent.preventDefault = () => {};
        
        // Dispatch the event
        window.dispatchEvent(touchStartEvent);
        
        // Check touch state
        assert.isTrue(inputHandler.isTouchActive(), 'Touch should be active after touchstart');
        assert.equal(inputHandler.getTouchPositions().length, 1, 'Should have one touch position');
        
        const primaryTouch = inputHandler.getPrimaryTouchPosition();
        assert.isDefined(primaryTouch, 'Primary touch should be defined');
        
        // Touch move event
        const touchMoveEvent = new Event('touchmove');
        touchMoveEvent.touches = [
            { identifier: 1, clientX: 150, clientY: 250 }
        ];
        touchMoveEvent.preventDefault = () => {};
        
        window.dispatchEvent(touchMoveEvent);
        
        // Check updated position
        const updatedTouch = inputHandler.getPrimaryTouchPosition();
        assert.isDefined(updatedTouch, 'Primary touch should still be defined');
        
        // Touch end event
        const touchEndEvent = new Event('touchend');
        touchEndEvent.touches = [];
        touchEndEvent.preventDefault = () => {};
        
        window.dispatchEvent(touchEndEvent);
        
        // Check touch state after end
        assert.isFalse(inputHandler.isTouchActive(), 'Touch should not be active after touchend');
        assert.equal(inputHandler.getTouchPositions().length, 0, 'Should have no touch positions');
        assert.isNull(inputHandler.getPrimaryTouchPosition(), 'Primary touch should be null');
    });
    
    // Test multiple touch handling
    test('should track multiple touches', (assert) => {
        // Create a mock touch event with multiple touches
        const touchStartEvent = new Event('touchstart');
        touchStartEvent.touches = [
            { identifier: 1, clientX: 100, clientY: 200 },
            { identifier: 2, clientX: 300, clientY: 400 }
        ];
        touchStartEvent.preventDefault = () => {};
        
        // Dispatch the event
        window.dispatchEvent(touchStartEvent);
        
        // Check touch state
        assert.isTrue(inputHandler.isTouchActive(), 'Touch should be active');
        assert.equal(inputHandler.getTouchPositions().length, 2, 'Should have two touch positions');
        
        // End one touch
        const touchEndEvent = new Event('touchend');
        touchEndEvent.touches = [
            { identifier: 1, clientX: 100, clientY: 200 }
        ];
        touchEndEvent.preventDefault = () => {};
        
        window.dispatchEvent(touchEndEvent);
        
        // Check updated state
        assert.isTrue(inputHandler.isTouchActive(), 'Touch should still be active');
        assert.equal(inputHandler.getTouchPositions().length, 1, 'Should have one touch position');
    });
    
    // Test update method
    test('update method should not throw errors', (assert) => {
        assert.doesNotThrow(() => {
            inputHandler.update(0.016);
        }, 'Update method should not throw errors');
    });
    
    // Test destroy method
    test('destroy should clean up resources', (assert) => {
        // Press a key
        const keyDownEvent = new KeyboardEvent('keydown', { code: 'KeyD' });
        window.dispatchEvent(keyDownEvent);
        
        assert.isTrue(inputHandler.isKeyPressed('KeyD'), 'Key should be pressed');
        
        // Destroy the input handler
        inputHandler.destroy();
        
        // Create a new one to test if event listeners were properly removed
        const newInputHandler = new InputHandler();
        
        // The new input handler should not have the key pressed
        assert.isFalse(newInputHandler.isKeyPressed('KeyD'), 'New input handler should not have key pressed');
        
        // Clean up
        newInputHandler.destroy();
    });
});