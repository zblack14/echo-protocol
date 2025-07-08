// Memory Fragment class for Memory Drift

class MemoryFragment {
    constructor(x, y, size, corruptionLevel, colorScheme, patternSeed) {
        this.position = new Vector2(x, y);
        this.basePosition = new Vector2(x, y);
        this.size = size;
        this.corruptionLevel = corruptionLevel;
        this.colorScheme = colorScheme;
        this.patternSeed = patternSeed;
        
        // Visual properties
        this.rotation = Utils.random(0, Math.PI * 2);
        this.rotationSpeed = Utils.random(-0.5, 0.5);
        this.pulsePhase = Utils.random(0, Math.PI * 2);
        this.driftPhase = Utils.random(0, Math.PI * 2);
        
        // Healing properties
        this.healRate = 0.01;
        this.acceleratedHealRate = 0;
        
        // Generate pattern
        this.pattern = this.generatePattern();
    }
    
    generatePattern() {
        const patterns = ['geometric', 'organic', 'crystalline'];
        const patternType = patterns[Math.floor(Utils.seededRandom(this.patternSeed) * patterns.length)];
        
        return {
            type: patternType,
            points: this.generatePatternPoints(patternType)
        };
    }
    
    generatePatternPoints(patternType) {
        const points = [];
        
        switch (patternType) {
            case 'geometric':
                // Generate nested shapes
                for (let layer = 0; layer < 3; layer++) {
                    const sizeFactor = 1 - (layer * 0.3);
                    
                    if (layer % 2 === 0) {
                        // Hexagon
                        const hexPoints = [];
                        for (let i = 0; i < 6; i++) {
                            const angle = (Math.PI * 2 * i) / 6;
                            hexPoints.push({
                                x: this.size * sizeFactor * Math.cos(angle),
                                y: this.size * sizeFactor * Math.sin(angle)
                            });
                        }
                        points.push({ type: 'polygon', points: hexPoints, layer });
                    } else {
                        // Circle
                        points.push({
                            type: 'circle',
                            radius: this.size * sizeFactor,
                            layer
                        });
                    }
                }
                break;
                
            case 'organic':
                // Generate flowing curves
                for (let i = 0; i < 5; i++) {
                    const startAngle = (Math.PI * 2 * i) / 5;
                    const curvePoints = [];
                    
                    for (let t = 0; t < 20; t++) {
                        const angle = startAngle + (t / 20) * Math.PI;
                        const radius = this.size * (0.5 + 0.3 * Math.sin(t / 3));
                        curvePoints.push({
                            x: radius * Math.cos(angle),
                            y: radius * Math.sin(angle)
                        });
                    }
                    points.push({ type: 'curve', points: curvePoints, layer: i });
                }
                break;
                
            case 'crystalline':
                // Generate crystal structure
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8;
                    
                    // Radial lines
                    points.push({
                        type: 'line',
                        start: { x: 0, y: 0 },
                        end: {
                            x: this.size * Math.cos(angle),
                            y: this.size * Math.sin(angle)
                        },
                        layer: i
                    });
                    
                    // Connecting lines
                    const nextAngle = (Math.PI * 2 * ((i + 1) % 8)) / 8;
                    points.push({
                        type: 'line',
                        start: {
                            x: this.size * 0.7 * Math.cos(angle),
                            y: this.size * 0.7 * Math.sin(angle)
                        },
                        end: {
                            x: this.size * 0.7 * Math.cos(nextAngle),
                            y: this.size * 0.7 * Math.sin(nextAngle)
                        },
                        layer: i
                    });
                }
                break;
        }
        
