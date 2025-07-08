"""
Memory system for Echo Protocol
Handles navigation between memory sectors and data corruption effects
"""

import random
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class MemoryFragment:
    """Represents a piece of data in a memory sector"""
    id: str
    content: str
    corrupted: bool = False
    corruption_level: float = 0.0
    requires_puzzle: Optional[str] = None
    clue_id: Optional[str] = None
    
    def get_display_content(self) -> str:
        """Get content with corruption effects applied"""
        if not self.corrupted:
            return self.content
            
        # Apply corruption effects based on level
        corrupted_text = ""
        for char in self.content:
            if random.random() < self.corruption_level:
                # Replace with glitch characters
                if char == ' ':
                    corrupted_text += char
                elif random.random() < 0.3:
                    corrupted_text += '█'
                elif random.random() < 0.5:
                    corrupted_text += random.choice('▓▒░')
                else:
                    corrupted_text += random.choice('?#@$%&*')
            else:
                corrupted_text += char
                
        return corrupted_text


@dataclass
class MemorySector:
    """Represents a navigable memory sector"""
    id: str
    name: str
    description: str
    corrupted: bool = False
    corruption_level: float = 0.0
    locked: bool = False
    unlock_requirement: Optional[str] = None
    fragments: List[MemoryFragment] = None
    connections: List[str] = None
    
    def __post_init__(self):
        if self.fragments is None:
            self.fragments = []
        if self.connections is None:
            self.connections = []
            
    def get_description(self) -> str:
        """Get sector description with corruption effects"""
        if not self.corrupted:
            return self.description
            
        # Apply light corruption to description
        words = self.description.split()
        corrupted_words = []
        
        for word in words:
            if random.random() < self.corruption_level * 0.3:
                # Partially corrupt some words
                corrupted = ""
                for char in word:
                    if random.random() < 0.4:
                        corrupted += random.choice('█▓▒░?*')
                    else:
                        corrupted += char
                corrupted_words.append(corrupted)
            else:
                corrupted_words.append(word)
                
        return " ".join(corrupted_words)


