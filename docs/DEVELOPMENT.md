# Memory Drift - Development Guide

## Project Structure

```
memory-drift/
├── src/
│   ├── main.py              # Game entry point
│   ├── game.py              # Main game class and loop
│   ├── memory_fragment.py   # Memory fragment visual logic
│   ├── particle_system.py   # Particle effects system
│   └── visual_generator.py  # Procedural visual generation
├── assets/
│   ├── images/              # Generated visual assets
│   └── saves/               # Player save files
├── docs/
│   ├── GAME_DESIGN.md       # Complete game design
│   └── DEVELOPMENT.md       # This file
├── tests/
│   └── test_*.py            # Unit tests
└── requirements.txt         # Python dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/memory-drift.git
cd memory-drift
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

## Core Components

### 1. Game Engine (`game.py`)
- **Game Loop**: 60 FPS main loop with event handling
- **State Management**: Menu, playing, paused, level complete
- **Level System**: 5 levels with increasing complexity
- **Save System**: JSON-based progress persistence

### 2. Memory Fragment (`memory_fragment.py`)
- **Visual Generation**: Procedural geometric patterns
- **Corruption Effects**: Visual degradation and healing
- **Animation**: Drift, pulse, and rotation effects
- **Color Management**: Dynamic color interpolation

### 3. Particle System (`particle_system.py`)
- **Emission**: Healing particles on interaction
- **Physics**: Simple velocity and lifetime simulation
- **Rendering**: Additive blending for glow effects
- **Performance**: Automatic particle count limiting

### 4. Visual Generator (`visual_generator.py`)
- **Background Textures**: Subtle noise patterns
- **Connection Lines**: Dynamic inter-fragment connections
- **Effect Generation**: Healing auras and transitions
- **Procedural Content**: Runtime visual generation

## Key Systems

### Fragment Pattern Generation

Each memory fragment generates one of three pattern types:

1. **Geometric**: Nested hexagons and circles
2. **Organic**: Flowing curves and natural shapes
3. **Crystalline**: Angular, crystal-like structures

Patterns are generated using:
- Deterministic seeding for consistency
- Mathematical functions for precision
- Color interpolation for visual appeal

### Corruption and Healing

Fragments have a `corruption_level` (0.0 to 1.0) that affects:
- **Visual Opacity**: More corrupt = more transparent
- **Color Saturation**: Corrupt fragments are grayer
- **Animation Speed**: Healthy fragments pulse faster
- **Particle Emission**: Healing creates more particles

### Mouse Interaction

Player interaction works through:
- **Proximity Detection**: Mouse distance to fragments
- **Influence Radius**: 150-pixel circular area
- **Acceleration**: Click events boost healing rate
- **Visual Feedback**: Influence area visible to player

## Performance Optimization

### Frame Rate Maintenance
- **Update Optimization**: Skip complex calculations for off-screen fragments
- **Particle Limiting**: Maximum 500 particles active
- **Surface Caching**: Pre-generate fragment patterns
- **Selective Rendering**: Only draw visible elements

### Memory Management
- **Particle Cleanup**: Automatic removal of dead particles
- **Surface Reuse**: Recycle pygame surfaces when possible
- **Garbage Collection**: Explicit cleanup on level transitions

## Testing

### Unit Tests
```bash
python -m pytest tests/
```

### Test Coverage
- Fragment generation and corruption
- Particle system performance
- Save/load functionality
- Visual generation accuracy

### Performance Testing
- Frame rate monitoring
- Memory usage tracking
- Particle count optimization
- Load time measurement

## Visual Asset Pipeline

### Procedural Generation
All visuals are generated at runtime:
1. **Fragment Patterns**: Mathematical pattern generation
2. **Color Schemes**: Predefined palettes with interpolation
3. **Particle Effects**: Physics-based particle simulation
4. **Background Textures**: Noise-based subtle patterns

### No External Assets Required
- All graphics generated programmatically
- No image files needed
- Scalable to any resolution
- Consistent visual style

## Code Style Guidelines

### Python Standards
- **PEP 8**: Follow Python style guidelines
- **Type Hints**: Use type annotations for clarity
- **Docstrings**: Document all public methods
- **Error Handling**: Graceful failure modes

### Game-Specific Conventions
- **60 FPS Target**: All animations designed for 60 FPS
- **Color Tuples**: Use (R, G, B) format consistently
- **Coordinate System**: Screen coordinates (0,0) at top-left
- **Delta Time**: Use dt for frame-rate independent updates

## Debugging

### Visual Debugging
- **Fragment States**: Print corruption levels
- **Particle Counts**: Monitor active particles
- **Performance Metrics**: Frame rate and memory usage
- **Mouse Tracking**: Debug interaction areas

### Common Issues
- **Performance Drops**: Check particle count limits
- **Visual Artifacts**: Verify surface alpha handling
- **Save/Load Errors**: Validate JSON structure
- **Input Lag**: Ensure event handling efficiency

## Deployment

### Distribution
- **Standalone Executable**: Use PyInstaller
- **Cross-Platform**: Test on Windows, Mac, Linux
- **Dependency Bundling**: Include all required libraries
- **Asset Validation**: Verify all generated content

### Release Process
1. **Version Tagging**: Semantic versioning
2. **Testing**: Full regression test suite
3. **Building**: Create platform-specific builds
4. **Distribution**: Package and upload

## Future Development

### Planned Features
- **Audio System**: Ambient sound and effect integration
- **More Levels**: Additional pattern types and layouts
- **Accessibility**: Enhanced accessibility options
- **Customization**: Player-configurable color schemes

### Technical Improvements
- **Shader Support**: GPU-accelerated effects
- **3D Rendering**: Depth-based fragment positioning
- **Advanced Physics**: More realistic particle behavior
- **Networking**: Multiplayer collaboration features

## Contributing

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request

### Art Contributions
- **Pattern Designs**: New fragment pattern types
- **Color Schemes**: Additional level palettes
- **Effect Ideas**: New visual effects concepts
- **UI Design**: Interface improvements

### Bug Reports
- **Reproduction Steps**: Clear steps to reproduce
- **System Information**: OS, Python version, hardware
- **Screenshots**: Visual evidence of issues
- **Expected Behavior**: What should happen instead