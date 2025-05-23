/**
 * High Score Manager
 * Handles saving and loading high scores
 */
export class HighScoreManager {
    constructor() {
        this.localStorageKey = 'zombieLaneDefense_highScores';
        this.maxScoresPerMap = 10; // Maximum number of scores to keep per map
    }
    
    // Get all high scores
    getHighScores() {
        const scoresJson = localStorage.getItem(this.localStorageKey);
        return scoresJson ? JSON.parse(scoresJson) : [];
    }
    
    // Save high scores
    saveHighScores(scores) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(scores));
    }
    
    // Add a new high score
    addHighScore(score) {
        if (!score.mapName || !score.username || !score.finishTime) {
            console.error('Invalid high score data:', score);
            return false;
        }
        
        // Add timestamp if not provided
        if (!score.timestamp) {
            score.timestamp = new Date().toISOString();
        }
        
        // Get existing scores
        const scores = this.getHighScores();
        
        // Add new score
        scores.push(score);
        
        // Sort scores by finish time (ascending)
        scores.sort((a, b) => a.finishTime - b.finishTime);
        
        // Keep only the top scores per map
        const mapScores = {};
        const filteredScores = [];
        
        for (const score of scores) {
            const mapName = score.mapName;
            
            if (!mapScores[mapName]) {
                mapScores[mapName] = 0;
            }
            
            if (mapScores[mapName] < this.maxScoresPerMap) {
                filteredScores.push(score);
                mapScores[mapName]++;
            }
        }
        
        // Save filtered scores
        this.saveHighScores(filteredScores);
        return true;
    }
    
    // Get high scores for a specific map
    getMapHighScores(mapName) {
        const scores = this.getHighScores();
        return scores.filter(score => score.mapName === mapName)
            .sort((a, b) => a.finishTime - b.finishTime);
    }
}