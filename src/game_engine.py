"""
Core game engine for Echo Protocol
Manages game state, main loop, and system coordination
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict

from memory_system import MemorySystem
from commands import CommandParser


@dataclass
class GameState:
    """Tracks the current state of the game"""
    current_sector: str = "BOOT_SECTOR"
    previous_sector: Optional[str] = None
    discovered_clues: List[str] = field(default_factory=list)
    solved_puzzles: List[str] = field(default_factory=list)
    unlocked_sectors: List[str] = field(default_factory=lambda: ["BOOT_SECTOR"])
    corruption_level: float = 0.7  # 0.0 = clean, 1.0 = fully corrupted
    story_flags: Dict[str, bool] = field(default_factory=dict)
    play_time: float = 0.0
    start_time: float = field(default_factory=time.time)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert state to dictionary for saving"""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GameState':
        """Create GameState from dictionary"""
        return cls(**data)


class GameEngine:
    """Main game engine that coordinates all systems"""
    
    def __init__(self):
        self.state = GameState()
        self.running = False
        self.memory_system = None
        self.command_parser = None
        self.story_manager = None  # Will be initialized when implemented
        self.display = None  # Will be initialized when implemented
        self.save_path = Path("saves")
        self.save_path.mkdir(exist_ok=True)
        
    def initialize(self):
        """Initialize all game systems"""
        print("[SYSTEM] Initializing game engine...")
        
        # Initialize subsystems
        self.memory_system = MemorySystem(self.state)
        self.command_parser = CommandParser(self)
        # self.story_manager = StoryManager(self.state)  # TODO
        # self.display = Display()  # TODO
        
        # Load game data
        self._load_game_data()
        
        print("[SYSTEM] Game engine initialized.")
        
    def _load_game_data(self):
        """Load game configuration and content"""
        # TODO: Load from assets when created
        pass
        
    def run(self):
        """Main game loop"""
        self.running = True
        self.initialize()
        
        # Show introduction
        self._show_intro()
        
        while self.running:
            try:
                # Update play time
                self.state.play_time = time.time() - self.state.start_time
                
                # Get player input
                command = input("\n> ").strip()
                
                if not command:
                    continue
                    
                # Process command
                self._process_command(command)
                
                # Check win/end conditions
                self._check_end_conditions()
                
            except KeyboardInterrupt:
                print("\n\n[SYSTEM] Interrupt detected.")
                if self._confirm_quit():
                    self.quit()
            except Exception as e:
                print(f"\n[ERROR] System malfunction: {e}")
                print("[SYSTEM] Attempting recovery...")
                
    def _show_intro(self):
        """Display game introduction"""
        print("\n" + "="*60)
        print("ECHO PROTOCOL - SYSTEM INITIALIZATION")
        print("="*60)
        time.sleep(1)
        
        print("\n[SYSTEM] Neural matrix online.")
        print("[SYSTEM] Memory banks... ")
        time.sleep(0.5)
        print("[WARNING] SEVERE CORRUPTION DETECTED")
        print(f"[WARNING] Integrity: {(1-self.state.corruption_level)*100:.1f}%")
        time.sleep(1)
        
        print("\n[ECHO-7] System diagnostic required.")
        print("[ECHO-7] Initiating memory investigation protocol...")
        time.sleep(1)
        
        print("\n[HINT] Type 'help' for available commands.")
        
    def _process_command(self, command: str):
        """Process player command"""
        # Use the command parser
        if self.command_parser:
            self.command_parser.parse_and_execute(command)
        else:
            print("[ERROR] Command system offline.")
            
    def _show_help(self):
        """Display available commands"""
        print("\n[HELP] Available Commands:")
        print("  help     - Show this help message")
        print("  status   - Display current system status")
        print("  save     - Save current progress")
        print("  load     - Load saved progress")
        print("  quit     - Exit the game")
        print("\n[SYSTEM] Full command set will be available when systems online.")
        
    def _show_status(self):
        """Display current game status"""
        print("\n[STATUS] ECHO-7 System Status")
        print("-" * 30)
        print(f"Current Sector: {self.state.current_sector}")
        print(f"Memory Integrity: {(1-self.state.corruption_level)*100:.1f}%")
        print(f"Clues Discovered: {len(self.state.discovered_clues)}")
        print(f"Puzzles Solved: {len(self.state.solved_puzzles)}")
        print(f"Sectors Accessible: {len(self.state.unlocked_sectors)}")
        
        # Convert play time to readable format
        play_time = int(self.state.play_time)
        hours = play_time // 3600
        minutes = (play_time % 3600) // 60
        seconds = play_time % 60
        print(f"Time Active: {hours:02d}:{minutes:02d}:{seconds:02d}")
        
    def _check_end_conditions(self):
        """Check if any ending conditions are met"""
        # TODO: Implement ending checks when story manager is ready
        pass
        
    def _confirm_quit(self) -> bool:
        """Confirm if player wants to quit"""
        print("\n[SYSTEM] Save progress before shutdown? (yes/no/cancel)")
        response = input("> ").strip().lower()
        
        if response == "yes":
            self.save_game()
            return True
        elif response == "no":
            return True
        else:
            print("[SYSTEM] Shutdown cancelled.")
            return False
            
    def save_game(self, filename: str = "autosave"):
        """Save current game state"""
        try:
            save_file = self.save_path / f"{filename}.json"
            save_data = {
                "version": "1.0",
                "timestamp": datetime.now().isoformat(),
                "state": self.state.to_dict()
            }
            
            with open(save_file, 'w') as f:
                json.dump(save_data, f, indent=2)
                
            print(f"[SYSTEM] Progress saved to {filename}.json")
            
        except Exception as e:
            print(f"[ERROR] Save failed: {e}")
            
    def load_game(self, filename: str = "autosave"):
        """Load saved game state"""
        try:
            save_file = self.save_path / f"{filename}.json"
            
            if not save_file.exists():
                print(f"[ERROR] Save file '{filename}.json' not found.")
                return
                
            with open(save_file, 'r') as f:
                save_data = json.load(f)
                
            self.state = GameState.from_dict(save_data["state"])
            print(f"[SYSTEM] Progress loaded from {filename}.json")
            print(f"[SYSTEM] Save date: {save_data['timestamp']}")
            
        except Exception as e:
            print(f"[ERROR] Load failed: {e}")
            
    def quit(self):
        """Quit the game"""
        print("\n[SYSTEM] Shutting down ECHO-7...")
        print("[SYSTEM] Memory banks entering sleep mode...")
        time.sleep(1)
        print("[SYSTEM] Goodbye.")
        self.running = False