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
        this.gravityWells = [];
        this.connections = [];
        this.targetPositions = [];
        
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
        
        // New mechanic: Create gravity wells to guide fragments
        this.createGravityWell(this.mousePos.x, this.mousePos.y);
    }
    
    createGravityWell(x, y) {
        // Add a temporary gravity well that attracts fragments
        const well = {
            position: new Vector2(x, y),
            strength: 500,
            lifetime: 3.0,
            maxLifetime: 3.0,
            radius: 100
        };
        
        if (!this.gravityWells) this.gravityWells = [];
        this.gravityWells.push(well);
        
        // Visual effect
        this.particleSystem.emit(x, y, 15, { r: 100, g: 200, b: 255 });
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
        this.gravityWells = [];
        this.connections = [];
        this.targetPositions = [];
        this.particleSystem.clear();
        
        // Generate memory fragments for this level
        const positions = this.generatePatternPositions(
            level.patternType,
            level.fragmentCount
        );
        
        // Create scattered fragments (start positions)
        const scatterPositions = this.generateScatteredPositions(level.fragmentCount);
        scatterPositions.forEach((pos, index) => {
            const fragment = new MemoryFragment(
                pos.x,
                pos.y,
                Utils.random(30, 60),
                1.0, // Start fully corrupted
                level.colorScheme,
                index
            );
            // Add physics properties
            fragment.velocity = new Vector2(0, 0);
            fragment.mass = 1.0;
            this.memoryFragments.push(fragment);
        });
        
        // Set target positions (where fragments should end up)
        this.targetPositions = positions;
        
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
    
    generateScatteredPositions(count) {
        // Generate random scattered starting positions
        const positions = [];
        const margin = 100;
        
        for (let i = 0; i < count; i++) {
            const x = Utils.random(margin, this.canvas.width - margin);
            const y = Utils.random(margin, this.canvas.height - margin);
            positions.push({ x, y });
        }
        
        return positions;
    }
    
    update(deltaTime) {
        if (this.state !== 'PLAYING') return;
        
        // Update gravity wells
        this.gravityWells = this.gravityWells.filter(well => {
            well.lifetime -= deltaTime;
            return well.lifetime > 0;
        });
        
        // Apply physics to fragments
        this.memoryFragments.forEach((fragment, index) => {
            // Apply gravity wells
            this.gravityWells.forEach(well => {
                const dist = fragment.position.distance(well.position);
                if (dist < well.radius && dist > 0) {
                    const force = well.strength / (dist * dist);
                    const direction = well.position.subtract(fragment.position).normalize();
                    fragment.velocity = fragment.velocity.add(direction.multiply(force * deltaTime));
                }
            });
            
            // Apply attraction to target position
            if (this.targetPositions[index]) {
                const target = new Vector2(this.targetPositions[index].x, this.targetPositions[index].y);
                const dist = fragment.position.distance(target);
                
                if (dist > 20) {
                    const direction = target.subtract(fragment.position).normalize();
                    const attraction = 50; // Weak natural attraction
                    fragment.velocity = fragment.velocity.add(direction.multiply(attraction * deltaTime));
                }
                
                // Heal fragment when near target
                if (dist < 50) {
                    fragment.corruptionLevel = Math.max(0, fragment.corruptionLevel - deltaTime * 0.5);
                    
                    // Add healing particles
                    if (Math.random() < 0.1) {
                        this.particleSystem.emit(
                            fragment.position.x, fragment.position.y,
                            3, fragment.getCurrentColor()
                        );
                    }
                }
            }
            
            // Apply velocity with damping
            fragment.position = fragment.position.add(fragment.velocity.multiply(deltaTime));
            fragment.velocity = fragment.velocity.multiply(0.95); // Damping
            
            // Keep fragments on screen
            fragment.position.x = Utils.clamp(fragment.position.x, 50, this.canvas.width - 50);
            fragment.position.y = Utils.clamp(fragment.position.y, 50, this.canvas.height - 50);
            
            // Update fragment animation
            fragment.update(deltaTime, this.mousePos, this.mouseInfluenceRadius);
        });
        
        // Check for connections between nearby healed fragments
        this.updateConnections();
        
        // Update particle system
        this.particleSystem.update(deltaTime);
        
        // Check level completion
        const allConnected = this.checkLevelCompletion();
        if (allConnected) {
            this.state = 'LEVEL_COMPLETE';
            this.emit('levelComplete', this.currentLevel);
        }
        
        // Emit progress update
        this.emit('progressUpdate', this.getProgress());
    }
    
    updateConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.memoryFragments.length; i++) {
            for (let j = i + 1; j < this.memoryFragments.length; j++) {
                const frag1 = this.memoryFragments[i];
                const frag2 = this.memoryFragments[j];
                const dist = frag1.position.distance(frag2.position);
                
                // Connect if both fragments are mostly healed and close together
                if (dist < 80 && frag1.corruptionLevel < 0.3 && frag2.corruptionLevel < 0.3) {
                    this.connections.push({ from: i, to: j, strength: 1 - Math.max(frag1.corruptionLevel, frag2.corruptionLevel) });
                }
            }
        }
    }
    
    checkLevelCompletion() {
        // Level complete when all fragments are connected in one network
        if (this.memoryFragments.length === 0) return false;
        
        const healedFragments = this.memoryFragments.filter(f => f.corruptionLevel < 0.3);
        if (healedFragments.length < this.memoryFragments.length) return false;
        
        // Check if all fragments are in one connected component
        const visited = new Set();
        const stack = [0];
        visited.add(0);
        
        while (stack.length > 0) {
            const current = stack.pop();
            
            this.connections.forEach(conn => {
                if (conn.from === current && !visited.has(conn.to)) {
                    visited.add(conn.to);
                    stack.push(conn.to);
                } else if (conn.to === current && !visited.has(conn.from)) {
                    visited.add(conn.from);
                    stack.push(conn.from);
                }
            });
        }
        
        return visited.size === this.memoryFragments.length;
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
        // Draw target positions (ghost outlines)
        this.drawTargetPositions();
        
        // Draw gravity wells
        this.drawGravityWells();
        
        // Draw connections between nearby fragments
        this.drawConnections();
        
        // Draw memory fragments
        this.memoryFragments.forEach(fragment => {
            fragment.draw(this.ctx);
        });
        
        // Draw particles
        this.particleSystem.draw(this.ctx);
    }
    
    drawTargetPositions() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(100, 200, 100, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.targetPositions.forEach(target => {
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, 30, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }
    
    drawGravityWells() {
        this.ctx.save();
        
        this.gravityWells.forEach(well => {
            const alpha = well.lifetime / well.maxLifetime;
            this.ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.8})`;
            this.ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.1})`;
            this.ctx.lineWidth = 3;
            
            // Draw well
            this.ctx.beginPath();
            this.ctx.arc(well.position.x, well.position.y, well.radius * alpha, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw center point
            this.ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(well.position.x, well.position.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.restore();
    }
    
    drawConnections() {
        // Draw the actual connections
        this.connections.forEach(conn => {
            const frag1 = this.memoryFragments[conn.from];
            const frag2 = this.memoryFragments[conn.to];
            
            const color = {
                r: 100,
                g: 255,
                b: 100
            };
            
            this.visualGenerator.drawConnectionLine(
                this.ctx,
                frag1.position,
                frag2.position,
                conn.strength,
                color
            );
        });
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
        
        // Progress based on healing (50%) + connections (50%)
        const healingProgress = this.memoryFragments.reduce((sum, fragment) => {
            return sum + (1 - fragment.corruptionLevel);
        }, 0) / this.memoryFragments.length;
        
        const maxConnections = (this.memoryFragments.length * (this.memoryFragments.length - 1)) / 2;
        const connectionProgress = maxConnections > 0 ? this.connections.length / maxConnections : 0;
        
        return (healingProgress * 0.5) + (connectionProgress * 0.5);
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