# Zombie Lane Defense - Game Design Document

## Game Overview
"Zombie Lane Defense" is a pixel art side-scrolling shooter where players defend against waves of zombies moving from right to left. The player's team is positioned on the left side of the screen and can move vertically between lanes, as well as adjust their forward/backward position to control the relative speed of incoming enemies. The game features a unique lane-based combat system with both combat and bonus lanes.

## Core Gameplay

### Game Objective
- Survive waves of zombies
- Collect bonuses to strengthen your team
- Complete each level within the time limit
- Reach the finish line before time expires

### Game Over Conditions
1. Player's entire team is eliminated (all soldiers die)
2. Any zombie crosses the finish line (reaches left edge)
3. Time limit expires before level completion

## Lane System

### Layout
- **Total Lanes**: 9
  - 8 Combat Lanes: Where shooting and combat take place
  - 1 Bonus Lane: For collecting power-ups (no shooting allowed)

### Shooting Mechanics
- Player can only shoot from left to right
- Bullets cannot travel beyond the screen boundaries
- **Unlimited bullets**: Player can shoot continuously without ammunition concerns
- **Limited grenades**: Special weapon with restricted usage, must be collected as bonuses
- **No shooting in bonus lane**: Player cannot shoot while positioned in the bonus lane

### Movement Mechanics
- Player can move vertically between lanes
- Player can adjust forward/backward position on the left side to control relative speed of incoming objects
  - Moving forward: Objects approach faster
  - Moving backward: Objects approach slower
- Enemies and obstacles move from right to left at varying speeds based on type
- Player cannot shoot while positioned in the bonus lane

## Player Team

### Soldier System
- **Each soldier has 1 HP**
- **Soldier Distribution**:
  - There are three soldier positions (occupy one lane each)
  - New soldiers are added to the position with the fewest soldiers
  - If positions have equal numbers, priority is middle > top > bottom
  - soldiers move together as a group.

### Shooting Mechanics
- **Unlimited bullets**: Player can shoot continuously
- **Shooting speed**: Calculated as (gun quality × number of soldiers) ÷ lanes covered
- **Limited grenades**: Special weapon with restricted usage, must be collected as bonuses

## Enemy Types

### Base Enemy Types
The game features three base enemy types that can be extended with various visual and behavioral variants:

#### Normal Zombies
- Basic enemies
- Low health points
- Standard threat level
- Cannot pass through obstacles (will push obstacle based on innate speed and weight)
- Can stack in the same position with other zombies
- Have single attack that hit a single soldier
- **Variants**: Standard, Crawler, Runner, etc.

#### Armored Zombies
- Medium health points
- Require more hits to defeat
- Increased threat level
- Cannot pass through obstacles (will push obstacle based on innate speed and weight)
- Can stack in the same position with other zombies
- Have single attack that hit a single soldier
- **Variants**: Standard Armor, Heavy Armor, Partial Armor, etc.

#### Giant Zombies
- High health points
- Can take significant damage before falling
- High threat level
- Can stack in the same position with other zombies
- Cannot pass through obstacles (will push obstacle based on innate speed and weight)
- Have wide attack that hit multiple soldiers
- **Variants**: Tank Giant, Berserker Giant, Slow Giant, etc.

### Enemy Variation System
Each base enemy type can have multiple variants with different:
- Visual appearance
- Health points
- Movement speed
- Special abilities
- Point values
- Attack speed
- Attack damage

## Obstacles and Hazards

### Moving Obstacles
Base obstacle types that can be extended with various visual and functional variants:

#### Small Obstacles
- Low health
- Fastest movement speed
- Cannot pass through other zombies  obstacles (will push based on innate speed and weight)
- **Variants**: Barricade, Crate, Trash Can, etc.

#### Medium Obstacles
- Medium health
- Medium movement speed
- Cannot pass through other zombies  obstacles (will push based on innate speed and weight)
- **Variants**: Car, Dumpster, Fence, etc.

#### Large Obstacles
- High health
- Slow movement speed
- Cannot pass through other zombies  obstacles (will push based on innate speed and weight)
- **Variants**: Bus, Truck, Wall, etc.

All obstacles:
- Move from right to left at their defined speed
- Act as shields, protecting zombies behind them
- Must be destroyed before damaging zombies behind them
- Some contain hidden power-ups when destroyed (Bonus Obstacles)
- Bonuses inside obstacles are time-limited and will expire
- Fatal to soldiers upon contact

### Impassable Hazards
- Cannot be destroyed (ex: holes in the road)
- Zombies will stop and stack at these positions
- Fatal to soldiers upon contact
- Strategically placed in level design

