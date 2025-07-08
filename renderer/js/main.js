// Main application entry point for Memory Drift

class MemoryDriftApp {
    constructor() {
        this.game = new GameEngine();
        this.canvas = null;
        this.ui = {};
        this.currentScreen = 'loading';
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    initialize() {
        console.log('Initializing Memory Drift...');
        
        // Get DOM elements
        this.canvas = document.getElementById('game-canvas');
        this.ui = this.getUIElements();
        
        // Initialize game engine
        this.game.initialize(this.canvas);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Hide loading screen and show menu
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showScreen('main-menu');
        }, 1500);
        
        // Start game loop
        this.game.start();
        
        console.log('Memory Drift initialized successfully');
    }
    
    getUIElements() {
        return {
            // Screens
            loadingScreen: document.getElementById('loading-screen'),
            mainMenu: document.getElementById('main-menu'),
            gameHud: document.getElementById('game-hud'),
            pauseMenu: document.getElementById('pause-menu'),
            levelComplete: document.getElementById('level-complete'),
            controlsScreen: document.getElementById('controls-screen'),
            aboutScreen: document.getElementById('about-screen'),
            
            // Buttons
            startGame: document.getElementById('start-game'),
            continueGame: document.getElementById('continue-game'),
            showControls: document.getElementById('show-controls'),
            showAbout: document.getElementById('show-about'),
            pauseGame: document.getElementById('pause-game'),
            resumeGame: document.getElementById('resume-game'),
            restartLevel: document.getElementById('restart-level'),
            mainMenuBtn: document.getElementById('main-menu-btn'),
            nextLevel: document.getElementById('next-level'),
            replayLevel: document.getElementById('replay-level'),
            closeControls: document.getElementById('close-controls'),
            closeAbout: document.getElementById('close-about'),
            
            // Game UI
            levelText: document.getElementById('level-text'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            mouseInfluence: document.getElementById('mouse-influence'),
            completionMessage: document.getElementById('completion-message')
        };
    }
    
    setupEventListeners() {
        // Menu buttons
        this.ui.startGame.addEventListener('click', () => this.startNewGame());
        this.ui.continueGame.addEventListener('click', () => this.continueGame());
        this.ui.showControls.addEventListener('click', () => this.showScreen('controls-screen'));
        this.ui.showAbout.addEventListener('click', () => this.showScreen('about-screen'));
        
        // Game controls
        this.ui.pauseGame.addEventListener('click', () => this.game.togglePause());
        this.ui.resumeGame.addEventListener('click', () => this.game.togglePause());
        this.ui.restartLevel.addEventListener('click', () => this.game.restartLevel());
        this.ui.mainMenuBtn.addEventListener('click', () => this.returnToMenu());
        
        // Level complete
        this.ui.nextLevel.addEventListener('click', () => this.game.nextLevel());
        this.ui.replayLevel.addEventListener('click', () => this.game.restartLevel());
        
        // Close buttons
        this.ui.closeControls.addEventListener('click', () => this.showScreen('main-menu'));
        this.ui.closeAbout.addEventListener('click', () => this.showScreen('main-menu'));
        
        // Mouse tracking for influence indicator
        this.canvas.addEventListener('mousemove', (e) => this.updateMouseInfluence(e));
        this.canvas.addEventListener('mouseleave', () => this.hideMouseInfluence());
        
        // Game engine events
        this.game.on('levelStarted', (level) => this.onLevelStarted(level));
        this.game.on('levelComplete', (level) => this.onLevelComplete(level));
        this.game.on('paused', () => this.onGamePaused());
        this.game.on('resumed', () => this.onGameResumed());
        this.game.on('progressUpdate', (progress) => this.updateProgress(progress));
        this.game.on('returnedToMenu', () => this.returnToMenu());
        
        // Check for saved progress
        this.checkSavedProgress();
    }
    
    hideLoadingScreen() {
        this.ui.loadingScreen.classList.add('hidden');
        setTimeout(() => {
            this.ui.loadingScreen.style.display = 'none';
        }, 500);
    }
    
    showScreen(screenId) {
        // Hide all screens
        Object.values(this.ui).forEach(element => {
            if (element && element.classList && element.classList.contains('screen')) {
                element.style.display = 'none';
            }
        });
        
        // Show target screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'flex';
            this.currentScreen = screenId;
        }
    }
    
    startNewGame() {
        this.game.currentLevel = 0;
        this.game.saveProgress();
        this.game.startLevel(0);
        this.showScreen('game-hud');
    }
    
    continueGame() {
        this.game.startLevel(this.game.currentLevel);
        this.showScreen('game-hud');
    }
    
    returnToMenu() {
        this.game.returnToMenu();
        this.showScreen('main-menu');
    }
    
    checkSavedProgress() {
        const progress = this.game.saveData;
        if (progress && progress.currentLevel > 0) {
            this.ui.continueGame.style.display = 'block';
        }
    }
    
    updateMouseInfluence(e) {
        if (this.game.state !== 'PLAYING') {
            this.hideMouseInfluence();
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ui.mouseInfluence.style.left = x + 'px';
        this.ui.mouseInfluence.style.top = y + 'px';
        this.ui.mouseInfluence.classList.add('visible');
    }
    
    hideMouseInfluence() {
        this.ui.mouseInfluence.classList.remove('visible');
    }
    
    // Game event handlers
    onLevelStarted(level) {
        this.ui.levelText.textContent = `Memory ${level + 1}`;
        this.updateProgress(0);
        this.showScreen('game-hud');
    }
    
    onLevelComplete(level) {
        const levelData = this.game.levels[level];
        const messages = [
            "The fragments have reconnected.",
            "Memory pathways restored.",
            "Neural networks synchronized.",
            "Data integrity achieved.",
            "Consciousness patterns stabilized."
        ];
        
        this.ui.completionMessage.textContent = messages[level % messages.length];
        
        // Hide next level button if this is the last level
        if (level >= this.game.levels.length - 1) {
            this.ui.nextLevel.textContent = 'Restart Journey';
        } else {
            this.ui.nextLevel.textContent = 'Continue';
        }
        
        this.showScreen('level-complete');
    }
    
    onGamePaused() {
        this.showScreen('pause-menu');
        this.hideMouseInfluence();
    }
    
    onGameResumed() {
        this.showScreen('game-hud');
    }
    
    updateProgress(progress) {
        const percentage = Math.round(progress * 100);
        this.ui.progressFill.style.width = percentage + '%';
        this.ui.progressText.textContent = `Restoration: ${percentage}%`;
    }
}

// Initialize the application
const app = new MemoryDriftApp();

// Handle Electron menu events (if running in Electron)
if (typeof window !== 'undefined' && window.electronAPI) {
    window.electronAPI.onMenuEvent('new-game', () => {
        app.startNewGame();
    });
    
    window.electronAPI.onMenuEvent('restart-level', () => {
        app.game.restartLevel();
    });
    
    window.electronAPI.onMenuEvent('about', () => {
        app.showScreen('about-screen');
    });
    
    window.electronAPI.onMenuEvent('controls', () => {
        app.showScreen('controls-screen');
    });
}

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Memory Drift Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Memory Drift Unhandled Promise Rejection:', e.reason);
});

// Export for debugging
window.MemoryDrift = {
    app: app,
    game: app.game
};