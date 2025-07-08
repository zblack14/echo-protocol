// Main Game Engine for Memory Drift

class GameEngine extends EventEmitter {
    constructor() {
        super();
        
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        
        // Game state
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, LEVEL_COMPLETE
        this.currentLevel = 0;
        this.mousePos = new Vector2(0, 0);
        this.mouseInfluenceRadius = 150;
        
        // Game systems
        this.particleSystem = new ParticleSystem();
        this.visualGenerator = new VisualGenerator();
        this.memoryFragments = [];
        
        // Level definitions
        this.levels = [
            {
                number: 1,
                fragmentCount: 5,
                baseCorruption: 0.8,
                patternType: 'circle',
                colorScheme: [
                    { r: 50, g: 100, b: 200 },
                    { r: 100, g: 150, b: 255 },
                    { r: 150, g: 200, b: 255 }
                ]
            },
            {
                number: 2,
                fragmentCount: 8,
                baseCorruption: 0.85,
                patternType: 'spiral',
                colorScheme: [
                    { r: 200, g: 50, b: 100 },
                    { r: 255, g: 100, b: 150 },
                    { r: 255, g: 150, b: 200 }
                ]
            },
            {
                number: 3,
                fragmentCount: 12,
                baseCorruption: 0.9,
                patternType: 'grid',
                colorScheme: [
                    { r: 50, g: 200, b: 100 },
                    { r: 100, g: 255, b: 150 },
                    { r: 150, g: 255, b: 200 }
                ]
            },
            {
                number: 4,
                fragmentCount: 15,
                baseCorruption: 0.9,
                patternType: 'constellation',
                colorScheme: [
                    { r: 150, g: 50, b: 200 },
                    { r: 200, g: 100, b: 255 },
                    { r: 225, g: 150, b: 255 }
                ]
            },
            {
                number: 5,
                fragmentCount: 20,
                baseCorruption: 0.95,
                patternType: 'mandala',
                colorScheme: [
                    { r: 200, g: 150, b: 50 },
                    { r: 255, g: 200, b: 100 },
                    { r: 255, g: 225, b: 150 }
                ]
            }
        ];
        
        // Performance monitoring
        this.fpsCounter = Utils.createFPSCounter();
        this.lastTime = 0;
        
        // Save data
        this.saveData = this.loadProgress();
    }
    
    initialize(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set up canvas
        this.resizeCanvas();
        
        // Generate background
        this.generateBackground();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load saved progress
        this.currentLevel = this.saveData.currentLevel || 0;
        
        console.log('Game engine initialized');
        this.emit('initialized');
    }
    
    resizeCanvas() {
        const size = Utils.resizeCanvas(this.canvas);
        this.generateBackground();
        return size;
    }
    
    generateBackground() {
        if (!this.canvas) return;
        this.visualGenerator.generateBackgroundTexture(this.canvas, 0);
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    handleClick(e) {
        if (this.state !== 'PLAYING') return;
        
        // Accelerate healing on click
        this.memoryFragments.forEach(fragment => {
            const dist = fragment.position.distance(this.mousePos);
            if (dist < this.mouseInfluenceRadius) {
                fragment.accelerateHealing(0.1);
                // Add particles
                this.particleSystem.emit(
                    fragment.position.x,
                    fragment.position.y,
                    10,
                    fragment.getCurrentColor()
                );
            }
        });
    }
    
    handleKeyDown(e) {
        switch (e.code) {
            case 'Escape':
                this.togglePause();
                break;
            case 'Space':
                if (this.state === 'LEVEL_COMPLETE') {
                    this.nextLevel();
                }
                break;
        }
    }
    
    startLevel(levelIndex) {
        if (levelIndex >= this.levels.length) {
            levelIndex = 0; // Loop back to first level
        }
        
        this.currentLevel = levelIndex;
        const level = this.levels[levelIndex];
        
        // Clear existing fragments and particles
        this.memoryFragments = [];
        this.particleSystem.clear();
        
        // Generate memory fragments for this level
        const positions = this.generatePatternPositions(
            level.patternType,
            level.fragmentCount
        );
        
        positions.forEach((pos, index) => {
            const fragment = new MemoryFragment(
                pos.x,
                pos.y,
                Utils.random(30, 60),
                level.baseCorruption,
                level.colorScheme,
                index
            );
            this.memoryFragments.push(fragment);
        });
        
        this.state = 'PLAYING';
        this.emit('levelStarted', levelIndex);
    }
    
    generatePatternPositions(patternType, count) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        switch (patternType) {
            case 'circle':
                const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
                return this.visualGenerator.generateCirclePattern(count, centerX, centerY, radius);
                
            case 'spiral':
                return this.visualGenerator.generateSpiralPattern(count, centerX, centerY);
                
            case 'grid':
                return this.visualGenerator.generateGridPattern(count, this.canvas.width, this.canvas.height);
                
            case 'constellation':
                return this.visualGenerator.generateConstellationPattern(count, this.canvas.width, this.canvas.height);
                
            case 'mandala':
                return this.visualGenerator.generateMandalaPattern(count, centerX, centerY);
                
            default:
                return this.visualGenerator.generateCirclePattern(count, centerX, centerY, 200);
        }
    }
    
