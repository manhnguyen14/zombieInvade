/**
 * Map Storage
 * Handles saving and loading maps from localStorage
 */
export class MapStorage {
    constructor() {
        this.localStorageKey = 'zombieLaneDefense_maps';
    }
    
    // Load all maps from localStorage
    loadMaps() {
        const mapsJson = localStorage.getItem(this.localStorageKey);
        return mapsJson ? JSON.parse(mapsJson) : [];
    }
    
    // Save all maps to localStorage
    saveMaps(maps) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(maps));
    }
    
    // Save a single map to localStorage
    saveMap(map) {
        if (!map.id) {
            map.id = this._generateId();
        }
        
        const maps = this.loadMaps();
        const existingMapIndex = maps.findIndex(m => m.id === map.id);
        
        if (existingMapIndex >= 0) {
            maps[existingMapIndex] = map;
        } else {
            maps.push(map);
        }
        
        this.saveMaps(maps);
        return map;
    }
    
    // Save a map to localStorage with a specific key
    saveMapToLocalStorage(map, storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(map));
    }
    
    // Delete a map from localStorage
    deleteMap(mapId) {
        const maps = this.loadMaps();
        const filteredMaps = maps.filter(map => map.id !== mapId);
        this.saveMaps(filteredMaps);
    }
    
    // Get a map by ID
    getMap(mapId) {
        const maps = this.loadMaps();
        return maps.find(map => map.id === mapId) || null;
    }
    
    // Generate a unique ID for a new map
    _generateId() {
        return 'map_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Import a map from a file
     * @returns {Promise<Object>} The imported map
     */
    importMapFromFile() {
        return new Promise((resolve, reject) => {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // Trigger click to open file dialog
            fileInput.click();
            
            // Handle file selection
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) {
                    document.body.removeChild(fileInput);
                    reject(new Error('No file selected'));
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const mapData = JSON.parse(event.target.result);
                        document.body.removeChild(fileInput);
                        
                        // Add the imported map to the maps array
                        const maps = this.loadMaps();
                        maps.push(mapData);
                        this.saveMaps(maps);
                        
                        resolve(mapData);
                    } catch (error) {
                        document.body.removeChild(fileInput);
                        reject(new Error('Invalid map file format'));
                    }
                };
                
                reader.onerror = () => {
                    document.body.removeChild(fileInput);
                    reject(new Error('Error reading file'));
                };
                
                reader.readAsText(file);
            });
        });
    }
}
