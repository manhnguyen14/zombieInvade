import { MapStorage } from '../map-editor/storage/map-storage.js';
import { HighScoreManager } from './high-score-manager.js';
import { ServiceLocator } from '../core/service-locator.js';
import { AudioManager } from '../core/audio-manager.js';
import { AssetLoader } from '../core/asset-loader.js';

// Initialize managers
const mapStorage = new MapStorage();
const highScoreManager = new HighScoreManager();

// DOM elements
const mainMenu = document.getElementById('main-menu');
const playScreen = document.getElementById('play-screen');
const highscoreScreen = document.getElementById('highscore-screen');
const soundSettingsButton = document.getElementById('sound-settings-button');
const soundSettingsScreen = document.getElementById('sound-settings-screen');
const masterVolumeSlider = document.getElementById('master-volume');
const masterVolumeValue = document.getElementById('master-volume-value');
const toggleMuteButton = document.getElementById('toggle-mute');
const backFromSoundButton = document.getElementById('back-from-sound');

const playButton = document.getElementById('play-button');
const editButton = document.getElementById('edit-button');
const highscoreButton = document.getElementById('highscore-button');

const usernameInput = document.getElementById('username');
const defaultMapList = document.getElementById('default-map-list');
const customMapList = document.getElementById('custom-map-list');
const playSelectedMapButton = document.getElementById('play-selected-map');

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

const backFromPlayButton = document.getElementById('back-from-play');
const backFromHighscoreButton = document.getElementById('back-from-highscore');

// State variables
let selectedMap = null;
let selectedMapType = 'default';

// Initialize the application
async function init() {
    try {
        // Initialize services in the correct order
        await initializeServices();
        
        // Load user data from localStorage
        loadUserData();
        
        // Load maps
        await loadDefaultMaps();
        loadCustomMaps();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize home screen:', error);
    }
}

// Initialize services
async function initializeServices() {
    // First, check if we already have the services
    let assetLoader, audioManager;
    
    // Try to get existing services or create new ones
    try {
        assetLoader = ServiceLocator.getService('assetLoader');
    } catch (e) {
        // Create asset loader if it doesn't exist
        console.log('Creating new AssetLoader instance');
        assetLoader = new AssetLoader();
        ServiceLocator.registerService('assetLoader', assetLoader);
    }
    
    // Wait for assets to load
    console.log('Waiting for assets to load...');
    await assetLoader.loadAssets();
    console.log('Assets loaded successfully');
    
    try {
        audioManager = ServiceLocator.getService('audioManager');
    } catch (e) {
        // Create audio manager if it doesn't exist
        console.log('Creating new AudioManager instance');
        audioManager = new AudioManager();
        ServiceLocator.registerService('audioManager', audioManager);
        
        // Initialize with empty sounds for now
        audioManager.initialize();
    }
    
    // Update audio manager with sounds from asset loader
    if (audioManager) {
        audioManager.loadSoundsFromAssetLoader();
    }
}

// Load user data from localStorage
function loadUserData() {
    const userData = localStorage.getItem('zombieLaneDefense_userData');
    if (userData) {
        const parsedData = JSON.parse(userData);
        usernameInput.value = parsedData.username || 'Rambo';
        
        // Initialize audio manager with saved settings
        let audioManager;
        try {
            audioManager = ServiceLocator.getService('audioManager');
            
            if (parsedData.hasOwnProperty('volume')) {
                const volume = parseFloat(parsedData.volume);
                audioManager.setVolume(volume);
                
                // Update UI if visible
                if (masterVolumeSlider) {
                    masterVolumeSlider.value = volume;
                    masterVolumeValue.textContent = `${Math.round(volume * 100)}%`;
                }
            }
            
            if (parsedData.hasOwnProperty('isMuted')) {
                if (parsedData.isMuted) {
                    audioManager.toggleMute();
                }
                
                // Update UI if visible
                updateMuteButtonUI();
            }
        } catch (e) {
            console.error('AudioManager not available yet:', e);
        }
    }
}

// Save user data to localStorage
function saveUserData() {
    const userData = {
        username: usernameInput.value
    };
    
    try {
        const audioManager = ServiceLocator.getService('audioManager');
        userData.volume = audioManager.volume;
        userData.isMuted = audioManager.isMuted;
    } catch (e) {
        console.error('AudioManager not available:', e);
    }
    
    localStorage.setItem('zombieLaneDefense_userData', JSON.stringify(userData));
}

// Load default maps from assets
async function loadDefaultMaps() {
    try {
        // Get the AssetLoader
        const assetLoader = ServiceLocator.getService('assetLoader');
        
        // Check if maps are loaded
        if (assetLoader && assetLoader.maps && assetLoader.maps.defaultMaps) {
            console.log('Default maps loaded from AssetLoader:', assetLoader.maps.defaultMaps);
            renderMapList(assetLoader.maps.defaultMaps, defaultMapList, 'default');
            return;
        }
        

    } catch (error) {
        console.error('Error loading default maps:', error);
        defaultMapList.innerHTML = '<p>Error loading default maps</p>';
    }
}

// Load custom maps from localStorage
function loadCustomMaps() {
    const customMaps = mapStorage.loadMaps();
    renderMapList(customMaps, customMapList, 'custom');
}

