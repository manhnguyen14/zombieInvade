/**
 * Renderer Class
 *
 * Handles all canvas rendering operations for the game.
 * Provides methods for clearing the canvas, drawing game elements,
 * and managing the rendering context.
 */

export class Renderer {
    /**
     * Create a new Renderer instance
     * @param {Object} config - Configuration object
     * @param {HTMLCanvasElement} config.canvas - The canvas element
     * @param {number} config.width - Canvas width
     * @param {number} config.height - Canvas height
     */
    constructor(config) {
        if (!config || !config.canvas) {
            throw new Error('Renderer requires a valid configuration with canvas element');
        }

        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }

        // Set canvas dimensions
        this.canvas.width = config.width || 800;
        this.canvas.height = config.height || 600;

        // Store dimensions for reference
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Default rendering settings
        this._setupDefaultSettings();
    }

    /**
     * Set up default rendering settings
     * @private
     */
    _setupDefaultSettings() {
        // Set default font
        this.ctx.font = '16px Arial';

        // Set default text alignment
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // Enable image smoothing for better visual quality
        this.ctx.imageSmoothingEnabled = true;
    }

    /**
     * Clear the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Add text to show the canvas is working
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Canvas is working - Check console (F12) for debug info', 20, 30);

    }

    /**
     * Fill the canvas with a specific color
     * @param {string} color - CSS color string
     */
    fillBackground(color = '#000000') {
        if (typeof window.debugLog === 'function') {
            window.debugLog(`Filling background with color: ${color}`);
        } else {
            console.log(`Filling background with color: ${color}`);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw a border for debugging
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(2, 2, this.width - 4, this.height - 4);

        if (typeof window.debugLog === 'function') {
            window.debugLog('Background filled and debug border added');
        } else {
            console.log('Background filled and debug border added');
        }
    }

    /**
     * Draw a rectangle
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} offsetX - X offset
     * @param {number} offsetY - Y offset
     * @param {string} color - Fill color
     */
    drawRect(x, y, width, height, color = '#FFFFFF', offsetX = 0, offsetY = 0) {
        const posX = x + offsetX;
        const posY = y + offsetY;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(posX, posY, width, height);

        // Draw a border for debugging
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(posX, posY, width, height);
    }

    /**
     * Draw a rectangle outline
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {string} color - Stroke color
     * @param {number} lineWidth - Width of the outline
     */
    drawRectOutline(x, y, width, height, color = '#FFFFFF', lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.strokeRect(x, y, width, height);
    }

    /**
     * Draw a circle
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Circle radius
     * @param {string} color - Fill color
     */
    drawCircle(x, y, radius, color = '#FFFFFF') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw a circle outline
     * @param {number} x - Center X coordinate
     * @param {number} y - Center Y coordinate
     * @param {number} radius - Circle radius
     * @param {string} color - Stroke color
     * @param {number} lineWidth - Width of the outline
     */
    drawCircleOutline(x, y, radius, color = '#FFFFFF', lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    /**
     * Draw a line
     * @param {number} x1 - Starting X coordinate
     * @param {number} y1 - Starting Y coordinate
     * @param {number} x2 - Ending X coordinate
     * @param {number} y2 - Ending Y coordinate
     * @param {string} color - Line color
     * @param {number} lineWidth - Width of the line
     */
    drawLine(x1, y1, x2, y2, color = '#FFFFFF', lineWidth = 1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    /**
     * Draw text
     * @param {string} text - Text to draw
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} color - Text color
     * @param {string} font - CSS font string
     */
    drawText(text, x, y, color = '#FFFFFF', font = '16px Arial') {
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Draw an image
     * @param {HTMLImageElement} image - Image to draw
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Image width (optional, defaults to image's natural width)
     * @param {number} height - Image height (optional, defaults to image's natural height)
     */
    drawImage(image, x, y, width = null, height = null) {
        if (!image) {
            console.warn('Attempted to draw null or undefined image');
            return;
        }

        try {
            if (width === null || height === null) {
                this.ctx.drawImage(image, x, y);
            } else {
                this.ctx.drawImage(image, x, y, width, height);
            }
        } catch (error) {
            console.error('Error drawing image:', error);
        }
    }

    /**
     * Draw a sprite from a spritesheet
     * @param {HTMLImageElement} spritesheet - Spritesheet image
     * @param {number} sourceX - Source X coordinate in the spritesheet
     * @param {number} sourceY - Source Y coordinate in the spritesheet
     * @param {number} sourceWidth - Width of the sprite in the spritesheet
     * @param {number} sourceHeight - Height of the sprite in the spritesheet
     * @param {number} destX - Destination X coordinate on the canvas
     * @param {number} destY - Destination Y coordinate on the canvas
     * @param {number} destWidth - Destination width on the canvas
     * @param {number} destHeight - Destination height on the canvas
     */
    drawSprite(
        spritesheet,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth = sourceWidth,
        destHeight = sourceHeight
    ) {
        if (!spritesheet) {
            console.warn('Attempted to draw from null or undefined spritesheet');
            return;
        }

        try {
            this.ctx.drawImage(
                spritesheet,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                destX,
                destY,
                destWidth,
                destHeight
            );
        } catch (error) {
            console.error('Error drawing sprite:', error);
        }
    }

    /**
     * Save the current rendering state
     */
    save() {
        this.ctx.save();
    }

    /**
     * Restore the previously saved rendering state
     */
    restore() {
        this.ctx.restore();
    }

    /**
     * Set global alpha (transparency)
     * @param {number} alpha - Alpha value (0-1)
     */
    setAlpha(alpha) {
        this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    /**
     * Reset global alpha to 1 (fully opaque)
     */
    resetAlpha() {
        this.ctx.globalAlpha = 1;
    }

    /**
     * Get the canvas rendering context
     * @returns {CanvasRenderingContext2D} The 2D rendering context
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Resize the canvas
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;

        // Re-apply default settings after resize
        this._setupDefaultSettings();

    }
}