/**
 * Asset Loader
 * Handles loading and managing game assets
 */
export class AssetLoader {
    constructor() {
        this.images = {};
        this.sounds = {};
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

            // Add console log to show the path we're trying to load
            console.log('[AssetLoader] Attempting to load images from:', imagesToLoad);
            console.log('[AssetLoader] Current page URL:', window.location.href);

            const soundsToLoad = {
                // Define sounds to load
            };

            this.totalAssets = Object.keys(imagesToLoad).length + Object.keys(soundsToLoad).length;
            this.loadedAssets = 0;

            // Load images
            for (const [key, src] of Object.entries(imagesToLoad)) {
                const img = new Image();
                
                img.onload = () => {
                    this.assetLoaded(resolve);
                };
                
                img.onerror = (err) => {
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
}