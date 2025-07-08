"""
Particle System - Visual effects for memory healing
"""

import pygame
import random
import math
from typing import List, Tuple


class Particle:
    """Individual particle for visual effects"""
    
    def __init__(self, x: float, y: float, color: Tuple[int, int, int]):
        self.x = x
        self.y = y
        self.color = color
        
        # Random velocity
        angle = random.random() * math.pi * 2
        speed = random.uniform(20, 80)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        
        # Properties
        self.lifetime = random.uniform(0.5, 1.5)
        self.max_lifetime = self.lifetime
        self.size = random.uniform(2, 5)
        
    def update(self, dt: float) -> bool:
        """Update particle position and lifetime. Returns False when dead."""
        self.x += self.vx * dt
        self.y += self.vy * dt
        
        # Apply some gravity/float effect
        self.vy += -20 * dt  # Slight upward float
        
        # Fade out
        self.lifetime -= dt
        
        # Slow down
        self.vx *= 0.98
        self.vy *= 0.98
        
        return self.lifetime > 0
        
    def draw(self, screen: pygame.Surface):
        """Draw the particle"""
        # Calculate alpha based on lifetime
        alpha = self.lifetime / self.max_lifetime
        
        # Draw with fade
        if alpha > 0:
            # Calculate current size
            current_size = self.size * alpha
            
            # Draw glow effect
            for i in range(3):
                glow_size = current_size * (3 - i)
                glow_alpha = alpha * (0.3 / (i + 1))
                glow_color = (
                    min(255, self.color[0] + 50),
                    min(255, self.color[1] + 50),
                    min(255, self.color[2] + 50)
                )
                
                if glow_size > 0:
                    pygame.draw.circle(
                        screen,
                        glow_color,
                        (int(self.x), int(self.y)),
                        int(glow_size),
                        0
                    )
            
            # Draw core
            pygame.draw.circle(
                screen,
                self.color,
                (int(self.x), int(self.y)),
                int(current_size),
                0
            )


class ParticleSystem:
    """Manages all particles in the game"""
    
    def __init__(self, screen_width: int, screen_height: int):
        self.particles: List[Particle] = []
        self.screen_width = screen_width
        self.screen_height = screen_height
        
    def emit(self, x: float, y: float, count: int = 5, 
             color: Tuple[int, int, int] = (255, 255, 255)):
        """Emit new particles at a position"""
        for _ in range(count):
            # Add some position variance
            px = x + random.uniform(-10, 10)
            py = y + random.uniform(-10, 10)
            
            # Vary the color slightly
            color_variance = 20
            varied_color = (
                max(0, min(255, color[0] + random.randint(-color_variance, color_variance))),
                max(0, min(255, color[1] + random.randint(-color_variance, color_variance))),
                max(0, min(255, color[2] + random.randint(-color_variance, color_variance)))
            )
            
            self.particles.append(Particle(px, py, varied_color))
            
    def update(self, dt: float):
        """Update all particles"""
        # Update particles and remove dead ones
        self.particles = [p for p in self.particles if p.update(dt)]
        
        # Limit total particles to prevent performance issues
        if len(self.particles) > 500:
            self.particles = self.particles[-500:]
            
    def draw(self, screen: pygame.Surface):
        """Draw all particles"""
        # Create a temporary surface for additive blending
        temp_surface = pygame.Surface((self.screen_width, self.screen_height))
        temp_surface.fill((0, 0, 0))
        
        # Draw particles to temp surface
        for particle in self.particles:
            particle.draw(temp_surface)
            
        # Blit with additive blending for glow effect
        screen.blit(temp_surface, (0, 0), special_flags=pygame.BLEND_ADD)
        
    def clear(self):
        """Remove all particles"""
        self.particles.clear()
        
    def active_count(self) -> int:
        """Get number of active particles"""
        return len(self.particles)