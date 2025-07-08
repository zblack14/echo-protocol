// Particle System for Memory Drift

class Particle {
    constructor(x, y, color) {
        this.position = new Vector2(x, y);
        this.velocity = Vector2.fromAngle(
            Utils.random(0, Math.PI * 2),
            Utils.random(20, 80)
        );
        this.color = color;
        this.lifetime = Utils.random(0.5, 1.5);
        this.maxLifetime = this.lifetime;
        this.size = Utils.random(2, 5);
        this.alpha = 1;
    }
    
    update(deltaTime) {
        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // Apply slight upward drift
        this.velocity.y -= 20 * deltaTime;
        
        // Apply drag
        this.velocity = this.velocity.multiply(0.98);
        
        // Update lifetime
        this.lifetime -= deltaTime;
        this.alpha = this.lifetime / this.maxLifetime;
        
        return this.lifetime > 0;
    }
    
    draw(ctx) {
        if (this.alpha <= 0) return;
        
        const currentSize = this.size * this.alpha;
        
        // Save context
        ctx.save();
        
        // Set global alpha
        ctx.globalAlpha = this.alpha;
        
        // Draw glow effect
        for (let i = 0; i < 3; i++) {
            const glowSize = currentSize * (3 - i);
            const glowAlpha = this.alpha * (0.3 / (i + 1));
            
            ctx.globalAlpha = glowAlpha;
            ctx.fillStyle = `rgb(${Math.min(255, this.color.r + 50)}, ${Math.min(255, this.color.g + 50)}, ${Math.min(255, this.color.b + 50)})`;
            
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw core
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = Utils.colorToString(this.color);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Restore context
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }
    
    emit(x, y, count = 5, color = { r: 255, g: 255, b: 255 }) {
        for (let i = 0; i < count; i++) {
            // Add position variance
            const px = x + Utils.random(-10, 10);
            const py = y + Utils.random(-10, 10);
            
            // Add color variance
            const colorVariance = 20;
            const variedColor = {
                r: Utils.clamp(color.r + Utils.random(-colorVariance, colorVariance), 0, 255),
                g: Utils.clamp(color.g + Utils.random(-colorVariance, colorVariance), 0, 255),
                b: Utils.clamp(color.b + Utils.random(-colorVariance, colorVariance), 0, 255)
            };
            
            this.particles.push(new Particle(px, py, variedColor));
        }
        
        // Limit particle count
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
    }
    
    update(deltaTime) {
        // Update particles and remove dead ones
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }
    
    draw(ctx) {
        // Use additive blending for glow effect
        const oldCompositeOperation = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'lighter';
        
        this.particles.forEach(particle => {
            particle.draw(ctx);
        });
        
        // Restore composite operation
        ctx.globalCompositeOperation = oldCompositeOperation;
    }
    
    clear() {
        this.particles = [];
    }
    
    getActiveCount() {
        return this.particles.length;
    }
}