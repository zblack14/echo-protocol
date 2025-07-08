// Utility functions for Memory Drift

class Utils {
    static distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static interpolateColor(color1, color2, t) {
        return {
            r: Math.round(Utils.lerp(color1.r, color2.r, t)),
            g: Math.round(Utils.lerp(color1.g, color2.g, t)),
            b: Math.round(Utils.lerp(color1.b, color2.b, t)),
            a: Utils.lerp(color1.a || 1, color2.a || 1, t)
        };
    }
    
    static colorToString(color) {
        if (color.a !== undefined) {
            return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        }
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
    
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }
    
    static normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }
    
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Generate seeded random number
    static seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }
    
    // Simple noise function
    static noise(x, y, seed = 0) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
        return n - Math.floor(n);
    }
    
    // Save/Load utilities
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }
    
    static loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return defaultValue;
        }
    }
    
    // Performance monitoring
    static createFPSCounter() {
        let fps = 0;
        let frame = 0;
        let lastTime = performance.now();
        
        return {
            update: () => {
                frame++;
                const now = performance.now();
                if (now >= lastTime + 1000) {
                    fps = Math.round((frame * 1000) / (now - lastTime));
                    frame = 0;
                    lastTime = now;
                }
                return fps;
            },
            getFPS: () => fps
        };
    }
    
    // Screen size utilities
    static getCanvasSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }
    
    static resizeCanvas(canvas) {
        const size = Utils.getCanvasSize();
        canvas.width = size.width;
        canvas.height = size.height;
        return size;
    }
}

// Event emitter for game events
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }
    
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (e) {
                console.error(`Error in event handler for ${event}:`, e);
            }
        });
    }
    
    once(event, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Vector2 class for position calculations
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    
    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    
    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return this.divide(mag);
    }
    
    distance(v) {
        return this.subtract(v).magnitude();
    }
    
    angle() {
        return Math.atan2(this.y, this.x);
    }
    
    static fromAngle(angle, magnitude = 1) {
        return new Vector2(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }
    
    clone() {
        return new Vector2(this.x, this.y);
    }
}