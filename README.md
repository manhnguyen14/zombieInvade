# Zombie Lane Defense

A pixel art side-scrolling shooter game with lane-based combat where players defend against waves of zombies.

## Project Overview

Zombie Lane Defense is a browser-based game featuring:
- Lane-based combat system with 8 combat lanes and 1 bonus lane
- Multiple zombie types (Normal, Armored, Giant) with variations
- Obstacles and bonuses for strategic gameplay
- Custom map editor for creating and sharing levels
- Pixel art graphics with retro-style gameplay

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- Modern web browser (Chrome 135.0+ recommended)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd zombie-lane-defense
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   - Game: http://localhost:3000/index.html
   - Tests: http://localhost:3000/tests/test-runner.html

## Development

### Project Structure

```
zombie-lane-defense/
├── index.html               # Main HTML entry point
├── assets/                  # Game assets
│   ├── images/              # Sprite images and sprite sheets
│   ├── audio/               # Sound effects and music
│   └── maps/                # Level maps (JSON files)
├── src/                     # Source code
│   ├── main.js              # Entry point for game code
│   ├── config/              # Configuration files
│   ├── core/                # Core game engine components
│   ├── entities/            # Game entity classes
│   ├── systems/             # Game systems
│   ├── ui/                  # User interface components
│   ├── utils/               # Utility functions
│   └── map-editor/          # Map editor code
└── styles/                  # CSS files for UI styling
```

### Running Tests

To run the unit tests:

1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/tests/test-runner.html
   ```

3. Use the test runner interface to run all tests or specific component tests.

Alternatively, you can use the npm test command:
```
npm test
```

### Development Server

The project includes a local development server that:
- Serves static files from the project root
- Resolves CORS issues with ES6 modules
- Provides a consistent environment for development and testing

## Architecture

The game uses the following architectural patterns:

1. **Entity-Component-System (ECS)**: For modular game object management
2. **Service Locator Pattern**: For decoupling systems from specific service implementations
3. **Observer Pattern (Event Bus)**: For system communication

## License

This project is licensed under the MIT License - see the LICENSE file for details.
