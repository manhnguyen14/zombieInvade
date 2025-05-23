# Zombie Lane Defense - Architecture Document

## Project Overview

Zombie Lane Defense is a pixel art side-scrolling shooter where players defend against waves of zombies moving from right to left. The player's team is positioned on the left side of the screen and can move vertically between 9 lanes (8 combat lanes and 1 bonus lane), as well as adjust their forward/backward position to control the relative speed of incoming enemies.

The game features:
- Lane-based combat system with unique shooting mechanics
- Multiple zombie types (Normal, Armored, Giant) with customizable variations
- Destructible and impassable obstacles
- Two types of power-ups: bonus lane items and bonus-containing obstacles
- Custom map editor for precise element placement and spawn zone definition
- Time-limited levels with multiple game over conditions

This document outlines the technical architecture, project structure, and development guidelines for implementing the game.

## Project Structure

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

## Core Architecture

### Module Organization

#### Core Modules
The core modules handle fundamental game functionality:
```
src/core/
├── game.js                  # Main game controller
├── renderer.js              # Canvas rendering handler
├── input-handler.js         # Keyboard/touch input handling
├── asset-loader.js          # Asset loading and caching
├── collision-system.js      # Collision detection
├── animation-system.js      # Animation handling
├── audio-manager.js         # Sound and music playback
├── level-manager.js         # Level loading and switching
├── timer.js                 # Game timing and loops
├── entity-manager.js        # Entity creation and management
└── event-bus.js             # Event-based communication
```

#### Entity Modules
Entities represent all objects within the game world:
```
src/entities/
├── entity.js                # Base entity class
├── component.js             # Base component class
├── components/              # Component implementations
│   ├── transform.js         # Position, rotation, and scale
│   ├── render.js            # Visual representation
│   ├── lane.js              # Lane positioning
│   ├── health.js            # Health and damage
│   ├── collision.js         # Collision detection
│   └── ... other components
├── player.js                # Player team and soldier management
├── soldier.js               # Individual soldier
├── projectile.js            # Bullets and grenades
├── enemy.js                 # Base enemy class
├── zombie-types/            # Different zombie implementations
│   ├── normal-zombie.js     # Normal zombie base class
│   ├── normal-variants/     # Variations of normal zombies
│   ├── armored-zombie.js    # Armored zombie base class
│   ├── armored-variants/    # Variations of armored zombies
│   ├── giant-zombie.js      # Giant zombie base class
│   └── giant-variants/      # Variations of giant zombies
├── obstacle.js              # Base obstacle class
├── obstacle-types/          # Different obstacle implementations
│   ├── small-obstacle.js    # Small obstacle base class
│   ├── small-variants/      # Variations of small obstacles
│   ├── medium-obstacle.js   # Medium obstacle base class
│   ├── medium-variants/     # Variations of medium obstacles
│   ├── large-obstacle.js    # Large obstacle base class
│   ├── large-variants/      # Variations of large obstacles
│   └── hole.js              # Impassable hole obstacle
├── bonus.js                 # Base bonus class
└── bonus-types/             # Different bonus implementations
    ├── soldier-bonus.js     # Soldier bonus base class
    ├── soldier-variants/    # Variations of soldier bonuses
    ├── weapon-upgrade.js    # Weapon upgrade base class
    ├── weapon-variants/     # Variations of weapon upgrades
    ├── grenade-bonus.js     # Grenade bonus base class
    └── grenade-variants/    # Variations of grenade bonuses
```

#### System Modules
Systems handle game mechanics and rules:
```
src/systems/
├── system.js               # Base system class
├── entity-system.js        # Base class for entity-processing systems
├── lane-system.js          # Lane management
├── shooting-system.js      # Shooting mechanics
├── movement-system.js      # Entity movement
├── render-system.js        # Entity rendering
├── spawn-system.js         # Enemy and obstacle spawning
│   ├── entity-spawner.js   # Handle pre-placed entities
│   └── zone-spawner.js     # Handle spawn zone entities
├── bonus-system.js         # Bonus generation and collection
├── collision-system.js     # Collision detection and resolution
├── scoring-system.js       # Score tracking
├── timer-system.js         # Level time management
└── difficulty-system.js    # Difficulty progression
```

