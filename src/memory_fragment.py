"""
Memory Fragment - Visual representation of corrupted memories
"""

import pygame
import math
import random
from typing import Tuple, List


class MemoryFragment:
    """A single memory fragment that can be healed"""
    
    def __init__(self, x: float, y: float, size: int, corruption_level: float,
                 color_scheme: List[Tuple[int, int, int]], pattern_seed: int):
        self.x = x
        self.y = y
        self.base_x = x
        self.base_y = y
        self.size = size
        self.corruption_level = corruption_level
        self.color_scheme = color_scheme
        self.pattern_seed = pattern_seed
        
        # Visual properties
        self.rotation = random.random() * math.pi * 2
        self.rotation_speed = random.uniform(-0.5, 0.5)
        self.pulse_phase = random.random() * math.pi * 2
        self.drift_phase = random.random() * math.pi * 2
        
        # Healing properties
        self.heal_rate = 0.01
        self.accelerated_heal_rate = 0.0
        
        # Generate fragment surface
        self.surface = self._generate_fragment_surface()
        
    def _generate_fragment_surface(self) -> pygame.Surface:
        """Generate the visual representation of the fragment"""
        # Create a larger surface for the pattern
        surf_size = self.size * 2
        surface = pygame.Surface((surf_size, surf_size), pygame.SRCALPHA)
        
        # Generate pattern based on seed
        random.seed(self.pattern_seed)
        pattern_type = random.choice(['geometric', 'organic', 'crystalline'])
        
        if pattern_type == 'geometric':
            self._draw_geometric_pattern(surface)
        elif pattern_type == 'organic':
            self._draw_organic_pattern(surface)
        else:
            self._draw_crystalline_pattern(surface)
            
        random.seed()  # Reset random seed
        return surface
        
    def _draw_geometric_pattern(self, surface: pygame.Surface):
        """Draw geometric memory pattern"""
        center = surface.get_width() // 2
        
        # Draw nested shapes
        for i in range(3):
            size_factor = 1 - (i * 0.3)
            color = self._interpolate_color(i / 3)
            
            if i % 2 == 0:
                # Draw hexagon
                points = []
                for j in range(6):
                    angle = (math.pi * 2 * j) / 6
                    x = center + self.size * size_factor * math.cos(angle)
                    y = center + self.size * size_factor * math.sin(angle)
                    points.append((x, y))
                pygame.draw.polygon(surface, color, points, 2)
            else:
                # Draw circle
                pygame.draw.circle(surface, color, (center, center), 
                                 int(self.size * size_factor), 2)
                                 
    def _draw_organic_pattern(self, surface: pygame.Surface):
        """Draw organic memory pattern"""
        center = surface.get_width() // 2
        
        # Draw flowing curves
        for i in range(5):
            color = self._interpolate_color(i / 5)
            start_angle = (math.pi * 2 * i) / 5
            
            points = []
            for t in range(20):
                angle = start_angle + (t / 20) * math.pi
                radius = self.size * (0.5 + 0.3 * math.sin(t / 3))
                x = center + radius * math.cos(angle)
                y = center + radius * math.sin(angle)
                points.append((x, y))
                
            if len(points) > 1:
                pygame.draw.lines(surface, color, False, points, 2)
                
    def _draw_crystalline_pattern(self, surface: pygame.Surface):
        """Draw crystalline memory pattern"""
        center = surface.get_width() // 2
        
        # Draw crystal-like structure
        for i in range(8):
            color = self._interpolate_color(i / 8)
            angle = (math.pi * 2 * i) / 8
            
            # Draw lines from center
            end_x = center + self.size * math.cos(angle)
            end_y = center + self.size * math.sin(angle)
            pygame.draw.line(surface, color, (center, center), (end_x, end_y), 2)
            
            # Draw connecting lines
            next_angle = (math.pi * 2 * ((i + 1) % 8)) / 8
            next_x = center + self.size * 0.7 * math.cos(next_angle)
            next_y = center + self.size * 0.7 * math.sin(next_angle)
            
            mid_x = center + self.size * 0.7 * math.cos(angle)
            mid_y = center + self.size * 0.7 * math.sin(angle)
            
            pygame.draw.line(surface, color, (mid_x, mid_y), (next_x, next_y), 1)
            
    def _interpolate_color(self, t: float) -> Tuple[int, int, int]:
        """Interpolate between color scheme colors"""
        if len(self.color_scheme) == 1:
            return self.color_scheme[0]
            
        # Find which two colors to interpolate between
        segment = t * (len(self.color_scheme) - 1)
        index = int(segment)
        fract = segment - index
        
        if index >= len(self.color_scheme) - 1:
            return self.color_scheme[-1]
            
        color1 = self.color_scheme[index]
        color2 = self.color_scheme[index + 1]
        
        # Interpolate
        r = int(color1[0] + (color2[0] - color1[0]) * fract)
        g = int(color1[1] + (color2[1] - color1[1]) * fract)
        b = int(color1[2] + (color2[2] - color1[2]) * fract)
        
        return (r, g, b)
        
    def get_current_color(self) -> Tuple[int, int, int]:
        """Get current color based on corruption level"""
        # More corrupted = darker/grayer
        base_color = self.color_scheme[0]
        
        if self.corruption_level > 0:
            # Desaturate and darken based on corruption
            gray_factor = self.corruption_level
            brightness_factor = 1 - (self.corruption_level * 0.7)
            
            r = base_color[0] * brightness_factor
            g = base_color[1] * brightness_factor
            b = base_color[2] * brightness_factor
            
            # Mix with gray
            gray = (r + g + b) / 3
            r = r * (1 - gray_factor) + gray * gray_factor
            g = g * (1 - gray_factor) + gray * gray_factor
            b = b * (1 - gray_factor) + gray * gray_factor
            
            return (int(r), int(g), int(b))
        else:
            return base_color
            
    def update(self, dt: float, mouse_pos: Tuple[int, int], influence_radius: float):
        """Update fragment state"""
        # Calculate mouse influence
        dist_to_mouse = math.dist((self.x, self.y), mouse_pos)
        mouse_influence = max(0, 1 - (dist_to_mouse / influence_radius))
        
        # Drift animation
        self.drift_phase += dt * 0.5
        drift_x = math.sin(self.drift_phase) * 10
        drift_y = math.cos(self.drift_phase * 0.7) * 10
        
        # Apply drift with mouse influence
        self.x = self.base_x + drift_x * (1 - mouse_influence * 0.5)
        self.y = self.base_y + drift_y * (1 - mouse_influence * 0.5)
        
        # Rotation
        self.rotation += self.rotation_speed * dt * (1 + mouse_influence)
        
        # Pulse animation
        self.pulse_phase += dt * 2 * (1 + mouse_influence)
        
        # Healing
        total_heal_rate = self.heal_rate + self.accelerated_heal_rate
        total_heal_rate *= (1 + mouse_influence * 2)  # Mouse proximity speeds healing
        
        self.corruption_level = max(0, self.corruption_level - total_heal_rate * dt)
        
        # Decay acceleration
        self.accelerated_heal_rate *= 0.95
        
    def accelerate_healing(self, amount: float):
        """Temporarily increase healing rate"""
        self.accelerated_heal_rate = min(0.5, self.accelerated_heal_rate + amount)
        
    def draw(self, screen: pygame.Surface):
        """Draw the fragment"""
        # Calculate current size with pulse
        pulse_scale = 1 + math.sin(self.pulse_phase) * 0.1 * (1 - self.corruption_level)
        current_size = self.size * pulse_scale
        
        # Create rotated and scaled surface
        rotated_surface = pygame.transform.rotate(self.surface, math.degrees(self.rotation))
        scale_factor = current_size / self.size
        scaled_surface = pygame.transform.scale(
            rotated_surface,
            (int(rotated_surface.get_width() * scale_factor),
             int(rotated_surface.get_height() * scale_factor))
        )
        
        # Apply corruption effect (transparency)
        alpha = int(255 * (1 - self.corruption_level * 0.8))
        scaled_surface.set_alpha(alpha)
        
        # Apply color tint based on healing
        if self.corruption_level > 0:
            # Create overlay for corruption effect
            overlay = pygame.Surface(scaled_surface.get_size(), pygame.SRCALPHA)
            overlay.fill((*self.get_current_color(), alpha))
            scaled_surface.blit(overlay, (0, 0), special_flags=pygame.BLEND_MULT)
        
        # Draw centered at position
        rect = scaled_surface.get_rect(center=(int(self.x), int(self.y)))
        screen.blit(scaled_surface, rect)
        
        # Draw healing glow when nearly healed
        if self.corruption_level < 0.3:
            glow_radius = int(current_size * (1 + (0.3 - self.corruption_level)))
            glow_alpha = int(100 * (0.3 - self.corruption_level) / 0.3)
            glow_color = (*self.color_scheme[-1], glow_alpha)
            
            # Draw multiple circles for glow effect
            for i in range(3):
                radius = glow_radius - i * 5
                if radius > 0:
                    pygame.draw.circle(screen, glow_color[:3], 
                                     (int(self.x), int(self.y)), 
                                     radius, 1)