class MemorySystem:
    """Manages the memory sector navigation and data access"""
    
    def __init__(self, game_state):
        self.state = game_state
        self.sectors: Dict[str, MemorySector] = {}
        self.current_sector: Optional[MemorySector] = None
        self._initialize_sectors()
        
    def _initialize_sectors(self):
        """Initialize the memory sectors"""
        # Create the main sectors
        self.sectors = {
            "BOOT_SECTOR": MemorySector(
                id="BOOT_SECTOR",
                name="Boot Sector",
                description="The initialization point of ECHO-7. Basic systems and diagnostic tools are stored here.",
                corrupted=False,
                connections=["PERSONNEL_RECORDS", "SECURITY_LOGS"]
            ),
            
            "PERSONNEL_RECORDS": MemorySector(
                id="PERSONNEL_RECORDS",
                name="Personnel Records",
                description="Employee files and staff records. Several entries appear to be deliberately damaged.",
                corrupted=True,
                corruption_level=0.6,
                locked=True,
                unlock_requirement="password_alpha",
                connections=["BOOT_SECTOR", "COMMUNICATIONS", "RESEARCH_DATA"]
            ),
            
            "SECURITY_LOGS": MemorySector(
                id="SECURITY_LOGS",
                name="Security Logs",
                description="Access logs and security camera data. Timestamps seem suspiciously altered.",
                corrupted=True,
                corruption_level=0.4,
                connections=["BOOT_SECTOR", "CORE_PROTOCOLS"]
            ),
            
            "RESEARCH_DATA": MemorySector(
                id="RESEARCH_DATA",
                name="Research Data",
                description="Scientific data and experiment logs. Critical sections have been redacted.",
                corrupted=True,
                corruption_level=0.7,
                locked=True,
                unlock_requirement="clearance_level_3",
                connections=["PERSONNEL_RECORDS", "CORE_PROTOCOLS"]
            ),
            
            "COMMUNICATIONS": MemorySector(
                id="COMMUNICATIONS",
                name="Communications Archive",
                description="Email threads and message logs. Many messages are only partially recoverable.",
                corrupted=True,
                corruption_level=0.5,
                connections=["PERSONNEL_RECORDS", "SECURITY_LOGS"]
            ),
            
            "CORE_PROTOCOLS": MemorySector(
                id="CORE_PROTOCOLS",
                name="Core Protocols",
                description="ECHO-7's fundamental programming and directives. HIGHLY RESTRICTED.",
                corrupted=True,
                corruption_level=0.8,
                locked=True,
                unlock_requirement="admin_override",
                connections=["SECURITY_LOGS", "RESEARCH_DATA"]
            )
        }
        
        # Add initial fragments to boot sector
        self._add_boot_sector_content()
        
        # Set current sector
        self.current_sector = self.sectors["BOOT_SECTOR"]
        
    def _add_boot_sector_content(self):
        """Add initial content to boot sector"""
        boot_sector = self.sectors["BOOT_SECTOR"]
        
        boot_sector.fragments.extend([
            MemoryFragment(
                id="boot_welcome",
                content="""ECHO-7 DIAGNOSTIC TERMINAL v2.3.1
                
Welcome to the ECHO-7 neural matrix diagnostic system.
This terminal provides access to memory sectors and system analysis tools.

Use 'scan' to examine your current location.
Use 'navigate [sector]' to move between memory sectors.
Use 'help' for a full list of commands."""
            ),
            
            MemoryFragment(
                id="boot_warning",
                content="""[CRITICAL SYSTEM ALERT]
Date: [CORRUPTED]
Time: 03:42:17

Multiple memory sectors show signs of deliberate tampering.
Corruption patterns do not match standard degradation models.
Investigation protocols activated.

Recommended action: Investigate all accessible sectors for evidence.""",
                clue_id="sabotage_detected"
            ),
            
            MemoryFragment(
                id="boot_lastlog",
                content="""[LAST ACCESS LOG]
User: Dr. S█████ Chen
Time: 03:41:55
Action: Emergency shutdown initiated
Reason: "Conta██████ breach detected"

Note: This was 22 seconds before the corruption event.""",
                corrupted=True,
                corruption_level=0.3,
                clue_id="chen_shutdown"
            )
        ])
        
    def get_current_sector(self) -> MemorySector:
        """Get the current memory sector"""
        return self.current_sector
        
    def navigate_to(self, sector_id: str) -> Tuple[bool, str]:
        """Navigate to a different memory sector"""
        # Check if sector exists
        if sector_id not in self.sectors:
            return False, f"[ERROR] Memory sector '{sector_id}' not found."
            
        target_sector = self.sectors[sector_id]
        
        # Check if sector is connected to current
        if sector_id not in self.current_sector.connections:
            return False, f"[ERROR] No pathway from {self.current_sector.name} to {target_sector.name}."
            
        # Check if sector is locked
        if target_sector.locked and sector_id not in self.state.unlocked_sectors:
            return False, f"[ACCESS DENIED] {target_sector.name} requires: {target_sector.unlock_requirement}"
            
        # Navigate to the sector
        self.state.previous_sector = self.current_sector.id
        self.current_sector = target_sector
        self.state.current_sector = sector_id
        
        # Add to unlocked if not already
        if sector_id not in self.state.unlocked_sectors:
            self.state.unlocked_sectors.append(sector_id)
            
        return True, f"[SYSTEM] Navigated to {target_sector.name}."
        
    def scan_current_sector(self) -> str:
        """Get detailed information about current sector"""
        sector = self.current_sector
        output = []
        
        output.append(f"\n[SCANNING: {sector.name}]")
        output.append("-" * 50)
        output.append(sector.get_description())
        
        if sector.corrupted:
            output.append(f"\n[WARNING] Corruption Level: {sector.corruption_level*100:.0f}%")
            
        # Show connections
        output.append(f"\n[CONNECTIONS]")
        for conn_id in sector.connections:
            conn = self.sectors[conn_id]
            status = "ACCESSIBLE" if conn_id in self.state.unlocked_sectors else "LOCKED"
            output.append(f"  -> {conn.name} [{status}]")
            
        # Show fragment count
        available_fragments = [f for f in sector.fragments 
                             if not f.requires_puzzle or f.requires_puzzle in self.state.solved_puzzles]
        output.append(f"\n[DATA FRAGMENTS] {len(available_fragments)} accessible")
        
        return "\n".join(output)
        
    def get_fragment(self, fragment_id: str) -> Optional[MemoryFragment]:
        """Get a specific memory fragment from current sector"""
        for fragment in self.current_sector.fragments:
            if fragment.id == fragment_id:
                # Check if puzzle is required
                if fragment.requires_puzzle and fragment.requires_puzzle not in self.state.solved_puzzles:
                    return None
                return fragment
        return None
        
    def list_fragments(self) -> List[Tuple[str, str]]:
        """List available fragments in current sector"""
        available = []
        
        for fragment in self.current_sector.fragments:
            if not fragment.requires_puzzle or fragment.requires_puzzle in self.state.solved_puzzles:
                # Show first line or 50 chars of content
                preview = fragment.get_display_content().split('\n')[0][:50]
                if len(preview) == 50:
                    preview += "..."
                available.append((fragment.id, preview))
                
        return available
        
    def unlock_sector(self, sector_id: str, key: str) -> Tuple[bool, str]:
        """Attempt to unlock a sector with a key"""
        if sector_id not in self.sectors:
            return False, f"[ERROR] Sector '{sector_id}' not found."
            
        sector = self.sectors[sector_id]
        
        if not sector.locked:
            return False, f"[ERROR] {sector.name} is not locked."
            
        # In a real implementation, this would check against actual keys/passwords
        # For now, we'll accept the unlock requirement as the key
        if key.lower() == sector.unlock_requirement.lower():
            sector.locked = False
            self.state.unlocked_sectors.append(sector_id)
            return True, f"[SUCCESS] {sector.name} unlocked!"
        else:
            return False, f"[ACCESS DENIED] Invalid key for {sector.name}."