# Echo Protocol - Development Guide

## Project Structure

```
echo-protocol/
├── src/
│   ├── main.py           # Game entry point
│   ├── game_engine.py    # Core game loop and state management
│   ├── memory_system.py  # Memory navigation and data structures
│   ├── puzzle_engine.py  # Puzzle generation and validation
│   ├── story_manager.py  # Narrative progression and branching
│   ├── commands.py       # Player command parsing and execution
│   ├── display.py        # Terminal UI and ASCII art rendering
│   └── save_system.py    # Save/load functionality
├── assets/
│   ├── ascii_art/        # ASCII art files
│   ├── memory_data/      # JSON files for memory content
│   └── puzzles/          # Puzzle definitions
├── tests/
│   └── test_*.py         # Unit tests
├── saves/                # Player save files
├── prompts/              # AI development prompts
└── docs/                 # Documentation

```

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/echo-protocol.git
cd echo-protocol
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Game

```bash
python src/main.py
```

### Development Mode

Run with debug flag for additional logging:
```bash
python src/main.py --debug
```

## Core Components

### 1. Game Engine (`game_engine.py`)
- Manages game state
- Handles main game loop
- Coordinates between different systems

### 2. Memory System (`memory_system.py`)
- Defines memory sector structure
- Handles navigation between sectors
- Manages data corruption effects

### 3. Puzzle Engine (`puzzle_engine.py`)
- Generates dynamic puzzles
- Validates player solutions
- Tracks puzzle completion

### 4. Story Manager (`story_manager.py`)
- Controls narrative flow
- Manages branching paths
- Tracks player choices and consequences

### 5. Command Parser (`commands.py`)
- Interprets player input
- Executes game commands
- Provides help system

## Adding New Content

### Creating a New Memory Sector

1. Add sector definition to `assets/memory_data/sectors.json`
2. Create content file in `assets/memory_data/[sector_name].json`
3. Add any associated puzzles to `assets/puzzles/`
4. Update navigation in `memory_system.py`

### Adding a New Puzzle Type

1. Create puzzle class in `puzzle_engine.py`
2. Add puzzle data to `assets/puzzles/`
3. Register puzzle type in puzzle factory
4. Add solution validation logic

### Implementing a New Ending

1. Define ending conditions in `story_manager.py`
2. Create ending narrative in `assets/memory_data/endings.json`
3. Add achievement/unlock logic
4. Update save system to track ending

## Testing

Run all tests:
```bash
python -m pytest tests/
```

Run specific test:
```bash
python -m pytest tests/test_puzzle_engine.py
```

## Code Style

- Follow PEP 8 guidelines
- Use type hints for function parameters
- Document all public methods
- Keep functions under 50 lines
- Use descriptive variable names

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Debugging Tips

- Use `--debug` flag to enable verbose logging
- Check `logs/game.log` for detailed execution trace
- Use `python src/main.py --test-puzzle [puzzle_id]` to test specific puzzles
- Memory dumps are saved in `saves/debug/` when errors occur