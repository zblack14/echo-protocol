# Claude AI Context for Echo Protocol Development

## Project Overview
You are helping develop "Echo Protocol", a text-based detective game where players control ECHO-7, an AI investigating its own corrupted memory banks to uncover a conspiracy.

## Current Project State
- Basic structure and documentation created
- Game design document complete
- Development setup ready
- Awaiting core implementation

## Key Design Principles
1. **Minimalist**: Text-only, no graphics needed
2. **Immersive**: Use terminal features creatively
3. **Mysterious**: Information revealed through investigation
4. **Replayable**: Multiple paths and endings
5. **Accessible**: Simple commands, complex story

## When Continuing Development

Always check these files first:
- `/app/echo-protocol/docs/GAME_DESIGN.md` - Complete game design
- `/app/echo-protocol/docs/DEVELOPMENT.md` - Technical structure
- `/app/echo-protocol/prompts/DEVELOPMENT_PROMPTS.md` - Implementation guides

## Implementation Priority

1. **Core Systems** (implement first):
   - game_engine.py - Main game loop
   - memory_system.py - Navigation system
   - commands.py - Input handling

2. **Content Systems** (implement second):
   - puzzle_engine.py - Puzzle mechanics
   - story_manager.py - Narrative flow
   - display.py - Terminal UI

3. **Support Systems** (implement last):
   - save_system.py - Persistence
   - Assets creation - Content files

## Code Style Guidelines

```python
# Use type hints
def process_command(cmd: str) -> CommandResult:
    pass

# Keep functions focused
# Document complex logic
# Use descriptive names
# Handle errors gracefully
```

## Testing Approach
- Write tests alongside implementation
- Test each system in isolation first
- Create integration tests for system interactions
- Always test in actual terminal environment

## Remember
This is a detective game about an AI investigating itself. The player should feel like they're genuinely uncovering a mystery through corrupted data, not just reading a story.