#### UI Modules
UI modules handle all user interface elements:
```
src/ui/
├── ui-manager.js            # Overall UI handling
├── hud.js                   # In-game heads-up display
├── main-menu.js             # Main menu screen
├── pause-menu.js            # Pause screen
├── level-select.js          # Level selection
├── game-over.js             # Game over screen
└── victory.js               # Level completion screen
```

## Architecture Patterns

To ensure testability, maintainability, and minimize bugs, we will implement the following architectural patterns:

### 1. Entity-Component-System (ECS)

We'll use a lightweight ECS architecture where:
- **Entities** are simple containers for components with unique IDs and tags
- **Components** store data but no logic, with each component having a specific type
- **Systems** contain logic that acts on entities with specific components
- **EntityManager** handles entity creation, deletion, and querying

Implementation details:
- `Entity` class: Container for components with methods for adding, removing, and querying components
- `Component` class: Base class for all components with a type identifier
- `System` class: Base class for all systems with update method and priority
- `EntitySystem` class: Specialized system that processes entities with specific components
- `EntityManager` class: Manages entity lifecycle and provides query methods

This approach:
- Makes the codebase more modular and easier to test
- Reduces interdependencies between different parts of the game
- Allows for easier addition of new features
- Simplifies debugging by isolating functionality

### 2. Service Locator Pattern

Core services (rendering, audio, input) will be accessible through a service locator:
- Decouples systems from specific service implementations
- Makes unit testing easier by allowing service mocking
- Allows services to be swapped at runtime if needed

### 3. State Pattern

Game states (menu, playing, paused) will be managed using the state pattern:
- Each state encapsulates its own behavior
- Clean transitions between states
- Prevents state-specific code from bleeding throughout the codebase

### 4. Observer Pattern (Event Bus)

Communication between systems will use an observer pattern via an event bus:
- Systems can publish events without knowing who will receive them
- Systems can subscribe to events they're interested in
- Events carry data that subscribers can use

Implementation details:
- `EventBus` class: Central hub for event publishing and subscription
- Events are identified by string type names
- Subscribers receive callbacks when events they're interested in are published
- Subscription IDs allow for targeted unsubscribing

Benefits:
- Reduces tight coupling between systems
- Makes systems independently testable
- Allows for easy addition of new listeners without modifying existing code
- Provides a centralized way to debug system interactions

## Bonus System Implementation

### Bonus Types

All bonuses share common properties but have different effects:
- **Soldier Bonus**: Increases team size
- **Weapon Upgrade**: Improves gun quality
- **Grenade**: Adds grenades to inventory

### Bonus Sources

There are two ways to obtain bonuses:

1. **Bonus Lane Bonuses**
   - Appear in the dedicated bonus lane (lane 0)
   - Player must move to the bonus lane and touch them to collect
   - Disappear when they move off-screen to the left

2. **Obstacle Bonuses**
   - Hidden inside specific obstacles
   - Player must destroy the obstacle to reveal the bonus
   - Have a countdown timer after appearing (typically 8 seconds)
   - Disappear when the timer expires

### Player-Soldier Relationship

The player-soldier relationship is a core mechanic of the game, with the following key features:

#### Player as Special Soldier
- The player is a special soldier carrying the objective
- If the player dies, it's game over
- The player is positioned on the left side of the screen

#### Soldier Positioning
- Soldiers are organized into three positions relative to the player:
  - **Middle**: Same lane as the player
  - **Top**: Lane above the player
  - **Bottom**: Lane below the player
- Each position normally occupies one lane
- Soldiers are visually positioned to the right of the player

#### Soldier Distribution Rules
- New soldiers are added to the position with the fewest soldiers
- If positions have equal numbers, priority is middle > top > bottom

#### Special Lane Handling
- **Bonus Lane (Lane 0)**: When the player enters the bonus lane, all soldiers stack in this lane and stop shooting
- **Edge Lanes (Lanes 1 and 8)**: When the player is at an edge lane, only 2 positions are used to keep soldiers within map boundaries
  - At Lane 1 (top edge): Use middle and bottom positions
  - At Lane 8 (bottom edge): Use middle and top positions