## Power-ups and Bonuses

### Bonus Types
Base bonus types that can be extended with various variants:

#### Soldier Reinforcements
- Increase team size
- Improves shooting speed
- Expands lane coverage
- **Variants**: Standard (1 soldier), Double (2 soldiers), Squad (3+ soldiers)

#### Weapon Upgrades
- Improve gun quality factor for shooting speed calculation
- Progression: pistol → rifle → shotgun → machine gun
- **Variants**: Standard Upgrade, High Damage, Rapid Fire, etc.

#### Grenades
- Special attacks that clear all enemies in an area
- Limited usage
- Must be collected as bonuses
- **Variants**: Standard, Wide Effect, High Damage, etc.

#### Sticky grenades
- Special attacks that creates a sticky area that slow enemies
- Limited usage
- Must be collected as bonuses
- **Variants**: Standard, Wide Effect, etc.

### Bonus Sources

#### Bonus Lane Bonuses
- Appear only in the dedicated bonus lane (lane 0)
- Player must move to the bonus lane and touch them to collect
- Disappear when they move off-screen to the left
- Player cannot shoot while in the bonus lane

#### Obstacle Bonuses
- Hidden inside specific obstacles
- Player must destroy the obstacle to reveal the bonus
- Time-limited after appearing (default 8 seconds, customizable)
- Disappear when the timer expires
- Obstacles with bonuses can be specifically placed in level design

## Technical Implementation

### Visual Style
- Pixel art graphics
- Clear visual distinction between different game elements
- Retro aesthetic with modern gameplay mechanics

### Custom Map Editor
- Players can design and play custom maps
- Level design tool allows precise placement of:
  - Enemies with specific types, variants, and positions
  - Obstacles and hazards with customizable properties
  - Bonuses and power-ups
- Spawn zone definition for random entity generation:
  - Define areas where entities spawn during gameplay
  - Set spawn frequency, count, and allowed entity types/variants
  - Configure lane restrictions for spawning
- Maps can be saved and loaded as JSON files
- Developer workflow:
  - Design maps in the editor
  - Save maps as JSON files
  - Copy map data directly into game's level configurations
  - No special import mechanism needed - just simple copy/paste of map data

### Game Flow
1. Player starts with minimal soldiers and basic weapon
2. Each level has a predetermined map layout with strategically placed enemies and hazards
3. Timed countdown begins when level starts
4. Player must navigate between lanes to shoot zombies and collect bonuses
5. Player controls relative speed by moving forward/backward
6. Player must reach finish line before time expires
7. Score based on zombies eliminated, bonuses collected, and time remaining

### Collision Mechanics
1. Zombie stacking: Multiple zombies can occupy the same position
2. Hit priority: When bullets hit multiple stacked zombies, the earliest-spawned zombie takes damage first
3. Obstacle interactions:
   - Normal/Armored zombies: Move at obstacle speed when blocked
   - Giant zombies: Push obstacles at their own speed
   - Soldiers: Die when touching any obstacle or hazard
4. When grenades hit zombies, all zombies in the affected area take damage. Affected area is calculated based on the grenade's variant and point of collision.
5. When sticky grenades hit zombies, it creates a sticky area that slow enemies. Affected area is calculated based on the grenade's variant and point of collision.

### Controls
- Up/Down: Move between lanes
- Auto-shoot when in combat lanes
- Special button for using grenades

## Development Considerations

### HTML5/JavaScript Implementation
- Uses Canvas for pixel-perfect rendering
- Code-based development (no visual editors)
- Can be deployed directly to web servers without installation

### Cross-Platform Support
- Works on desktop browsers
- Mobile-friendly controls
- No installation required

## Level Data Structure

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

## Sample Gameplay Scenario

1. Player starts in a combat lane with 3 soldiers (covering 1 lane)
2. Timer begins counting down as the level starts
3. Player navigates between lanes to avoid impassable hazards and destructible obstacles
4. Player adjusts forward/backward position to control relative speed of incoming objects
   - Moving forward when lanes are clear to progress faster
   - Moving backward when facing multiple threats to gain more reaction time
5. Player observes a group of normal zombies stacking behind an obstacle
6. Player destroys the obstacle, then fires at the zombie stack (hitting them in order of appearance)
7. Player moves to bonus lane to collect soldier reinforcements
8. With 7 soldiers now, player covers 2 lanes
9. Player encounters a giant zombie pushing an obstacle and strategically uses a grenade
10. Player reaches the finish line before time expires, completing the level

---

*This game design document serves as a blueprint for the development of "Zombie Lane Defense" and may be updated as development progresses.*