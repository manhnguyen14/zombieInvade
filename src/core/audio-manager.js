import { ServiceLocator } from './service-locator.js';

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.volume = 0.5; // Default volume
        this.activeSounds = [];
    }

    initialize() {
        // Try to get sounds from AssetLoader
        try {
            const assetLoader = ServiceLocator.getService('assetLoader');
            if (assetLoader) {
                this.sounds = assetLoader.sounds;
                console.log('[AUDIO_MANAGER] Initialized with sounds:', Object.keys(this.sounds));
            }
        } catch (e) {
            console.log('[AUDIO_MANAGER] AssetLoader not available yet, will initialize sounds later');
            // We'll load sounds later when AssetLoader becomes available
        }
    }

    // Add a method to load sounds when AssetLoader becomes available
    loadSoundsFromAssetLoader() {
        try {
            const assetLoader = ServiceLocator.getService('assetLoader');
            if (assetLoader && assetLoader.sounds) {
                this.sounds = assetLoader.sounds;
                console.log('[AUDIO_MANAGER] Loaded sounds from AssetLoader:', Object.keys(this.sounds));
            }
        } catch (e) {
            console.error('[AUDIO_MANAGER] Failed to load sounds from AssetLoader:', e);
        }
    }

    playSound(soundId, volume = 1.0) {
        // Try to load sounds if we don't have any yet
        if (Object.keys(this.sounds).length === 0) {
            this.loadSoundsFromAssetLoader();
        }

        if (this.isMuted || !this.sounds[soundId]) {
            console.log(`[AUDIO_MANAGER] Cannot play sound: ${soundId}`);
            return null;
        }
        
        // Clone the audio to allow multiple instances
        const sound = this.sounds[soundId].cloneNode();
        sound.volume = this.volume * volume;
        
        // Create sound instance object
        const soundInstance = {
            id: soundId,
            audio: sound
        };
        
        // Add to active sounds
        this.activeSounds.push(soundInstance);
        
        // Remove from active sounds when finished
        sound.onended = () => {
            const index = this.activeSounds.indexOf(soundInstance);
            if (index !== -1) {
                this.activeSounds.splice(index, 1);
            }
        };
        
        sound.play().catch(err => console.error(`Error playing sound ${soundId}:`, err));
        return soundInstance;
    }

    stopSound(soundInstance) {
        if (!soundInstance) return;
        
        soundInstance.audio.pause();
        soundInstance.audio.currentTime = 0;
        
        const index = this.activeSounds.indexOf(soundInstance);
        if (index !== -1) {
            this.activeSounds.splice(index, 1);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all active sounds
        this.activeSounds.forEach(sound => {
            sound.audio.volume = this.volume;
        });
        
        if (this.music) {
            this.music.volume = this.volume * 0.3;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        // Update mute state for all active sounds
        this.activeSounds.forEach(sound => {
            sound.audio.muted = this.isMuted;
        });
        
        if (this.music) {
            this.music.muted = this.isMuted;
        }
        
        return this.isMuted;
    }
}