#### Implementation Classes
- `Player`: Manages the team of soldiers and handles team-level logic
  - Tracks soldiers by position (middle, top, bottom)
  - Handles lane movement and soldier redistribution

- `Soldier`: Represents an individual soldier
  - Tracks assigned position and lane
  - Handles soldier-specific behavior

### Implementation

#### Level Data Structure

The game uses a JSON-based data structure for defining levels, which supports both manually placed objects and spawn zones:

```javascript
{
  level: 1,
  timeLimit: 180,
  message: "Level 1: The Outbreak Begins",
  map: {
    length: 6000,

    // Pre-placed objects
    objects: [
      // Enemies with variants
      { type: "enemy", objectType: "Normal", variant: "Crawler", lane: 1, position: 800 },

      // Obstacles
      { type: "obstacle", objectType: "Small", variant: "Barricade", lane: 2, position: 900 },

      // Bonuses in bonus lane
      { type: "bonus", objectType: "Soldier", variant: "Standard", lane: 0, position: 1200 },

  
    ],

    // Spawn zones
    spawnZones: [
      {
        type: "enemy",
        startPosition: 6000,
        endPosition: 10000,
        lanes: [1, 2, 3, 4],
        spawnFrequency: 3,
        spawnCount: 15,
        possibleEntities: [
          { objectType: "Normal", variant: "Standard", weight: 70 },
          { objectType: "Armored", variant: "Standard", weight: 10 }
        ]
      }
    ]
  }
}
```

The `BonusSystem` class will:
1. Track all active bonuses in the game
2. Handle bonus creation when obstacles are destroyed
3. Manage bonus timers for obstacle-based bonuses
4. Process bonus collection when the player touches them
5. Apply bonus effects to the player

## Testing Strategy

### Unit Testing

- Each system should be unit tested in isolation
- Use dependency injection to provide mocks for dependencies
- Focus on testing pure functions and predictable outcomes

### Integration Testing

- Test interactions between systems using the event bus
- Verify that events trigger expected behaviors across systems
- Test the full lifecycle of game entities

### Playtest Automation

- Create automated playtest scenarios to verify game mechanics
- Test edge cases in enemy spawning, collision detection, etc.
- Automate tests for level completion, game over conditions

## Development Guidelines

### Code Style

- Use ES6+ features but ensure browser compatibility
- Follow a consistent naming convention (camelCase for variables/methods, PascalCase for classes)
- Document public APIs with JSDoc comments
- Keep functions small and focused on a single responsibility

### Performance Considerations

- Use object pooling for frequently created/destroyed objects (bullets, effects)
- Minimize garbage collection by reusing objects
- Use the canvas efficiently, only redrawing what needs to be updated
- Consider using requestAnimationFrame for smooth animation

### Debugging Aids

- Implement a debug mode with:
  - Hitbox visualization
  - FPS counter
  - Entity inspector
  - Event logging
- Add toggleable logging for different subsystems

## Game Loop Implementation

```javascript
class Game {
  constructor(config) {
    this.lastTimestamp = 0;
    this.isRunning = false;
    // Initialize systems and services
  }

  start() {
    this.isRunning = true;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(timestamp) {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Update game state
    this.update(deltaTime);

    // Render current frame
    this.render();

    // Schedule next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(deltaTime) {
    // Update all game systems
    this.inputSystem.update();
    this.movementSystem.update(deltaTime);
    this.collisionSystem.update();
    this.shootingSystem.update(deltaTime);
    this.bonusSystem.update(deltaTime);
    // ...other systems
  }

  render() {
    // Clear the canvas
    this.renderer.clear();

    // Render lanes
    this.laneSystem.render(this.renderer);

    // Render game entities
    this.entityManager.render(this.renderer);

    // Render UI
    this.uiManager.render(this.renderer);
  }
}
```

## Conclusion

This architecture prioritizes:
- **Testability**: Through component isolation and dependency injection
- **Maintainability**: Via clean separation of concerns and modular design
- **Bug Prevention**: By using proper encapsulation and clearly defined interfaces

By following these patterns and guidelines, we can create a robust and extensible game that's easier to develop, test, and maintain.