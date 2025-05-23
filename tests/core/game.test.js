/**
 * Game Unit Tests
 * 
 * Tests for the Game class to ensure it correctly
 * manages the game loop and coordinates game systems.
 */

import { Game } from '../../src/core/game.js';
import { ServiceLocator } from '../../src/core/service-locator.js';

// Define the test suite for Game
suite('Game', () => {
    let game;
    let mockCanvas;
    let mockRequestAnimationFrame;
    let originalRequestAnimationFrame;
    
    // Set up before each test
    beforeEach(() => {
        // Clear any existing services
        ServiceLocator.clearServices();
        
        // Create a mock canvas
        mockCanvas = document.createElement('canvas');
        
        // Mock requestAnimationFrame
        originalRequestAnimationFrame = window.requestAnimationFrame;
        mockRequestAnimationFrame = function(callback) {
            mockRequestAnimationFrame.calls = (mockRequestAnimationFrame.calls || 0) + 1;
            mockRequestAnimationFrame.callback = callback;
            return 123; // Mock ID
        };
        mockRequestAnimationFrame.calls = 0;
        mockRequestAnimationFrame.callback = null;
        window.requestAnimationFrame = mockRequestAnimationFrame;
        
        // Create the game instance
        game = new Game({
            canvas: mockCanvas,
            width: 800,
            height: 600
        });
    });
    
    // Clean up after each test
    afterEach(() => {
        if (game) {
            game.destroy();
            game = null;
        }
        
        // Restore original requestAnimationFrame
        window.requestAnimationFrame = originalRequestAnimationFrame;
        
        // Clear services
        ServiceLocator.clearServices();
    });
    
    // Test constructor
    test('constructor should initialize with correct configuration', (assert) => {
        assert.isDefined(game, 'Game instance should be created');
        assert.isFalse(game.isRunning, 'Game should not be running initially');
        
        // Should throw error with invalid config
        assert.throws(
            () => new Game(),
            /Game requires a valid configuration with canvas element/,
            'Should throw error for missing config'
        );
        
        assert.throws(
            () => new Game({}),
            /Game requires a valid configuration with canvas element/,
            'Should throw error for missing canvas'
        );
    });
    
    // Test service registration
    test('constructor should register core services', (assert) => {
        assert.isTrue(ServiceLocator.hasService('renderer'), 'Renderer service should be registered');
        assert.isTrue(ServiceLocator.hasService('input'), 'Input service should be registered');
        assert.isTrue(ServiceLocator.hasService('timer'), 'Timer service should be registered');
    });
    
    // Test start method
    test('start should begin the game loop', (assert) => {
        game.start();
        
        assert.isTrue(game.isRunning, 'Game should be running after start');
        assert.equal(mockRequestAnimationFrame.calls, 1, 'requestAnimationFrame should be called once');
        assert.isFunction(mockRequestAnimationFrame.callback, 'Game loop callback should be set');
    });
    
    // Test start when already running
    test('start should not restart if already running', (assert) => {
        game.start();
        const firstCallback = mockRequestAnimationFrame.callback;
        
        // Call start again
        game.start();
        
        assert.equal(mockRequestAnimationFrame.calls, 1, 'requestAnimationFrame should only be called once');
        assert.equal(mockRequestAnimationFrame.callback, firstCallback, 'Callback should not change');
    });
    
    // Test stop method
    test('stop should halt the game loop', (assert) => {
        game.start();
        assert.isTrue(game.isRunning, 'Game should be running after start');
        
        game.stop();
        assert.isFalse(game.isRunning, 'Game should not be running after stop');
        
        // Simulate a frame callback after stop
        if (mockRequestAnimationFrame.callback) {
            mockRequestAnimationFrame.callback(performance.now());
        }
        
        // Should not request another frame
        assert.equal(mockRequestAnimationFrame.calls, 1, 'No new frames should be requested after stop');
    });
    
    // Test game loop
    test('game loop should update systems and render', (assert) => {
        // Create a mock system to track updates
        const mockSystem = {
            update: function() {
                mockSystem.updateCalls = (mockSystem.updateCalls || 0) + 1;
            },
            updateCalls: 0
        };
        
        // Add the mock system
        game.addSystem(mockSystem);
        
        // Start the game
        game.start();
        
        // Simulate a frame
        if (mockRequestAnimationFrame.callback) {
            mockRequestAnimationFrame.callback(performance.now());
        }
        
        assert.equal(mockSystem.updateCalls, 1, 'System update should be called once per frame');
        assert.equal(mockRequestAnimationFrame.calls, 2, 'Next frame should be requested');
        
        // Simulate another frame
        if (mockRequestAnimationFrame.callback) {
            mockRequestAnimationFrame.callback(performance.now() + 16);
        }
        
        assert.equal(mockSystem.updateCalls, 2, 'System update should be called twice after two frames');
        assert.equal(mockRequestAnimationFrame.calls, 3, 'Third frame should be requested');
    });
    
    // Test addSystem method
    test('addSystem should add a system to the game loop', (assert) => {
        const mockSystem1 = { update: function() {} };
        const mockSystem2 = { update: function() {} };
        
        game.addSystem(mockSystem1);
        game.addSystem(mockSystem2);
        
        // Check that systems were added (indirectly by checking systems array length)
        assert.equal(game.systems.length, 4, 'Game should have 4 systems (2 core + 2 added)');
    });
    
    // Test addSystem with invalid system
    test('addSystem should throw error with invalid system', (assert) => {
        assert.throws(
            () => game.addSystem({}),
            /System must have an update method/,
            'Should throw error for system without update method'
        );
        
        assert.throws(
            () => game.addSystem(null),
            /System must have an update method/,
            'Should throw error for null system'
        );
    });
    
    // Test destroy method
    test('destroy should clean up resources', (assert) => {
        // Create a mock system with destroy method
        const mockSystem = {
            update: function() {},
            destroy: function() {
                mockSystem.destroyCalled = true;
            },
            destroyCalled: false
        };
        
        game.addSystem(mockSystem);
        game.start();
        
        // Destroy the game
        game.destroy();
        
        assert.isFalse(game.isRunning, 'Game should not be running after destroy');
        assert.isTrue(mockSystem.destroyCalled, 'System destroy method should be called');
        assert.equal(game.systems.length, 0, 'Systems array should be empty after destroy');
        assert.isFalse(ServiceLocator.hasService('renderer'), 'Services should be cleared after destroy');
    });
    
    // Test game loop with delta time
    test('game loop should calculate correct delta time', (assert) => {
        // Create a mock system to track delta time
        const mockSystem = {
            update: function(deltaTime) {
                mockSystem.lastDeltaTime = deltaTime;
            },
            lastDeltaTime: 0
        };
        
        game.addSystem(mockSystem);
        game.start();
        
        // Simulate first frame
        const firstTime = performance.now();
        if (mockRequestAnimationFrame.callback) {
            mockRequestAnimationFrame.callback(firstTime);
        }
        
        // Simulate second frame 16ms later (approx 60fps)
        const secondTime = firstTime + 16;
        if (mockRequestAnimationFrame.callback) {
            mockRequestAnimationFrame.callback(secondTime);
        }
        
        // Delta time should be approximately 0.016 seconds (16ms)
        assert.approximately(mockSystem.lastDeltaTime, 0.016, 0.005, 'Delta time should be approximately 16ms');
    });
    
    // Test integration with renderer
    test('game should use renderer for rendering', (assert) => {
        // Get the renderer service
        const renderer = ServiceLocator.getService('renderer');
        
        // Spy on the clear method
        const originalClear = renderer.clear;
        let clearCalled = false;
        renderer.clear = function() {
            clearCalled = true;
            return originalClear.apply(this, arguments);
        };
        
        // Start the game and simulate a frame
        game.start();
        if (mockRequestAnimationFrame.callback) {
            mockRequestAnimationFrame.callback(performance.now());
        }
        
        assert.isTrue(clearCalled, 'Renderer clear method should be called during game loop');
        
        // Restore original method
        renderer.clear = originalClear;
    });
});

// Helper function to check if a value is a function
function isFunction(value) {
    return typeof value === 'function';
}