        return points;
    }
    
    interpolateColor(t) {
        if (this.colorScheme.length === 1) {
            return this.colorScheme[0];
        }
        
        const segment = t * (this.colorScheme.length - 1);
        const index = Math.floor(segment);
        const fract = segment - index;
        
        if (index >= this.colorScheme.length - 1) {
            return this.colorScheme[this.colorScheme.length - 1];
        }
        
        const color1 = this.colorScheme[index];
        const color2 = this.colorScheme[index + 1];
        
        return Utils.interpolateColor(color1, color2, fract);
    }
    
    getCurrentColor() {
        const baseColor = this.colorScheme[0];
        
        if (this.corruptionLevel > 0) {
            // Desaturate and darken based on corruption
            const grayFactor = this.corruptionLevel;
            const brightnessFactor = 1 - (this.corruptionLevel * 0.7);
            
            let r = baseColor.r * brightnessFactor;
            let g = baseColor.g * brightnessFactor;
            let b = baseColor.b * brightnessFactor;
            
            // Mix with gray
            const gray = (r + g + b) / 3;
            r = r * (1 - grayFactor) + gray * grayFactor;
            g = g * (1 - grayFactor) + gray * grayFactor;
            b = b * (1 - grayFactor) + gray * grayFactor;
            
            return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
        }
        
        return baseColor;
    }
    
    update(deltaTime, mousePos, influenceRadius) {
        // Calculate mouse influence
        const distToMouse = this.position.distance(mousePos);
        const mouseInfluence = Math.max(0, 1 - (distToMouse / influenceRadius));
        
        // Drift animation
        this.driftPhase += deltaTime * 0.5;
        const driftX = Math.sin(this.driftPhase) * 10;
        const driftY = Math.cos(this.driftPhase * 0.7) * 10;
        
        // Apply drift with mouse influence
        this.position.x = this.basePosition.x + driftX * (1 - mouseInfluence * 0.5);
        this.position.y = this.basePosition.y + driftY * (1 - mouseInfluence * 0.5);
        
        // Rotation
        this.rotation += this.rotationSpeed * deltaTime * (1 + mouseInfluence);
        
        // Pulse animation
        this.pulsePhase += deltaTime * 2 * (1 + mouseInfluence);
        
        // Healing
        const totalHealRate = this.healRate + this.acceleratedHealRate;
        const adjustedHealRate = totalHealRate * (1 + mouseInfluence * 2);
        
        this.corruptionLevel = Math.max(0, this.corruptionLevel - adjustedHealRate * deltaTime);
        
        // Decay acceleration
        this.acceleratedHealRate *= 0.95;
    }
    
    accelerateHealing(amount) {
        this.acceleratedHealRate = Math.min(0.5, this.acceleratedHealRate + amount);
    }
    
    draw(ctx) {
        ctx.save();
        
        // Move to fragment position
        ctx.translate(this.position.x, this.position.y);
        
        // Apply rotation
        ctx.rotate(this.rotation);
        
        // Calculate current scale with pulse
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1 * (1 - this.corruptionLevel);
        ctx.scale(pulseScale, pulseScale);
        
        // Apply corruption effect (transparency)
        const alpha = 1 - (this.corruptionLevel * 0.8);
        ctx.globalAlpha = alpha;
        
        // Get current color
        const color = this.getCurrentColor();
        
        // Draw pattern
        this.drawPattern(ctx, color);
        
        // Draw healing glow when nearly healed
        if (this.corruptionLevel < 0.3) {
            this.drawHealingGlow(ctx, color);
        }
        
        ctx.restore();
    }
    
    drawPattern(ctx, color) {
        ctx.strokeStyle = Utils.colorToString(color);
        ctx.lineWidth = 2;
        
        this.pattern.points.forEach(element => {
            const layerColor = this.interpolateColor(element.layer / Math.max(1, this.pattern.points.length - 1));
            ctx.strokeStyle = Utils.colorToString(layerColor);
            
            switch (element.type) {
                case 'polygon':
                    this.drawPolygon(ctx, element.points);
                    break;
                case 'circle':
                    this.drawCircle(ctx, element.radius);
                    break;
                case 'curve':
                    this.drawCurve(ctx, element.points);
                    break;
                case 'line':
                    this.drawLine(ctx, element.start, element.end);
                    break;
            }
        });
    }
    
    drawPolygon(ctx, points) {
        if (points.length < 3) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    drawCircle(ctx, radius) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawCurve(ctx, points) {
        if (points.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }
    
    drawLine(ctx, start, end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
    
    drawHealingGlow(ctx, color) {
        const glowRadius = this.size * (1 + (0.3 - this.corruptionLevel));
        const glowAlpha = (0.3 - this.corruptionLevel) / 0.3;
        
        ctx.save();
        ctx.globalAlpha = glowAlpha * 0.5;
        ctx.strokeStyle = Utils.colorToString({
            r: Math.min(255, color.r + 100),
            g: Math.min(255, color.g + 100),
            b: Math.min(255, color.b + 100)
        });
        
        // Draw multiple glow circles
        for (let i = 0; i < 3; i++) {
            const radius = glowRadius - i * 5;
            if (radius > 0) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}