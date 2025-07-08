"""
Memory Drift - Main game class
Handles game loop, rendering, and state management
"""

import pygame
import random
import math
import json
from pathlib import Path
from typing import List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

from memory_fragment import MemoryFragment
from particle_system import ParticleSystem
from visual_generator import VisualGenerator


class GameState(Enum):
    MENU = "menu"
    PLAYING = "playing"
    PAUSED = "paused"
    LEVEL_COMPLETE = "level_complete"


@dataclass
class Level:
    """Represents a game level"""
    number: int
    fragment_count: int
    base_corruption: float
    pattern_type: str
    color_scheme: List[Tuple[int, int, int]]
    completion_threshold: float = 0.9


class MemoryDriftGame:
    """Main game class"""
    
    def __init__(self, width: int = 1280, height: int = 720):
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Memory Drift")
        
        self.clock = pygame.time.Clock()
        self.running = True
        self.state = GameState.MENU
        
        # Game components
        self.visual_generator = VisualGenerator()
        self.particle_system = ParticleSystem(width, height)
        self.memory_fragments: List[MemoryFragment] = []
        
        # Current level
        self.current_level = 0
        self.levels = self._create_levels()
        
        # Mouse tracking
        self.mouse_pos = (width // 2, height // 2)
        self.mouse_influence_radius = 150
        
        # Colors
        self.bg_color = (10, 10, 15)
        self.ui_color = (200, 200, 200)
        
        # Fonts
        pygame.font.init()
        self.title_font = pygame.font.Font(None, 72)
        self.menu_font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
        
        # Save data
        self.save_path = Path("saves")
        self.save_path.mkdir(exist_ok=True)
        self.load_progress()
        
    def _create_levels(self) -> List[Level]:
        """Create level definitions"""
        return [
            Level(
                number=1,
                fragment_count=5,
                base_corruption=0.8,
                pattern_type="circle",
                color_scheme=[(50, 100, 200), (100, 150, 255), (150, 200, 255)]
            ),
            Level(
                number=2,
                fragment_count=8,
                base_corruption=0.85,
                pattern_type="spiral",
                color_scheme=[(200, 50, 100), (255, 100, 150), (255, 150, 200)]
            ),
            Level(
                number=3,
                fragment_count=12,
                base_corruption=0.9,
                pattern_type="grid",
                color_scheme=[(50, 200, 100), (100, 255, 150), (150, 255, 200)]
            ),
            Level(
                number=4,
                fragment_count=15,
                base_corruption=0.9,
                pattern_type="constellation",
                color_scheme=[(150, 50, 200), (200, 100, 255), (225, 150, 255)]
            ),
            Level(
                number=5,
                fragment_count=20,
                base_corruption=0.95,
                pattern_type="mandala",
                color_scheme=[(200, 150, 50), (255, 200, 100), (255, 225, 150)]
            )
        ]
        
    def load_progress(self):
        """Load saved game progress"""
        save_file = self.save_path / "progress.json"
        if save_file.exists():
            try:
                with open(save_file, 'r') as f:
                    data = json.load(f)
                    self.current_level = data.get("current_level", 0)
            except:
                pass
                
    def save_progress(self):
        """Save game progress"""
        save_file = self.save_path / "progress.json"
        data = {
            "current_level": self.current_level
        }
        with open(save_file, 'w') as f:
            json.dump(data, f)
            
    def start_level(self, level_index: int):
        """Initialize a new level"""
        if level_index >= len(self.levels):
            level_index = 0  # Loop back to first level
            
        self.current_level = level_index
        level = self.levels[level_index]
        
        # Clear existing fragments
        self.memory_fragments.clear()
        self.particle_system.clear()
        
        # Generate memory fragments for this level
        pattern_positions = self._generate_pattern_positions(
            level.pattern_type, 
            level.fragment_count
        )
        
        for i, pos in enumerate(pattern_positions):
            fragment = MemoryFragment(
                x=pos[0],
                y=pos[1],
                size=random.randint(30, 60),
                corruption_level=level.base_corruption,
                color_scheme=level.color_scheme,
                pattern_seed=i
            )
            self.memory_fragments.append(fragment)
            
        self.state = GameState.PLAYING
        
    def _generate_pattern_positions(self, pattern_type: str, count: int) -> List[Tuple[float, float]]:
        """Generate positions based on pattern type"""
        positions = []
        center_x = self.width // 2
        center_y = self.height // 2
        
        if pattern_type == "circle":
            radius = min(self.width, self.height) * 0.3
            for i in range(count):
                angle = (2 * math.pi * i) / count
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                positions.append((x, y))
                
        elif pattern_type == "spiral":
            for i in range(count):
                angle = (2 * math.pi * i) / 5
                radius = 50 + i * 25
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                positions.append((x, y))
                
        elif pattern_type == "grid":
            grid_size = int(math.sqrt(count)) + 1
            spacing = min(self.width, self.height) / (grid_size + 1)
            
            for i in range(count):
                row = i // grid_size
                col = i % grid_size
                x = (col + 1) * spacing + (self.width - spacing * grid_size) / 2
                y = (row + 1) * spacing + (self.height - spacing * grid_size) / 2
                positions.append((x, y))
                
        elif pattern_type == "constellation":
            # Random but aesthetically pleasing positions
            margin = 100
            for i in range(count):
                x = random.randint(margin, self.width - margin)
                y = random.randint(margin, self.height - margin)
                # Ensure minimum distance from other fragments
                while any(math.dist((x, y), pos) < 80 for pos in positions):
                    x = random.randint(margin, self.width - margin)
                    y = random.randint(margin, self.height - margin)
                positions.append((x, y))
                
        elif pattern_type == "mandala":
            # Concentric circles
            rings = 3
            for i in range(count):
                ring = i % rings
                radius = 80 + ring * 80
                angle = (2 * math.pi * i) / (count // rings)
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                positions.append((x, y))
                
        return positions
        
    def handle_input(self, events: List[pygame.event.Event]):
        """Handle user input"""
        for event in events:
            if event.type == pygame.QUIT:
                self.running = False
                
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if self.state == GameState.PLAYING:
                        self.state = GameState.PAUSED
                    elif self.state == GameState.PAUSED:
                        self.state = GameState.PLAYING
                    elif self.state == GameState.MENU:
                        self.running = False
                        
                elif event.key == pygame.K_SPACE:
                    if self.state == GameState.MENU:
                        self.start_level(self.current_level)
                    elif self.state == GameState.LEVEL_COMPLETE:
                        self.current_level += 1
                        self.save_progress()
                        self.start_level(self.current_level)
                        
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:  # Left click
                    if self.state == GameState.PLAYING:
                        # Accelerate healing on click
                        for fragment in self.memory_fragments:
                            dist = math.dist(self.mouse_pos, (fragment.x, fragment.y))
                            if dist < self.mouse_influence_radius:
                                fragment.accelerate_healing(0.1)
                                # Add particles
                                self.particle_system.emit(
                                    fragment.x, fragment.y,
                                    count=10,
                                    color=fragment.get_current_color()
                                )
                                
        # Track mouse position
        self.mouse_pos = pygame.mouse.get_pos()
        
    def update(self, dt: float):
        """Update game state"""
        if self.state == GameState.PLAYING:
            # Update memory fragments
            all_healed = True
            for fragment in self.memory_fragments:
                fragment.update(dt, self.mouse_pos, self.mouse_influence_radius)
                if fragment.corruption_level > 0.1:
                    all_healed = False
                    
            # Update particles
            self.particle_system.update(dt)
            
            # Check level completion
            if all_healed:
                self.state = GameState.LEVEL_COMPLETE
                
    def draw(self):
        """Render the game"""
        self.screen.fill(self.bg_color)
        
        if self.state == GameState.MENU:
            self._draw_menu()
        elif self.state == GameState.PLAYING:
            self._draw_game()
        elif self.state == GameState.PAUSED:
            self._draw_game()
            self._draw_pause_overlay()
        elif self.state == GameState.LEVEL_COMPLETE:
            self._draw_game()
            self._draw_complete_overlay()
            
        pygame.display.flip()
        
    def _draw_menu(self):
        """Draw main menu"""
        # Title
        title_text = self.title_font.render("Memory Drift", True, self.ui_color)
        title_rect = title_text.get_rect(center=(self.width // 2, self.height // 3))
        self.screen.blit(title_text, title_rect)
        
        # Instructions
        instructions = [
            "Help the AI restore its memories",
            "Move your mouse to influence memory fragments",
            "Click to accelerate healing",
            "",
            "Press SPACE to begin",
            "Press ESC to quit"
        ]
        
        y_offset = self.height // 2
        for line in instructions:
            text = self.menu_font.render(line, True, self.ui_color)
            text_rect = text.get_rect(center=(self.width // 2, y_offset))
            self.screen.blit(text, text_rect)
            y_offset += 40
            
    def _draw_game(self):
        """Draw the game world"""
        # Draw connections between nearby fragments
        for i, frag1 in enumerate(self.memory_fragments):
            for frag2 in self.memory_fragments[i+1:]:
                dist = math.dist((frag1.x, frag1.y), (frag2.x, frag2.y))
                if dist < 200:
                    # Connection strength based on healing progress
                    strength = (2 - frag1.corruption_level - frag2.corruption_level) / 2
                    if strength > 0.2:
                        color = (
                            int(50 * strength),
                            int(100 * strength),
                            int(150 * strength)
                        )
                        pygame.draw.line(
                            self.screen,
                            color,
                            (frag1.x, frag1.y),
                            (frag2.x, frag2.y),
                            max(1, int(3 * strength))
                        )
        
        # Draw memory fragments
        for fragment in self.memory_fragments:
            fragment.draw(self.screen)
            
        # Draw particles
        self.particle_system.draw(self.screen)
        
        # Draw mouse influence area
        if self.state == GameState.PLAYING:
            pygame.draw.circle(
                self.screen,
                (50, 50, 100),
                self.mouse_pos,
                self.mouse_influence_radius,
                1
            )
            
        # Draw progress
        level = self.levels[self.current_level]
        total_corruption = sum(f.corruption_level for f in self.memory_fragments)
        progress = 1 - (total_corruption / (len(self.memory_fragments) * level.base_corruption))
        
        # Progress bar
        bar_width = 300
        bar_height = 20
        bar_x = (self.width - bar_width) // 2
        bar_y = self.height - 50
        
        pygame.draw.rect(self.screen, (50, 50, 50), (bar_x, bar_y, bar_width, bar_height))
        pygame.draw.rect(self.screen, (100, 200, 100), (bar_x, bar_y, int(bar_width * progress), bar_height))
        
        # Level indicator
        level_text = self.small_font.render(f"Memory {self.current_level + 1}", True, self.ui_color)
        level_rect = level_text.get_rect(center=(self.width // 2, bar_y - 20))
        self.screen.blit(level_text, level_rect)
        
    def _draw_pause_overlay(self):
        """Draw pause screen overlay"""
        # Darken screen
        overlay = pygame.Surface((self.width, self.height))
        overlay.set_alpha(128)
        overlay.fill((0, 0, 0))
        self.screen.blit(overlay, (0, 0))
        
        # Pause text
        pause_text = self.title_font.render("PAUSED", True, self.ui_color)
        pause_rect = pause_text.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(pause_text, pause_rect)
        
        # Resume hint
        resume_text = self.menu_font.render("Press ESC to resume", True, self.ui_color)
        resume_rect = resume_text.get_rect(center=(self.width // 2, self.height // 2 + 80))
        self.screen.blit(resume_text, resume_rect)
        
    def _draw_complete_overlay(self):
        """Draw level complete overlay"""
        # Lighten screen
        overlay = pygame.Surface((self.width, self.height))
        overlay.set_alpha(64)
        overlay.fill((255, 255, 255))
        self.screen.blit(overlay, (0, 0))
        
        # Complete text
        complete_text = self.title_font.render("Memory Restored!", True, (100, 255, 100))
        complete_rect = complete_text.get_rect(center=(self.width // 2, self.height // 2))
        self.screen.blit(complete_text, complete_rect)
        
        # Continue hint
        continue_text = self.menu_font.render("Press SPACE to continue", True, self.ui_color)
        continue_rect = continue_text.get_rect(center=(self.width // 2, self.height // 2 + 80))
        self.screen.blit(continue_text, continue_rect)
        
    def run(self):
        """Main game loop"""
        dt = 0
        
        while self.running:
            # Handle events
            events = pygame.event.get()
            self.handle_input(events)
            
            # Update
            self.update(dt)
            
            # Draw
            self.draw()
            
            # Control frame rate
            dt = self.clock.tick(60) / 1000.0  # Convert to seconds