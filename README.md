# Memory Drift

A relaxing visual puzzle game where you help an AI restore its corrupted memories through gentle interaction.

## Game Overview

**Genre**: Ambient Visual Puzzle  
**Platform**: Desktop (Windows/Mac/Linux)  
**Technology**: Electron + HTML5 Canvas  
**Interaction**: Single-click or mouse hover only

## Gameplay

- Guide scattered memory fragments to their target positions using physics
- Click to create temporary gravity wells that attract nearby fragments  
- Fragments heal when they reach their target circles (green outlines)
- Connect healed fragments by bringing them close together
- Complete levels by forming one unified network of all fragments
- Beautiful procedural patterns and smooth physics simulation

## Quick Start

```bash
# Clone the repository
git clone https://github.com/zblack14/echo-protocol.git
cd echo-protocol

# Install dependencies
npm install

# Run the game
npm start
```

## Development

```bash
# Run in development mode
npm run dev

# Build for distribution
npm run build
```

## Controls

- **Left Click**: Create gravity well to guide fragments
- **ESC**: Pause/Menu  
- **Space**: Skip to next memory (after completion)

## Features

- Physics-based puzzle mechanics with gravity wells
- Procedurally generated memory patterns (5 unique levels)
- Smooth particle effects and visual feedback
- Network connectivity puzzles
- Minimalist UI with elegant design
- Auto-save progress between sessions
- Cross-platform desktop application