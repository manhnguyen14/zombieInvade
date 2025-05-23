/**
 * Renderer Unit Tests
 * 
 * Tests for the Renderer class to ensure it correctly
 * handles canvas rendering operations.
 */

import { Renderer } from '../../src/core/renderer.js';

// Define the test suite for Renderer
suite('Renderer', () => {
    let renderer;
    let canvas;
    let mockContext;
    
    // Set up a mock canvas and context before each test
    beforeEach(() => {
        // Create a canvas element
        canvas = document.createElement('canvas');
        
        // Create a mock context with spies for all methods
        mockContext = {
            clearRect: function() {},
            fillRect: function() {},
            strokeRect: function() {},
            beginPath: function() {},
            arc: function() {},
            fill: function() {},
            stroke: function() {},
            moveTo: function() {},
            lineTo: function() {},
            fillText: function() {},
            drawImage: function() {},
            save: function() {},
            restore: function() {},
            // Add properties that will be set
            font: '',
            textAlign: '',
            textBaseline: '',
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            globalAlpha: 1,
            imageSmoothingEnabled: true
        };
        
        // Add spy functions to track method calls
        for (const method in mockContext) {
            if (typeof mockContext[method] === 'function') {
                spyOn(mockContext, method);
            }
        }
        
        // Mock the getContext method to return our mock context
        canvas.getContext = function() {
            return mockContext;
        };
        
        // Create the renderer with the mock canvas
        renderer = new Renderer({
            canvas: canvas,
            width: 800,
            height: 600
        });
    });
    
    // Helper function to spy on a method
    function spyOn(obj, method) {
        const original = obj[method];
        obj[method] = function() {
            obj[method].calls = (obj[method].calls || 0) + 1;
            obj[method].args = Array.from(arguments);
            return original.apply(this, arguments);
        };
        obj[method].calls = 0;
        obj[method].args = null;
    }
    
    // Test constructor
    test('constructor should initialize with correct dimensions', (assert) => {
        assert.equal(renderer.width, 800, 'Width should be set correctly');
        assert.equal(renderer.height, 600, 'Height should be set correctly');
        assert.equal(canvas.width, 800, 'Canvas width should be set correctly');
        assert.equal(canvas.height, 600, 'Canvas height should be set correctly');
    });
    
    // Test constructor with invalid parameters
    test('constructor should throw error with invalid parameters', (assert) => {
        assert.throws(
            () => new Renderer({}),
            /Renderer requires a valid configuration with canvas element/,
            'Should throw error for missing canvas'
        );
        
        assert.throws(
            () => new Renderer({ canvas: null }),
            /Renderer requires a valid configuration with canvas element/,
            'Should throw error for null canvas'
        );
    });
    
    // Test clear method
    test('clear should call clearRect with correct dimensions', (assert) => {
        renderer.clear();
        
        assert.equal(mockContext.clearRect.calls, 1, 'clearRect should be called once');
        assert.equal(mockContext.clearRect.args[0], 0, 'clearRect x should be 0');
        assert.equal(mockContext.clearRect.args[1], 0, 'clearRect y should be 0');
        assert.equal(mockContext.clearRect.args[2], 800, 'clearRect width should match canvas width');
        assert.equal(mockContext.clearRect.args[3], 600, 'clearRect height should match canvas height');
    });
    
    // Test fillBackground method
    test('fillBackground should fill the entire canvas', (assert) => {
        renderer.fillBackground('#FF0000');
        
        assert.equal(mockContext.fillStyle, '#FF0000', 'fillStyle should be set to the specified color');
        assert.equal(mockContext.fillRect.calls, 1, 'fillRect should be called once');
        assert.equal(mockContext.fillRect.args[0], 0, 'fillRect x should be 0');
        assert.equal(mockContext.fillRect.args[1], 0, 'fillRect y should be 0');
        assert.equal(mockContext.fillRect.args[2], 800, 'fillRect width should match canvas width');
        assert.equal(mockContext.fillRect.args[3], 600, 'fillRect height should match canvas height');
    });
    
    // Test drawRect method
    test('drawRect should draw a rectangle with the specified parameters', (assert) => {
        renderer.drawRect(10, 20, 30, 40, '#00FF00');
        
        assert.equal(mockContext.fillStyle, '#00FF00', 'fillStyle should be set to the specified color');
        assert.equal(mockContext.fillRect.calls, 1, 'fillRect should be called once');
        assert.equal(mockContext.fillRect.args[0], 10, 'fillRect x should match parameter');
        assert.equal(mockContext.fillRect.args[1], 20, 'fillRect y should match parameter');
        assert.equal(mockContext.fillRect.args[2], 30, 'fillRect width should match parameter');
        assert.equal(mockContext.fillRect.args[3], 40, 'fillRect height should match parameter');
    });
    
    // Test drawRectOutline method
    test('drawRectOutline should draw a rectangle outline', (assert) => {
        renderer.drawRectOutline(10, 20, 30, 40, '#0000FF', 2);
        
        assert.equal(mockContext.strokeStyle, '#0000FF', 'strokeStyle should be set to the specified color');
        assert.equal(mockContext.lineWidth, 2, 'lineWidth should be set to the specified width');
        assert.equal(mockContext.strokeRect.calls, 1, 'strokeRect should be called once');
        assert.equal(mockContext.strokeRect.args[0], 10, 'strokeRect x should match parameter');
        assert.equal(mockContext.strokeRect.args[1], 20, 'strokeRect y should match parameter');
        assert.equal(mockContext.strokeRect.args[2], 30, 'strokeRect width should match parameter');
        assert.equal(mockContext.strokeRect.args[3], 40, 'strokeRect height should match parameter');
    });
    
    // Test drawCircle method
    test('drawCircle should draw a circle with the specified parameters', (assert) => {
        renderer.drawCircle(100, 100, 50, '#FF00FF');
        
        assert.equal(mockContext.fillStyle, '#FF00FF', 'fillStyle should be set to the specified color');
        assert.equal(mockContext.beginPath.calls, 1, 'beginPath should be called once');
        assert.equal(mockContext.arc.calls, 1, 'arc should be called once');
        assert.equal(mockContext.arc.args[0], 100, 'arc x should match parameter');
        assert.equal(mockContext.arc.args[1], 100, 'arc y should match parameter');
        assert.equal(mockContext.arc.args[2], 50, 'arc radius should match parameter');
        assert.equal(mockContext.fill.calls, 1, 'fill should be called once');
    });
    
    // Test drawCircleOutline method
    test('drawCircleOutline should draw a circle outline', (assert) => {
        renderer.drawCircleOutline(100, 100, 50, '#00FFFF', 3);
        
        assert.equal(mockContext.strokeStyle, '#00FFFF', 'strokeStyle should be set to the specified color');
        assert.equal(mockContext.lineWidth, 3, 'lineWidth should be set to the specified width');
        assert.equal(mockContext.beginPath.calls, 1, 'beginPath should be called once');
        assert.equal(mockContext.arc.calls, 1, 'arc should be called once');
        assert.equal(mockContext.stroke.calls, 1, 'stroke should be called once');
    });
    
    // Test drawLine method
    test('drawLine should draw a line with the specified parameters', (assert) => {
        renderer.drawLine(10, 20, 30, 40, '#FFFF00', 2);
        
        assert.equal(mockContext.strokeStyle, '#FFFF00', 'strokeStyle should be set to the specified color');
        assert.equal(mockContext.lineWidth, 2, 'lineWidth should be set to the specified width');
        assert.equal(mockContext.beginPath.calls, 1, 'beginPath should be called once');
        assert.equal(mockContext.moveTo.calls, 1, 'moveTo should be called once');
        assert.equal(mockContext.moveTo.args[0], 10, 'moveTo x should match parameter');
        assert.equal(mockContext.moveTo.args[1], 20, 'moveTo y should match parameter');
        assert.equal(mockContext.lineTo.calls, 1, 'lineTo should be called once');
        assert.equal(mockContext.lineTo.args[0], 30, 'lineTo x should match parameter');
        assert.equal(mockContext.lineTo.args[1], 40, 'lineTo y should match parameter');
        assert.equal(mockContext.stroke.calls, 1, 'stroke should be called once');
    });
    
    // Test drawText method
    test('drawText should draw text with the specified parameters', (assert) => {
        renderer.drawText('Hello World', 50, 100, '#000000', '24px Arial');
        
        assert.equal(mockContext.font, '24px Arial', 'font should be set to the specified font');
        assert.equal(mockContext.fillStyle, '#000000', 'fillStyle should be set to the specified color');
        assert.equal(mockContext.fillText.calls, 1, 'fillText should be called once');
        assert.equal(mockContext.fillText.args[0], 'Hello World', 'fillText text should match parameter');
        assert.equal(mockContext.fillText.args[1], 50, 'fillText x should match parameter');
        assert.equal(mockContext.fillText.args[2], 100, 'fillText y should match parameter');
    });
    
    // Test drawImage method
    test('drawImage should draw an image with the specified parameters', (assert) => {
        const mockImage = {};
        
        // Test with default width/height
        renderer.drawImage(mockImage, 10, 20);
        
        assert.equal(mockContext.drawImage.calls, 1, 'drawImage should be called once');
        assert.equal(mockContext.drawImage.args[0], mockImage, 'drawImage image should match parameter');
        assert.equal(mockContext.drawImage.args[1], 10, 'drawImage x should match parameter');
        assert.equal(mockContext.drawImage.args[2], 20, 'drawImage y should match parameter');
        
        // Test with specified width/height
        renderer.drawImage(mockImage, 30, 40, 50, 60);
        
        assert.equal(mockContext.drawImage.calls, 2, 'drawImage should be called twice');
        assert.equal(mockContext.drawImage.args[0], mockImage, 'drawImage image should match parameter');
        assert.equal(mockContext.drawImage.args[1], 30, 'drawImage x should match parameter');
        assert.equal(mockContext.drawImage.args[2], 40, 'drawImage y should match parameter');
        assert.equal(mockContext.drawImage.args[3], 50, 'drawImage width should match parameter');
        assert.equal(mockContext.drawImage.args[4], 60, 'drawImage height should match parameter');
    });
    
    // Test drawSprite method
    test('drawSprite should draw a sprite with the specified parameters', (assert) => {
        const mockSpritesheet = {};
        
        renderer.drawSprite(mockSpritesheet, 10, 20, 30, 40, 50, 60, 70, 80);
        
        assert.equal(mockContext.drawImage.calls, 1, 'drawImage should be called once');
        assert.equal(mockContext.drawImage.args[0], mockSpritesheet, 'drawImage spritesheet should match parameter');
        assert.equal(mockContext.drawImage.args[1], 10, 'drawImage sourceX should match parameter');
        assert.equal(mockContext.drawImage.args[2], 20, 'drawImage sourceY should match parameter');
        assert.equal(mockContext.drawImage.args[3], 30, 'drawImage sourceWidth should match parameter');
        assert.equal(mockContext.drawImage.args[4], 40, 'drawImage sourceHeight should match parameter');
        assert.equal(mockContext.drawImage.args[5], 50, 'drawImage destX should match parameter');
        assert.equal(mockContext.drawImage.args[6], 60, 'drawImage destY should match parameter');
        assert.equal(mockContext.drawImage.args[7], 70, 'drawImage destWidth should match parameter');
        assert.equal(mockContext.drawImage.args[8], 80, 'drawImage destHeight should match parameter');
    });
    
    // Test save and restore methods
    test('save and restore should call context methods', (assert) => {
        renderer.save();
        assert.equal(mockContext.save.calls, 1, 'save should be called once');
        
        renderer.restore();
        assert.equal(mockContext.restore.calls, 1, 'restore should be called once');
    });
    
    // Test setAlpha and resetAlpha methods
    test('setAlpha and resetAlpha should set globalAlpha', (assert) => {
        renderer.setAlpha(0.5);
        assert.equal(mockContext.globalAlpha, 0.5, 'globalAlpha should be set to 0.5');
        
        renderer.resetAlpha();
        assert.equal(mockContext.globalAlpha, 1, 'globalAlpha should be reset to 1');
    });
    
    // Test getContext method
    test('getContext should return the canvas context', (assert) => {
        const context = renderer.getContext();
        assert.equal(context, mockContext, 'getContext should return the canvas context');
    });
    
    // Test resize method
    test('resize should update canvas dimensions', (assert) => {
        renderer.resize(1024, 768);
        
        assert.equal(renderer.width, 1024, 'Width should be updated');
        assert.equal(renderer.height, 768, 'Height should be updated');
        assert.equal(canvas.width, 1024, 'Canvas width should be updated');
        assert.equal(canvas.height, 768, 'Canvas height should be updated');
    });
    
    // Test error handling in drawImage
    test('drawImage should handle null images gracefully', (assert) => {
        assert.doesNotThrow(() => {
            renderer.drawImage(null, 0, 0);
        }, 'drawImage should not throw for null image');
        
        assert.equal(mockContext.drawImage.calls, 0, 'drawImage should not be called for null image');
    });
    
    // Test error handling in drawSprite
    test('drawSprite should handle null spritesheets gracefully', (assert) => {
        assert.doesNotThrow(() => {
            renderer.drawSprite(null, 0, 0, 10, 10, 0, 0);
        }, 'drawSprite should not throw for null spritesheet');
        
        assert.equal(mockContext.drawImage.calls, 0, 'drawImage should not be called for null spritesheet');
    });
});