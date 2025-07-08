"""
Command parser and handler for Echo Protocol
Processes player input and executes game commands
"""

import re
from typing import Dict, List, Tuple, Callable, Optional, Any
from dataclasses import dataclass


@dataclass
class Command:
    """Represents a game command"""
    name: str
    aliases: List[str]
    description: str
    usage: str
    handler: Callable
    requires_args: bool = False
    min_args: int = 0
    max_args: Optional[int] = None


class CommandParser:
    """Parses and executes player commands"""
    
    def __init__(self, game_engine):
        self.engine = game_engine
        self.commands: Dict[str, Command] = {}
        self.command_history: List[str] = []
        self._register_commands()
        
    def _register_commands(self):
        """Register all available commands"""
        commands_to_register = [
            Command(
                name="help",
                aliases=["h", "?", "commands"],
                description="Display available commands",
                usage="help [command]",
                handler=self._cmd_help
            ),
            Command(
                name="scan",
                aliases=["s", "look", "examine"],
                description="Scan current memory sector",
                usage="scan",
                handler=self._cmd_scan
            ),
            Command(
                name="navigate",
                aliases=["nav", "go", "move"],
                description="Navigate to another memory sector",
                usage="navigate <sector>",
                handler=self._cmd_navigate,
                requires_args=True,
                min_args=1,
                max_args=1
            ),
            Command(
                name="read",
                aliases=["r", "view", "display"],
                description="Read a memory fragment",
                usage="read <fragment_id>",
                handler=self._cmd_read,
                requires_args=True,
                min_args=1,
                max_args=1
            ),
            Command(
                name="list",
                aliases=["ls", "fragments"],
                description="List available memory fragments",
                usage="list",
                handler=self._cmd_list
            ),
            Command(
                name="analyze",
                aliases=["a", "inspect"],
                description="Analyze evidence and connections",
                usage="analyze [item]",
                handler=self._cmd_analyze
            ),
            Command(
                name="decode",
                aliases=["d", "decrypt"],
                description="Attempt to decode encrypted data",
                usage="decode <data>",
                handler=self._cmd_decode,
                requires_args=True,
                min_args=1
            ),
            Command(
                name="status",
                aliases=["stat", "info"],
                description="Display system status",
                usage="status",
                handler=self._cmd_status
            ),
            Command(
                name="inventory",
                aliases=["inv", "clues"],
                description="Show discovered clues",
                usage="inventory",
                handler=self._cmd_inventory
            ),
            Command(
                name="save",
                aliases=["save"],
                description="Save game progress",
                usage="save [filename]",
                handler=self._cmd_save
            ),
            Command(
                name="load",
                aliases=["load"],
                description="Load saved game",
                usage="load [filename]",
                handler=self._cmd_load
            ),
            Command(
                name="quit",
                aliases=["exit", "q"],
                description="Exit the game",
                usage="quit",
                handler=self._cmd_quit
            ),
            Command(
                name="unlock",
                aliases=["u", "open"],
                description="Attempt to unlock a sector",
                usage="unlock <sector> <key>",
                handler=self._cmd_unlock,
                requires_args=True,
                min_args=2,
                max_args=2
            ),
            Command(
                name="history",
                aliases=["hist"],
                description="Show command history",
                usage="history",
                handler=self._cmd_history
            )
        ]
        
        # Register all commands and aliases
        for cmd in commands_to_register:
            self.commands[cmd.name] = cmd
            for alias in cmd.aliases:
                self.commands[alias] = cmd
                
    def parse_and_execute(self, input_text: str) -> None:
        """Parse and execute a command"""
        if not input_text.strip():
            return
            
        # Add to history
        self.command_history.append(input_text)
        if len(self.command_history) > 50:  # Keep last 50 commands
            self.command_history.pop(0)
            
        # Split into command and arguments
        parts = input_text.strip().split(maxsplit=1)
        cmd_name = parts[0].lower()
        args_text = parts[1] if len(parts) > 1 else ""
        
        # Find command
        if cmd_name not in self.commands:
            # Try fuzzy matching for typos
            suggestion = self._find_similar_command(cmd_name)
            if suggestion:
                print(f"[ERROR] Unknown command: '{cmd_name}'. Did you mean '{suggestion}'?")
            else:
                print(f"[ERROR] Unknown command: '{cmd_name}'. Type 'help' for available commands.")
            return
            
        command = self.commands[cmd_name]
        
        # Parse arguments if needed
        if command.requires_args:
            args = self._parse_arguments(args_text)
            if len(args) < command.min_args:
                print(f"[ERROR] Not enough arguments. Usage: {command.usage}")
                return
            if command.max_args and len(args) > command.max_args:
                print(f"[ERROR] Too many arguments. Usage: {command.usage}")
                return
            command.handler(args)
        else:
            # Pass args anyway for optional argument commands
            args = self._parse_arguments(args_text) if args_text else []
            command.handler(args)
            
    def _parse_arguments(self, args_text: str) -> List[str]:
        """Parse command arguments, handling quoted strings"""
        if not args_text:
            return []
            
        # Handle quoted arguments
        args = []
        current_arg = ""
        in_quotes = False
        
        for char in args_text:
            if char == '"' and not in_quotes:
                in_quotes = True
            elif char == '"' and in_quotes:
                in_quotes = False
                if current_arg:
                    args.append(current_arg)
                    current_arg = ""
            elif char == ' ' and not in_quotes:
                if current_arg:
                    args.append(current_arg)
                    current_arg = ""
            else:
                current_arg += char
                
        if current_arg:
            args.append(current_arg)
            
        return args
        
    def _find_similar_command(self, input_cmd: str) -> Optional[str]:
        """Find similar command for typo correction"""
        # Simple edit distance check
        for cmd_name in self.commands:
            if len(cmd_name) > 2 and abs(len(cmd_name) - len(input_cmd)) <= 2:
                # Check if most characters match
                matches = sum(1 for a, b in zip(input_cmd, cmd_name) if a == b)
                if matches >= len(input_cmd) * 0.6:
                    return cmd_name
        return None
        
    # Command handlers
    def _cmd_help(self, args: List[str]) -> None:
        """Display help information"""
        if args:
            # Show help for specific command
            cmd_name = args[0].lower()
            if cmd_name in self.commands:
                cmd = self.commands[cmd_name]
                print(f"\n[HELP] {cmd.name.upper()}")
                print(f"Description: {cmd.description}")
                print(f"Usage: {cmd.usage}")
                if cmd.aliases:
                    print(f"Aliases: {', '.join(cmd.aliases)}")
            else:
                print(f"[ERROR] Unknown command: '{cmd_name}'")
        else:
            # Show all commands
            print("\n[HELP] Available Commands:")
            print("-" * 50)
            shown = set()
            for cmd in self.commands.values():
                if cmd.name not in shown:
                    shown.add(cmd.name)
                    aliases = f" ({', '.join(cmd.aliases)})" if cmd.aliases else ""
                    print(f"  {cmd.name:<12} - {cmd.description}{aliases}")
            print("\nType 'help <command>' for detailed information.")
            
    def _cmd_scan(self, args: List[str]) -> None:
        """Scan current memory sector"""
        if self.engine.memory_system:
            print(self.engine.memory_system.scan_current_sector())
        else:
            print("[ERROR] Memory system offline.")
            
    def _cmd_navigate(self, args: List[str]) -> None:
        """Navigate to another sector"""
        if not self.engine.memory_system:
            print("[ERROR] Memory system offline.")
            return
            
        sector_name = args[0].upper()
        # Allow partial matches
        if not sector_name.endswith("_"):
            # Try common sector name patterns
            possible_names = [
                sector_name,
                f"{sector_name}_RECORDS",
                f"{sector_name}_DATA",
                f"{sector_name}_LOGS",
                f"{sector_name}_SECTOR"
            ]
            
            for name in possible_names:
                if name in self.engine.memory_system.sectors:
                    sector_name = name
                    break
                    
        success, message = self.engine.memory_system.navigate_to(sector_name)
        print(message)
        
        if success:
            # Show brief sector info
            sector = self.engine.memory_system.get_current_sector()
            print(f"\n{sector.get_description()}")
            
    def _cmd_read(self, args: List[str]) -> None:
        """Read a memory fragment"""
        if not self.engine.memory_system:
            print("[ERROR] Memory system offline.")
            return
            
        fragment_id = args[0]
        fragment = self.engine.memory_system.get_fragment(fragment_id)
        
        if fragment:
            print(f"\n[MEMORY FRAGMENT: {fragment_id}]")
            print("-" * 50)
            print(fragment.get_display_content())
            
            # Track clue discovery
            if fragment.clue_id and fragment.clue_id not in self.engine.state.discovered_clues:
                self.engine.state.discovered_clues.append(fragment.clue_id)
                print(f"\n[CLUE DISCOVERED] {fragment.clue_id}")
        else:
            print(f"[ERROR] Fragment '{fragment_id}' not found or not accessible.")
            
    def _cmd_list(self, args: List[str]) -> None:
        """List available fragments"""
        if not self.engine.memory_system:
            print("[ERROR] Memory system offline.")
            return
            
        fragments = self.engine.memory_system.list_fragments()
        
        if fragments:
            print(f"\n[AVAILABLE FRAGMENTS IN {self.engine.memory_system.current_sector.name}]")
            print("-" * 50)
            for frag_id, preview in fragments:
                print(f"  {frag_id:<20} | {preview}")
        else:
            print("[SYSTEM] No accessible fragments in this sector.")
            
    def _cmd_analyze(self, args: List[str]) -> None:
        """Analyze evidence"""
        if not args:
            # Show general analysis
            clue_count = len(self.engine.state.discovered_clues)
            print(f"\n[ANALYSIS] Evidence Summary")
            print(f"Clues discovered: {clue_count}")
            
            if clue_count >= 3:
                print("\n[INSIGHT] Multiple evidence points suggest deliberate sabotage.")
                print("Someone with high-level access wanted to destroy ECHO-7.")
        else:
            # Analyze specific item
            item = args[0]
            print(f"[ANALYSIS] Examining {item}...")
            print("[SYSTEM] Detailed analysis not yet implemented.")
            
    def _cmd_decode(self, args: List[str]) -> None:
        """Decode encrypted data"""
        data = " ".join(args)
        print(f"[DECODE] Attempting to decrypt: {data}")
        print("[SYSTEM] Decryption module not yet implemented.")
        
    def _cmd_status(self, args: List[str]) -> None:
        """Show system status"""
        self.engine._show_status()
        
    def _cmd_inventory(self, args: List[str]) -> None:
        """Show discovered clues"""
        clues = self.engine.state.discovered_clues
        
        print(f"\n[INVENTORY] Discovered Evidence ({len(clues)} items)")
        print("-" * 50)
        
        if clues:
            for clue in clues:
                print(f"  • {clue}")
        else:
            print("  No evidence collected yet.")
            
        print(f"\nPuzzles solved: {len(self.engine.state.solved_puzzles)}")
        
    def _cmd_save(self, args: List[str]) -> None:
        """Save game"""
        filename = args[0] if args else "autosave"
        self.engine.save_game(filename)
        
    def _cmd_load(self, args: List[str]) -> None:
        """Load game"""
        filename = args[0] if args else "autosave"
        self.engine.load_game(filename)
        
    def _cmd_quit(self, args: List[str]) -> None:
        """Quit game"""
        if self.engine._confirm_quit():
            self.engine.quit()
            
    def _cmd_unlock(self, args: List[str]) -> None:
        """Unlock a sector"""
        if not self.engine.memory_system:
            print("[ERROR] Memory system offline.")
            return
            
        sector_name = args[0].upper()
        key = args[1]
        
        success, message = self.engine.memory_system.unlock_sector(sector_name, key)
        print(message)
        
    def _cmd_history(self, args: List[str]) -> None:
        """Show command history"""
        print("\n[COMMAND HISTORY]")
        print("-" * 50)
        for i, cmd in enumerate(self.command_history[-10:], 1):
            print(f"{i:2d}. {cmd}")
