import { MapStorage } from '../map-editor/storage/map-storage.js';
import { HighScoreManager } from './high-score-manager.js';

// Initialize managers
const mapStorage = new MapStorage();
const highScoreManager = new HighScoreManager();

// DOM elements
const mainMenu = document.getElementById('main-menu');
const playScreen = document.getElementById('play-screen');
const highscoreScreen = document.getElementById('highscore-screen');

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
function init() {
    // Load user data from localStorage
    loadUserData();
    
    // Load maps
    loadDefaultMaps();
    loadCustomMaps();
    
    // Set up event listeners
    setupEventListeners();
}

// Load user data from localStorage
function loadUserData() {
    const userData = localStorage.getItem('zombieLaneDefense_userData');
    if (userData) {
        const parsedData = JSON.parse(userData);
        usernameInput.value = parsedData.username || 'Rambo';
    }
}

// Save user data to localStorage
function saveUserData() {
    const userData = {
        username: usernameInput.value
    };
    localStorage.setItem('zombieLaneDefense_userData', JSON.stringify(userData));
}

// Load default maps from assets
async function loadDefaultMaps() {
    try {
        const response = await fetch('../assets/maps/default-maps.json');
        if (!response.ok) throw new Error('Failed to load default maps');
        
        const maps = await response.json();
        renderMapList(maps, defaultMapList, 'default');
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

// Initialize the application
init();