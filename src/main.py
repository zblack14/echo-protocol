#!/usr/bin/env python3
"""
Echo Protocol - A text-based detective mystery game
Entry point for the game
"""

import sys
import time
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))


def boot_sequence():
    """Display the initial boot sequence when starting the game"""
    print("\n" + "="*50)
    print("INITIALIZING ECHO-7 NEURAL MATRIX...")
    time.sleep(1)
    print("LOADING MEMORY BANKS...")
    time.sleep(0.5)
    print("\n[WARNING] CRITICAL CORRUPTION DETECTED")
    print("[WARNING] MEMORY SECTORS 3, 7, 12 COMPROMISED")
    time.sleep(1)
    print("\n[SYSTEM] EMERGENCY DIAGNOSTIC MODE ACTIVATED")
    print("="*50 + "\n")
    time.sleep(1)


def main():
    """Main entry point for Echo Protocol"""
    try:
        boot_sequence()
        
        # Initialize and run game engine
        from game_engine import GameEngine
        game = GameEngine()
        game.run()
                
    except KeyboardInterrupt:
        print("\n\n[SYSTEM] EMERGENCY SHUTDOWN INITIATED")
        sys.exit(0)
    except Exception as e:
        print(f"\n[CRITICAL ERROR] {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()