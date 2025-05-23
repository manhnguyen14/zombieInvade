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

    // Save a map to localStorage with a specific key
    saveMapToLocalStorage(map, storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(map));
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

    // Save a map to a file
    saveMapToFile(map) {
        if (!map) return;
        
        // Create a Blob with the map data
        const mapJson = JSON.stringify(map, null, 2);
        const blob = new Blob([mapJson], { type: 'application/json' });
        
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${map.name || 'map'}.json`;
        
        // Trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}
