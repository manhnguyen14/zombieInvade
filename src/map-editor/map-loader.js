/**
 * Map Loader for Zombie Lane Defense
 * Loads and renders maps created in the map editor
 */
export class MapLoader {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = null;
        this.laneCount = 9;
        this.laneHeight = 60;
        this.viewportOffset = 0; // Horizontal scrolling offset
        this.scrollSpeed = 5;
    }
    
    /**
     * Load a map from a file
     */
    loadMapFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const map = JSON.parse(event.target.result);
                    if (!map.name || !map.length) {
                        throw new Error('Invalid map format');
                    }
                    
                    this.map = map;
                    this.viewportOffset = 0;
                    this.render();
                    
                    console.log(`Map "${map.name}" loaded successfully!`);
                } catch (error) {
                    console.error(`Error loading map: ${error.message}`);
                    alert(`Error loading map: ${error.message}`);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    /**
     * Render the loaded map
     */
    render() {
        if (!this.map) {
            this.renderNoMap();
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lanes
        for (let i = 0; i < this.laneCount; i++) {
            this.ctx.fillStyle = i === 0 ? '#1f1f1f' : '#0d0d0d';
            this.ctx.fillRect(0, i * this.laneHeight, this.canvas.width, this.laneHeight);
            
            // Draw lane number
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`Lane ${i}`, 5, i * this.laneHeight + 15);
        }
        
        // Draw map info
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Map: ${this.map.name} (Length: ${this.map.length}px)`, 10, 25);
        this.ctx.fillText(`Viewport Position: ${this.viewportOffset}`, 10, 50);
        
        // Draw entities
        for (const obj of this.map.objects) {
            // Only draw entities that are within the viewport
            const adjustedPosition = obj.position - this.viewportOffset;
            if (adjustedPosition >= -50 && adjustedPosition <= this.canvas.width + 50) {
                this.drawEntity(obj, adjustedPosition);
            }
        }
        
        // Draw navigation controls
        this.drawNavigationControls();
    }
    
    /**
     * Render a message when no map is loaded
     */
    renderNoMap() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillText('Zombie Lane Defense - Map Viewer', 20, 30);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText('No map loaded. Click "Load Map" to load a map.', 20, 70);
        
        // Draw load button
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.canvas.width / 2 - 75, this.canvas.height / 2 - 20, 150, 40);
        
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Load Map', this.canvas.width / 2, this.canvas.height / 2 + 7);
        this.ctx.textAlign = 'left';
    }
    
    /**
     * Draw navigation controls
     */
    drawNavigationControls() {
        // Draw scroll left button
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(10, this.canvas.height - 50, 80, 40);
        
        // Draw scroll right button
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(100, this.canvas.height - 50, 80, 40);
        
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('← Scroll', 15, this.canvas.height - 25);
        this.ctx.fillText('Scroll →', 105, this.canvas.height - 25);
    }
    
    /**
     * Draw an entity on the canvas
     */
    drawEntity(entity, adjustedPosition) {
        const x = adjustedPosition;
        const y = entity.lane * this.laneHeight + this.laneHeight / 2;
        
        // Draw different shapes based on entity type
        this.ctx.beginPath();
        
        if (entity.type === 'enemy') {
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        } else if (entity.type === 'obstacle') {
            this.ctx.fillStyle = '#f39c12';
            this.ctx.rect(x - 15, y - 15, 30, 30);
        } else if (entity.type === 'bonus') {
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.moveTo(x, y - 15);
            this.ctx.lineTo(x + 15, y + 15);
            this.ctx.lineTo(x - 15, y + 15);
        }
        
        this.ctx.fill();
        
        // Draw entity info
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`${entity.objectType}`, x - 15, y - 5);
        this.ctx.fillText(`${entity.variant}`, x - 15, y + 5);
    }
}