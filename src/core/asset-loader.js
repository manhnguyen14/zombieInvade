/**
 * Asset Loader
 * Handles loading and managing game assets
 */
export class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.maps = {};
        this.loaded = false;
        this.loadPromise = null;
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    /**
     * Load all game assets
     * @returns {Promise} A promise that resolves when all assets are loaded
     */
    loadAssets() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = new Promise((resolve, reject) => {
            // Determine the correct path to assets based on current URL
            let assetsBasePath = 'assets/';
            
            // If we're in the UI folder, we need to go up two levels
            if (window.location.href.includes('/src/ui/')) {
                assetsBasePath = '../../assets/';
            }
            // If we're in tests folder, we need to go up two levels
            else if (window.location.href.includes('/tests/')) {
                assetsBasePath = '../../assets/';
            }
            // If we're in any other src subfolder, we need to go up one level
            else if (window.location.href.includes('/src/')) {
                assetsBasePath = '../assets/';
            }
            
            console.log(`[AssetLoader] Using assets base path: ${assetsBasePath}`);
            
            // Define assets to load with the correct base path
            const imagesToLoad = {
                'spriteSheet': `${assetsBasePath}images/sprite-sheet.png`,
            };

            const soundsToLoad = {
                'bonusGrenadeCollected': `${assetsBasePath}audio/bonusGrenadeCollected.wav`,
                'bonusGunCollected': `${assetsBasePath}audio/bonusGunCollected.wav`,
                'bonusSoldierCollected': `${assetsBasePath}audio/bonusSoldierCollected.wav`,
                'bulletAk47': `${assetsBasePath}audio/bulletAk47.wav`,
                'bulletBenelliM4': `${assetsBasePath}audio/bulletBenelliM4.wav`,
                'bulletDesertEagle': `${assetsBasePath}audio/bulletDesertEagle.wav`,
                'bulletGlock17': `${assetsBasePath}audio/bulletGlock17.wav`,
                'bulletBarrettXm109': `${assetsBasePath}audio/bulletBarrettXm109.wav`,
                'projectileEnemyCollision': `${assetsBasePath}audio/projectileEnemyCollision.wav`,
                'finishGame': `${assetsBasePath}audio/finishGame.wav`,
                'grenadeDamageAreaCreated': `${assetsBasePath}audio/grenadeDamageAreaCreated.wav`,
                'moveUpDown': `${assetsBasePath}audio/moveUpDown.wav`,
                'speedUpDown': `${assetsBasePath}audio/speedUpDown.wav`,
                'throwGrenade': `${assetsBasePath}audio/throwGrenade.wav`,
                'enemyEscaped': `${assetsBasePath}audio/enemyEscaped.wav`,
                'obstacleCollision': `${assetsBasePath}audio/obstacleCollision.wav`,
                'enemySoldierCollision': `${assetsBasePath}audio/enemySoldierCollision.wav`
            };
            
            // Define JSON files to load
            const jsonToLoad = {
                'defaultMaps': `${assetsBasePath}maps/default-maps.json`
            };

            console.log(`[AssetLoader] Will load JSON from: ${jsonToLoad.defaultMaps}`);
            
            // Check if the file exists before trying to load it
            fetch(jsonToLoad.defaultMaps, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        console.log(`[AssetLoader] Confirmed default-maps.json exists at ${jsonToLoad.defaultMaps}`);
                    } else {
                        console.error(`[AssetLoader] default-maps.json NOT FOUND at ${jsonToLoad.defaultMaps} (${response.status})`);
                    }
                })
                .catch(err => {
                    console.error(`[AssetLoader] Error checking if default-maps.json exists:`, err);
                });

            this.totalAssets = Object.keys(imagesToLoad).length + 
                              Object.keys(soundsToLoad).length + 
                              Object.keys(jsonToLoad).length;
            this.loadedAssets = 0;

            // Load images
            for (const [key, src] of Object.entries(imagesToLoad)) {
                const img = new Image();
                
                img.onload = () => {
                    this.assetLoaded(resolve);
                };
                
                img.onerror = (err) => {
                    console.error(`Failed to load image: ${src}`, err);
                    this.assetLoaded(resolve);
                };
                
                // Try with a timestamp to avoid caching issues
                img.src = `${src}?t=${Date.now()}`;
                this.images[key] = img;
            }

            // Load sounds
            for (const [key, src] of Object.entries(soundsToLoad)) {
                const sound = new Audio();
                sound.oncanplaythrough = () => this.assetLoaded(resolve);
                sound.onerror = (err) => {
                    console.error(`Failed to load sound: ${src}`, err);
                    this.assetLoaded(resolve);
                };
                sound.src = src;
                this.sounds[key] = sound;
            }
            
            // Load JSON files
            for (const [key, src] of Object.entries(jsonToLoad)) {
                console.log(`[AssetLoader] Loading JSON: ${key} from ${src}`);
                fetch(src)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Failed to load JSON: ${src} (${response.status} ${response.statusText})`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(`[AssetLoader] Successfully loaded JSON: ${key}`, data);
                        if (!this.maps) this.maps = {};
                        this.maps[key] = data;
                        this.assetLoaded(resolve);
                    })
                    .catch(err => {
                        console.error(`[AssetLoader] Failed to load JSON: ${src}`, err);
                        this.assetLoaded(resolve);
                    });
            }

            // Handle case where there are no assets to load
            if (this.totalAssets === 0) {
                this.loaded = true;
                resolve();
            }
        });

        return this.loadPromise;
    }

    /**
     * Called when an asset is loaded
     * @param {Function} resolve - Promise resolve function
     */
    assetLoaded(resolve) {
        this.loadedAssets++;
        
        // Check if all assets are loaded
        if (this.loadedAssets >= this.totalAssets) {
            this.loaded = true;
            resolve();
        }
    }

    /**
     * Get a loaded image
     * @param {string} key - The image key
     * @returns {HTMLImageElement} The image
     */
    getImage(key) {
        return this.images[key];
    }

    /**
     * Get a loaded sound
     * @param {string} key - The sound key
     * @returns {HTMLAudioElement} The sound
     */
    getSound(key) {
        return this.sounds[key];
    }
    
    /**
     * Get a loaded JSON asset
     * @param {string} key - The JSON key
     * @returns {Object} The parsed JSON data
     */
    getJSON(key) {
        return this.maps[key];
    }
}
