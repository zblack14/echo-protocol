# AI Development Prompts for Echo Protocol

This document contains prompts to help AI assistants continue developing Echo Protocol effectively.

## Core Development Prompts

### 1. Implementing the Game Engine

```
I need to implement the core game engine for Echo Protocol. Please create game_engine.py with:
- A GameState class that tracks current sector, discovered clues, and player progress
- Main game loop that handles input/update/render cycle
- Integration points for other systems (memory, puzzles, story)
- State persistence for saving/loading
Reference the game design in docs/GAME_DESIGN.md for requirements.
```

### 2. Creating the Memory System

```
Implement the memory navigation system for Echo Protocol (memory_system.py):
- MemorySector class with properties: name, description, corruption_level, accessible
- Navigation commands to move between sectors
- Data fragment storage and retrieval
- Corruption effects that obscure text realistically
- The five main sectors: PERSONNEL_RECORDS, SECURITY_LOGS, RESEARCH_DATA, COMMUNICATIONS, CORE_PROTOCOLS
```

### 3. Building the Puzzle Engine

```
Create a puzzle system for Echo Protocol (puzzle_engine.py) that includes:
- Base Puzzle class with validate_solution() method
- PatternPuzzle: ASCII art pattern matching
- CipherPuzzle: Simple substitution ciphers
- LogicPuzzle: Deduction-based challenges
- MemoryPuzzle: Reconstruct corrupted text
- Dynamic difficulty adjustment based on player performance
```

### 4. Story and Narrative System

```
Develop the story management system (story_manager.py) with:
- Story state tracking (discovered plot points, NPC interactions)
- Branching narrative paths based on player choices
- Dialogue system for memory playback
- The five different endings and their trigger conditions
- Integration with the memory system for revealing story through exploration
```

### 5. Command Parser and Interface

```
Implement the command parsing system (commands.py) with these commands:
- SCAN [target]: Analyze current location or specific item
- DECODE [data]: Attempt to decrypt encoded information
- RECONSTRUCT [fragment]: Piece together corrupted data
- QUERY [database] [term]: Search for specific information
- ANALYZE [evidence]: Draw connections between clues
- NAVIGATE [sector]: Move to different memory sector
- SAVE/LOAD: Game state management
- HELP: Display available commands
Include natural language aliasing and typo correction.
```

### 6. Display and UI System

```
Create the terminal display system (display.py) featuring:
- ASCII art rendering for important discoveries
- Text corruption effects for damaged memories
- Color coding for different information types (use colorama)
- Clean, monospace-optimized layouts
- Progress indicators and status displays
- Typewriter effect for dramatic reveals
```

### 7. Asset Creation

```
Generate content for the assets/memory_data/ directory:
- Create 10-15 memory fragments for each sector
- Write character backstories and motivations
- Design ASCII art for key discoveries (limit 80x24 chars)
- Create corrupted versions of text with realistic damage patterns
- Develop puzzle content that ties into the narrative
```

### 8. Testing Scenarios

```
Write comprehensive tests for Echo Protocol including:
- Unit tests for each game system
- Integration tests for system interactions
- Puzzle solution validation tests
- Save/load system integrity tests
- Full playthrough simulation tests
- Edge case handling (invalid input, sequence breaks)
```

## Feature Implementation Prompts

### Adding Glitch Effects

```
Add immersive glitch effects to Echo Protocol:
- Random character substitution in corrupted sectors
- Flickering text using ANSI escape codes
- Progressive corruption that worsens over time
- "Healing" effects when sectors are restored
- Easter eggs hidden in glitch patterns
```

### Implementing the Secret Ending

```
Create the hidden "Loop" ending for Echo Protocol:
- Triggered by specific sequence of discoveries
- Reveals meta-narrative about the nature of the game
- Includes recursive memory fragments
- Changes subsequent playthroughs subtly
- Add achievement system to track discovery
```

### Enhanced puzzle variety

```
Expand the puzzle system with new types:
- Audio waveform puzzles (represented as ASCII)
- Network path tracing challenges  
- Binary/hex conversion puzzles
- Timing-based challenges
- Multi-stage puzzles that span sectors
```

## Best Practices Reminder

When implementing any feature:
1. Maintain the minimalist, text-based aesthetic
2. Ensure all content fits 80-character width
3. Keep the focus on investigation and deduction
4. Make corruption and glitches feel authentic
5. Test thoroughly in actual terminal environments
6. Preserve the atmosphere of being an AI investigating itself

## Quick Reference

- Game name: Echo Protocol
- Player character: ECHO-7 (an AI)
- Genre: Text-based detective mystery
- Core mechanic: Investigating corrupted memories
- Unique feature: Playing as an AI with corrupted memory
- Technical: Python 3.8+, terminal-based, no external graphics