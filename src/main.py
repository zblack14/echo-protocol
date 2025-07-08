#!/usr/bin/env python3
"""
Memory Drift - A relaxing visual puzzle game
Main entry point
"""

import pygame
import sys
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from game import MemoryDriftGame


def main():
    """Initialize and run the game"""
    pygame.init()
    
    # Create game instance
    game = MemoryDriftGame()
    
    try:
        # Run the game
        game.run()
    except KeyboardInterrupt:
        print("\nGame interrupted")
    finally:
        pygame.quit()
        sys.exit(0)


if __name__ == "__main__":
    main()