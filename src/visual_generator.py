"""
Visual Generator - Creates procedural visual elements
"""

import pygame
import math
import random
from typing import List, Tuple
# Commenting out PIL and numpy for now to avoid dependencies
# from PIL import Image, ImageDraw, ImageFilter
# import numpy as np


class VisualGenerator:
    """Generates procedural visual elements for the game"""
    
    def __init__(self):
        self.noise_cache = {}
        
    def generate_background_texture(self, width: int, height: int, 
                                  seed: int = 0) -> pygame.Surface:
        """Generate a subtle background texture"""
        # Create pygame surface directly
        surface = pygame.Surface((width, height))
        surface.fill((10, 10, 15))
        
        random.seed(seed)
        
        # Add noise points
        for _ in range(1000):
            x = random.randint(0, width - 1)
            y = random.randint(0, height - 1)
            brightness = random.randint(0, 30)
            color = (brightness, brightness, brightness + 10)
            surface.set_at((x, y), color)
            
        # Add subtle gradient
        for y in range(0, height, 5):
            gradient_strength = int(20 * (y / height))
            for x in range(0, width, 10):
                color = (
                    10 + gradient_strength,
                    10 + gradient_strength,
                    15 + gradient_strength
                )
                if x < width and y < height:
                    surface.set_at((x, y), color)
        
        random.seed()
        return surface
        
    def generate_connection_line(self, start: Tuple[int, int], end: Tuple[int, int],
                               strength: float, color: Tuple[int, int, int]) -> pygame.Surface:
        """Generate a stylized connection line between two points"""
        # Calculate line dimensions
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        length = math.sqrt(dx * dx + dy * dy)
        
        if length < 1:
            return pygame.Surface((1, 1))
        
        # Create surface for the line
        line_width = max(1, int(strength * 5))
        surface = pygame.Surface((int(length) + line_width * 2, line_width * 2 + 10), 
                                pygame.SRCALPHA)
        
        # Draw the line with gradient
        center_y = surface.get_height() // 2
        
        for x in range(int(length)):
            # Calculate line intensity (stronger in middle)
            intensity = 1 - abs(x - length/2) / (length/2)
            intensity = max(0.2, intensity)
            
            # Draw vertical line segment
            for y in range(line_width):
                alpha = int(255 * strength * intensity)
                pixel_color = (*color, alpha)
                
                # Add slight wave effect
                wave_y = center_y + int(math.sin(x * 0.1) * 2)
                if 0 <= wave_y + y < surface.get_height():
                    surface.set_at((x, wave_y + y - line_width//2), pixel_color)
        
        return surface
        
    def generate_memory_aura(self, size: int, color: Tuple[int, int, int], 
                           intensity: float) -> pygame.Surface:
        """Generate a glowing aura around memory fragments"""
        surface = pygame.Surface((size * 2, size * 2), pygame.SRCALPHA)
        center = size
        
        # Generate multiple layers of glow
        for layer in range(5):
            radius = size - layer * (size // 6)
            if radius <= 0:
                break
                
            # Calculate alpha for this layer
            alpha = int(intensity * 60 / (layer + 1))
            
            # Create glow color
            glow_color = (
                min(255, color[0] + 50),
                min(255, color[1] + 50),
                min(255, color[2] + 50),
                alpha
            )
            
            # Draw the glow ring
            pygame.draw.circle(surface, glow_color, (center, center), radius, 2)
            
        return surface
        
    def generate_healing_effect(self, x: int, y: int, progress: float,
                              color: Tuple[int, int, int]) -> pygame.Surface:
        """Generate visual effect for healing process"""
        size = 100
        surface = pygame.Surface((size, size), pygame.SRCALPHA)
        center = size // 2
        
        # Draw expanding rings
        for i in range(3):
            ring_progress = (progress + i * 0.3) % 1.0
            radius = int(ring_progress * center)
            alpha = int(255 * (1 - ring_progress))
            
            if radius > 0:
                ring_color = (*color, alpha)
                pygame.draw.circle(surface, ring_color, (center, center), radius, 2)
        
        # Draw healing particles
        for i in range(8):
            angle = (math.pi * 2 * i) / 8 + progress * math.pi
            particle_x = center + int(math.cos(angle) * 30)
            particle_y = center + int(math.sin(angle) * 30)
            
            particle_color = (*color, int(255 * (1 - progress)))
            pygame.draw.circle(surface, particle_color, (particle_x, particle_y), 3)
            
        return surface
        
    def generate_level_transition(self, width: int, height: int, 
                                progress: float) -> pygame.Surface:
        """Generate transition effect between levels"""
        surface = pygame.Surface((width, height), pygame.SRCALPHA)
        
        # Create wave effect
        for x in range(width):
            wave_height = int(math.sin(x * 0.02 + progress * math.pi * 2) * 50)
            start_y = height // 2 + wave_height
            
            for y in range(start_y, height):
                distance = y - start_y
                alpha = max(0, int(255 * (1 - distance / 100) * progress))
                
                if alpha > 0:
                    color = (100, 150, 255, alpha)
                    surface.set_at((x, y), color)
        
        return surface
        
    def generate_noise_texture(self, width: int, height: int, 
                             scale: float = 0.1) -> pygame.Surface:
        """Generate Perlin-like noise texture"""
        surface = pygame.Surface((width, height))
        
        for x in range(width):
            for y in range(height):
                # Simple noise function
                noise_val = math.sin(x * scale) * math.sin(y * scale)
                noise_val += math.sin(x * scale * 2) * math.sin(y * scale * 2) * 0.5
                noise_val += math.sin(x * scale * 4) * math.sin(y * scale * 4) * 0.25
                
                # Normalize to 0-1
                noise_val = (noise_val + 1.875) / 3.75
                
                # Convert to grayscale
                gray = int(noise_val * 255)
                surface.set_at((x, y), (gray, gray, gray))
        
        return surface