    update(deltaTime) {
        if (this.state !== 'PLAYING') return;
        
        // Update memory fragments
        let allHealed = true;
        this.memoryFragments.forEach(fragment => {
            fragment.update(deltaTime, this.mousePos, this.mouseInfluenceRadius);
            if (fragment.corruptionLevel > 0.1) {
                allHealed = false;
            }
        });
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        // Check level completion
        if (allHealed && this.memoryFragments.length > 0) {
            this.state = 'LEVEL_COMPLETE';
            this.emit('levelComplete', this.currentLevel);
        }
        
        // Emit progress update
        this.emit('progressUpdate', this.getProgress());
    }
    
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas with background
        this.generateBackground();
        
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.drawGame();
        }
        
        // Update FPS
        this.fpsCounter.update();
    }
    
    drawGame() {
        // Draw connections between nearby fragments
        this.drawConnections();
        
        // Draw memory fragments
        this.memoryFragments.forEach(fragment => {
            fragment.draw(this.ctx);
        });
        
        // Draw particles
        this.particleSystem.draw(this.ctx);
        
        // Draw mouse influence area (if playing)
        if (this.state === 'PLAYING') {
            this.drawMouseInfluence();
        }
    }
    
    drawConnections() {
        for (let i = 0; i < this.memoryFragments.length; i++) {
            for (let j = i + 1; j < this.memoryFragments.length; j++) {
                const frag1 = this.memoryFragments[i];
                const frag2 = this.memoryFragments[j];
                const dist = frag1.position.distance(frag2.position);
                
                if (dist < 200) {
                    // Connection strength based on healing progress
                    const strength = (2 - frag1.corruptionLevel - frag2.corruptionLevel) / 2;
                    
                    if (strength > 0.2) {
                        const color = {
                            r: 50,
                            g: 100,
                            b: 150
                        };
                        
                        this.visualGenerator.drawConnectionLine(
                            this.ctx,
                            frag1.position,
                            frag2.position,
                            strength,
                            color
                        );
                    }
                }
            }
        }
    }
    
    drawMouseInfluence() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(100, 181, 246, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.mousePos.x, this.mousePos.y, this.mouseInfluenceRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    getProgress() {
        if (this.memoryFragments.length === 0) return 0;
        
        const level = this.levels[this.currentLevel];
        const totalCorruption = this.memoryFragments.reduce(
            (sum, fragment) => sum + fragment.corruptionLevel, 0
        );
        const maxCorruption = this.memoryFragments.length * level.baseCorruption;
        
        return 1 - (totalCorruption / maxCorruption);
    }
    
    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.emit('paused');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.emit('resumed');
        }
    }
    
    nextLevel() {
        this.currentLevel++;
        this.saveProgress();
        this.startLevel(this.currentLevel);
    }
    
    restartLevel() {
        this.startLevel(this.currentLevel);
    }
    
    returnToMenu() {
        this.state = 'MENU';
        this.memoryFragments = [];
        this.particleSystem.clear();
        this.emit('returnedToMenu');
    }
    
    // Save/Load system
    saveProgress() {
        const data = {
            currentLevel: this.currentLevel,
            timestamp: Date.now()
        };
        Utils.saveToLocalStorage('memoryDriftProgress', data);
        this.saveData = data;
    }
    
    loadProgress() {
        return Utils.loadFromLocalStorage('memoryDriftProgress', {
            currentLevel: 0,
            timestamp: 0
        });
    }
    
    // Game loop
    start() {
        if (this.running) return;
        
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.running = false;
    }
    
    gameLoop() {
        if (!this.running) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = now;
        
        // Update
        this.update(deltaTime);
        
        // Draw
        this.draw();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
}