// Render map list
function renderMapList(maps, container, type) {
    container.innerHTML = '';
    
    if (!maps || maps.length === 0) {
        container.innerHTML = `<p>No ${type} maps available</p>`;
        return;
    }
    
    maps.forEach(map => {
        const mapItem = document.createElement('div');
        mapItem.className = 'map-item';
        mapItem.dataset.mapId = map.id || map.name;
        mapItem.dataset.mapType = type;
        mapItem.textContent = map.name;
        
        mapItem.addEventListener('click', () => {
            // Deselect all maps
            document.querySelectorAll('.map-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Select this map
            mapItem.classList.add('selected');
            selectedMap = map;
            selectedMapType = type;
        });
        
        container.appendChild(mapItem);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Main menu buttons
    playButton.addEventListener('click', () => {
        showScreen(playScreen);
    });
    
    editButton.addEventListener('click', () => {
        window.location.href = '../map-editor/index.html';
    });
    
    highscoreButton.addEventListener('click', () => {
        loadHighScores();
        showScreen(highscoreScreen);
    });
    
    // Back buttons
    backFromPlayButton.addEventListener('click', () => {
        showScreen(mainMenu);
    });
    
    backFromHighscoreButton.addEventListener('click', () => {
        showScreen(mainMenu);
    });
    
    // Tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate selected tab
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Play selected map button
    playSelectedMapButton.addEventListener('click', () => {
        if (!selectedMap) {
            alert('Please select a map first');
            return;
        }
        
        // Save username
        saveUserData();
        
        // Save selected map to localStorage for gameplay.js to use
        mapStorage.saveMapToLocalStorage(selectedMap, 'currentPlayMap');
        
        // Navigate to gameplay page
        window.location.href = 'gameplay.html';
    });

    // Sound settings button
    soundSettingsButton.addEventListener('click', () => {
        showScreen(soundSettingsScreen);
        updateSoundSettingsUI();
    });

    // Back from sound settings button
    backFromSoundButton.addEventListener('click', () => {
        showScreen(mainMenu);
    });

    // Master volume slider
    masterVolumeSlider.addEventListener('input', () => {
        const volume = parseFloat(masterVolumeSlider.value);
        masterVolumeValue.textContent = `${Math.round(volume * 100)}%`;
        
        const audioManager = ServiceLocator.getService('audioManager');
        if (audioManager) {
            audioManager.setVolume(volume);
            
            // Save to localStorage
            const userData = JSON.parse(localStorage.getItem('zombieLaneDefense_userData') || '{}');
            userData.volume = volume;
            localStorage.setItem('zombieLaneDefense_userData', JSON.stringify(userData));
            
            // If volume is increased from zero and was muted, unmute
            if (volume > 0 && audioManager.isMuted) {
                audioManager.toggleMute();
                updateMuteButtonUI();
            }
        }
    });

    // Toggle mute button
    toggleMuteButton.addEventListener('click', () => {
        const audioManager = ServiceLocator.getService('audioManager');
        if (audioManager) {
            const isMuted = audioManager.toggleMute();
            
            // Save to localStorage
            const userData = JSON.parse(localStorage.getItem('zombieLaneDefense_userData') || '{}');
            userData.isMuted = isMuted;
            localStorage.setItem('zombieLaneDefense_userData', JSON.stringify(userData));
            
            updateMuteButtonUI();
        }
    });
}

// Show a specific screen
function showScreen(screen) {
    // Hide all screens
    mainMenu.classList.add('hidden');
    playScreen.classList.add('hidden');
    highscoreScreen.classList.add('hidden');
    
    // Show the requested screen
    screen.classList.remove('hidden');
}

// Load high scores
function loadHighScores() {
    const highScores = highScoreManager.getHighScores();
    renderHighScores(highScores);
}

// Render high scores
function renderHighScores(highScores) {
    const tbody = document.getElementById('highscore-body');
    tbody.innerHTML = '';
    
    if (!highScores || highScores.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6">No high scores available</td>';
        tbody.appendChild(row);
        return;
    }
    
    // Sort by finish time (ascending)
    highScores.sort((a, b) => a.finishTime - b.finishTime);
    
    highScores.forEach(score => {
        const row = document.createElement('tr');
        
        const dateTime = new Date(score.timestamp);
        const formattedDateTime = dateTime.toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok', // GMT+7
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td>${score.mapName}</td>
            <td>${score.username}</td>
            <td>${score.finishTime}</td>
            <td>${score.enemiesKilled}</td>
            <td>${score.enemiesEscaped}</td>
            <td>${formattedDateTime}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Add this function to update the sound settings UI
function updateSoundSettingsUI() {
    try {
        const audioManager = ServiceLocator.getService('audioManager');
        // Update volume slider
        masterVolumeSlider.value = audioManager.volume;
        masterVolumeValue.textContent = `${Math.round(audioManager.volume * 100)}%`;
        
        // Update mute button
        updateMuteButtonUI();
    } catch (e) {
        console.error('AudioManager not available:', e);
    }
}

// Add this function to update the mute button UI
function updateMuteButtonUI() {
    try {
        const audioManager = ServiceLocator.getService('audioManager');
        toggleMuteButton.textContent = audioManager.isMuted ? 'Unmute' : 'Mute';
        toggleMuteButton.classList.toggle('muted', audioManager.isMuted);
    } catch (e) {
        console.error('AudioManager not available:', e);
    }
}

// Initialize the application when the page loads
window.addEventListener('load', () => {
    init();
});