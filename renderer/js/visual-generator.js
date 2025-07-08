// Visual Generator for Memory Drift

class VisualGenerator {
    constructor() {
        this.noiseCache = new Map();
    }
    
    generateBackgroundTexture(canvas, seed = 0) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        // Add noise points
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let i = 0; i < 1000; i++) {
            const x = Math.floor(Utils.seededRandom(seed + i) * width);
            const y = Math.floor(Utils.seededRandom(seed + i + 1000) * height);
            const brightness = Math.floor(Utils.seededRandom(seed + i + 2000) * 30);
            
            const index = (y * width + x) * 4;
            if (index >= 0 && index < data.length - 3) {
                data[index] = brightness;     // R
                data[index + 1] = brightness; // G
                data[index + 2] = brightness + 10; // B
                data[index + 3] = 255; // A
            }
        }
        
        // Add subtle gradient
        for (let y = 0; y < height; y += 5) {
            const gradientStrength = Math.floor(20 * (y / height));
            for (let x = 0; x < width; x += 10) {
                const index = (y * width + x) * 4;
                if (index >= 0 && index < data.length - 3) {
                    data[index] = 10 + gradientStrength;     // R
                    data[index + 1] = 10 + gradientStrength; // G
                    data[index + 2] = 15 + gradientStrength; // B
                    data[index + 3] = 255; // A
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    drawConnectionLine(ctx, start, end, strength, color) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length < 1) return;
        
        const lineWidth = Math.max(1, strength * 5);
        
        ctx.save();
        ctx.strokeStyle = Utils.colorToString({
            ...color,
            a: strength
        });
        ctx.lineWidth = lineWidth;
        
        // Add slight wave effect
        const segments = Math.floor(length / 10);
        if (segments > 1) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const x = Utils.lerp(start.x, end.x, t);
                const y = Utils.lerp(start.y, end.y, t);
                
                // Add wave
                const waveOffset = Math.sin(t * Math.PI * 2) * 2 * strength;
                const perpX = -dy / length;
                const perpY = dx / length;
                
                ctx.lineTo(x + perpX * waveOffset, y + perpY * waveOffset);
            }
            
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawMemoryAura(ctx, x, y, size, color, intensity) {
        ctx.save();
        
        // Draw multiple layers of glow
        for (let layer = 0; layer < 5; layer++) {
            const radius = size - layer * (size / 6);
            if (radius <= 0) break;
            
            const alpha = (intensity * 0.6) / (layer + 1);
            
            ctx.strokeStyle = Utils.colorToString({
                r: Math.min(255, color.r + 50),
                g: Math.min(255, color.g + 50),
                b: Math.min(255, color.b + 50),
                a: alpha
            });
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    drawHealingEffect(ctx, x, y, progress, color) {
        ctx.save();
        
        const size = 50;
        
        // Draw expanding rings
        for (let i = 0; i < 3; i++) {
            const ringProgress = (progress + i * 0.3) % 1.0;
            const radius = ringProgress * size;
            const alpha = 1 - ringProgress;
            
            if (radius > 0) {
                ctx.strokeStyle = Utils.colorToString({
                    ...color,
                    a: alpha
                });
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Draw healing particles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + progress * Math.PI;
            const particleX = x + Math.cos(angle) * 30;
            const particleY = y + Math.sin(angle) * 30;
            
            ctx.fillStyle = Utils.colorToString({
                ...color,
                a: 1 - progress
            });
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawLevelTransition(ctx, width, height, progress) {
        ctx.save();
        
        // Create wave effect
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgba(100, 150, 255, 0)`);
        gradient.addColorStop(progress, `rgba(100, 150, 255, ${progress * 0.8})`);
        gradient.addColorStop(1, `rgba(100, 150, 255, ${progress})`);
        
        ctx.fillStyle = gradient;
        
        // Draw wave
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 10) {
            const waveHeight = Math.sin(x * 0.02 + progress * Math.PI * 2) * 50;
            const y = height / 2 + waveHeight;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    generateNoiseTexture(width, height, scale = 0.1) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // Simple noise function
                let noiseVal = Math.sin(x * scale) * Math.sin(y * scale);
                noiseVal += Math.sin(x * scale * 2) * Math.sin(y * scale * 2) * 0.5;
                noiseVal += Math.sin(x * scale * 4) * Math.sin(y * scale * 4) * 0.25;
                
                // Normalize to 0-1
                noiseVal = (noiseVal + 1.875) / 3.75;
                
                // Convert to grayscale
                const gray = Math.floor(noiseVal * 255);
                const index = (y * width + x) * 4;
                
                data[index] = gray;     // R
                data[index + 1] = gray; // G
                data[index + 2] = gray; // B
                data[index + 3] = 255;  // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
    
    // Pattern generation utilities
    generateCirclePattern(count, centerX, centerY, radius) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            const angle = (2 * Math.PI * i) / count;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.push({ x, y });
        }
        return positions;
    }
    
    generateSpiralPattern(count, centerX, centerY) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            const angle = (2 * Math.PI * i) / 5;
            const radius = 50 + i * 25;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.push({ x, y });
        }
        return positions;
    }
    
    generateGridPattern(count, width, height) {
        const positions = [];
        const gridSize = Math.ceil(Math.sqrt(count));
        const spacingX = width / (gridSize + 1);
        const spacingY = height / (gridSize + 1);
        
        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = (col + 1) * spacingX;
            const y = (row + 1) * spacingY;
            positions.push({ x, y });
        }
        return positions;
    }
    
    generateConstellationPattern(count, width, height) {
        const positions = [];
        const margin = 100;
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let x, y;
            
            do {
                x = Utils.random(margin, width - margin);
                y = Utils.random(margin, height - margin);
                attempts++;
            } while (attempts < 50 && positions.some(pos => 
                Utils.distance(pos, { x, y }) < 80
            ));
            
            positions.push({ x, y });
        }
        return positions;
    }
    
    generateMandalaPattern(count, centerX, centerY) {
        const positions = [];
        const rings = 3;
        const itemsPerRing = Math.ceil(count / rings);
        
        for (let i = 0; i < count; i++) {
            const ring = Math.floor(i / itemsPerRing);
            const radius = 80 + ring * 80;
            const angleStep = (2 * Math.PI) / itemsPerRing;
            const angle = (i % itemsPerRing) * angleStep;
            
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            positions.push({ x, y });
        }
        return positions;
    }
}