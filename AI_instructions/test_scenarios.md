
# Zombie Lane Defense - Playtest Scenarios and Edge Cases

## Basic Gameplay Scenarios

### Tutorial Level Playtest
- **Objective**: Verify basic mechanics introduction
- **Setup**: New player, first level with minimal enemies
- **Steps**:
  1. Start with 3 soldiers in a combat lane
  2. Move between lanes using up/down controls
  3. Test auto-shooting functionality in combat lanes
  4. Collect a basic soldier bonus from the bonus lane
  5. Destroy a small obstacle containing a weapon upgrade
  6. Use a grenade against a group of normal zombies
  7. Complete the level by reaching the finish line
- **Expected Results**: Player should understand core mechanics and successfully complete the tutorial

### Standard Level Progression
- **Objective**: Verify difficulty curve across multiple levels
- **Setup**: Play through levels 1-5 sequentially
- **Steps**:
  1. Complete each level with minimal soldier losses
  2. Note increasing enemy count and variety
  3. Track obstacle density and complexity
  4. Measure average completion time per level
- **Expected Results**: Difficulty should increase gradually, with each level requiring more strategic play

## Lane Mechanics Edge Cases

### Lane Coverage Threshold Testing
- **Objective**: Verify lane coverage changes at exact thresholds
- **Setup**: Start with 5 soldiers (covering 1 lane)
- **Steps**:
  1. Collect a single soldier bonus to reach 6 soldiers
  2. Verify coverage expands to 2 lanes immediately
  3. Lose a soldier to drop to 5
  4. Verify coverage returns to 1 lane
  5. Repeat for 10-11 soldier threshold (2-3 lanes)
- **Expected Results**: Lane coverage should change precisely at thresholds (5→6 and 10→11)

### Multi-Lane Shooting Distribution
- **Objective**: Verify shooting mechanics across multiple lanes
- **Setup**: Player with 11+ soldiers (covering 3 lanes)
- **Steps**:
  1. Position player with enemies in all three covered lanes
  2. Observe bullet distribution across lanes
  3. Test with different enemy densities per lane
- **Expected Results**: Shooting should be distributed proportionally across all covered lanes

### Bonus Lane Transition
- **Objective**: Verify shooting stops/starts when entering/exiting bonus lane
- **Setup**: Player in combat lane adjacent to bonus lane
- **Steps**:
  1. Engage enemies in a combat lane
  2. Move to bonus lane and verify shooting stops immediately
  3. Move back to combat lane and verify shooting resumes immediately
  4. Test rapid switching between bonus and combat lanes
- **Expected Results**: Shooting should stop/start precisely when crossing lane boundaries

## Enemy Behavior Edge Cases

### Zombie Stacking Limits
- **Objective**: Test maximum zombie stacking in a single position
- **Setup**: Level with high enemy spawn rate in a single lane
- **Steps**:
  1. Create a bottleneck with an impassable hazard
  2. Allow maximum zombies to stack at the hazard
  3. Test shooting at the stack to verify hit priority
- **Expected Results**: System should handle large stacks without performance issues; earliest-spawned zombies should take damage first

### Giant Zombie Obstacle Interaction
- **Objective**: Verify giant zombies correctly push obstacles
- **Setup**: Level with giant zombies and various obstacle types
- **Steps**:
  1. Observe giant zombie approaching a small obstacle
  2. Verify obstacle moves at giant zombie's speed
  3. Test with medium and large obstacles
  4. Test multiple giants pushing the same obstacle
- **Expected Results**: Obstacles should move at giant zombie speed when pushed

### Enemy Type Collision Priority
- **Objective**: Test collision resolution with mixed enemy types
- **Setup**: Level with normal, armored, and giant zombies in close proximity
- **Steps**:
  1. Create scenario where different enemy types collide with obstacles
  2. Observe movement behavior and priority
  3. Test with multiple obstacle types
- **Expected Results**: Giant zombies should push obstacles, while normal/armored zombies should move at obstacle speed

## Obstacle Interaction Edge Cases

### Obstacle Destruction Bonus Timing
- **Objective**: Verify bonus timer functionality from destroyed obstacles
- **Setup**: Level with bonus-containing obstacles
- **Steps**:
  1. Destroy obstacle to reveal bonus
  2. Wait until just before timer expiration to collect
  3. Destroy multiple bonus obstacles in quick succession
  4. Test extreme case: destroy obstacle but don't collect bonus
- **Expected Results**: Bonuses should disappear exactly when timer expires; multiple timers should function independently

### Obstacle Density Stress Test
- **Objective**: Test game performance with maximum obstacles
- **Setup**: Custom level with high obstacle density
- **Steps**:
  1. Create level with maximum allowed obstacles across all lanes
  2. Navigate through dense obstacle field
  3. Destroy obstacles rapidly to test particle effects and bonus spawning
- **Expected Results**: Game should maintain stable framerate and collision detection should remain accurate

### Obstacle-Enemy Interaction at Screen Edges
- **Objective**: Verify behavior when obstacles and enemies exit/enter screen
- **Setup**: Standard level with obstacles and enemies
- **Steps**:
  1. Allow obstacles to move partially off-screen
  2. Test collision with enemies at screen edges
  3. Verify zombies behind off-screen obstacles behave correctly
- **Expected Results**: Collision detection should work correctly even at screen boundaries

## Bonus Collection Edge Cases

### Rapid Bonus Collection
- **Objective**: Test collecting multiple bonuses in quick succession
- **Setup**: Level with many bonuses in bonus lane and inside obstacles
- **Steps**:
  1. Collect multiple bonus lane items in rapid succession
  2. Destroy multiple bonus-containing obstacles quickly
  3. Alternate between bonus lane and combat lanes rapidly
- **Expected Results**: All bonuses should be correctly applied; no bonuses should be missed due to rapid collection

### Maximum Soldier Count
- **Objective**: Test behavior at maximum allowed soldier count
- **Setup**: Player with near-maximum soldiers
- **Steps**:
  1. Reach maximum allowed soldier count
  2. Attempt to collect additional soldier bonuses
  3. Lose some soldiers and collect bonuses again
- **Expected Results**: System should handle maximum soldier count gracefully; additional bonuses should either be ignored or provide alternative benefits

### Weapon Upgrade Path Testing
- **Objective**: Verify weapon upgrade progression
- **Setup**: Player with basic weapon
- **Steps**:
  1. Collect each weapon upgrade in sequence
  2. Verify shooting speed calculation after each upgrade
  3. Test maximum weapon level behavior
- **Expected Results**: Weapon upgrades should follow correct progression; shooting speed should increase according to formula

## Game Over Conditions Testing

### Time Limit Edge Cases
- **Objective**: Verify time limit functionality
- **Setup**: Level with tight time constraint
- **Steps**:
  1. Play level normally until last few seconds
  2. Test completing level exactly as timer expires
  3. Test failing to complete as timer expires
- **Expected Results**: Game should correctly detect win/loss conditions at exact time expiration

### Last Soldier Standing
- **Objective**: Test behavior with minimal team
- **Setup**: Player with only 1 remaining soldier
- **Steps**:
  1. Navigate with single soldier
  2. Test lane coverage mechanics
  3. Collect soldier bonus to increase team size
  4. Lose last soldier to trigger game over
- **Expected Results**: Game should function correctly with minimal team; game over should trigger immediately when last soldier is lost

### Zombie Crossing Finish Line
- **Objective**: Verify game over when zombie reaches left edge
- **Setup**: Level with fast zombies
- **Steps**:
  1. Allow zombie to approach finish line
  2. Test game over trigger when zombie crosses exact boundary
  3. Test with multiple zombies approaching simultaneously
- **Expected Results**: Game over should trigger precisely when first zombie crosses finish line

## Performance and Stress Testing

### Maximum Entity Count
- **Objective**: Test performance with maximum entities
- **Setup**: Custom level with maximum allowed entities
- **Steps**:
  1. Spawn maximum number of enemies, obstacles, and bonuses
  2. Test with all entities active simultaneously
  3. Measure framerate and response time
- **Expected Results**: Game should maintain playable framerate even with maximum entities

### Rapid Input Testing
- **Objective**: Verify input handling under stress
- **Setup**: Standard level
- **Steps**:
  1. Rapidly switch between lanes
  2. Quickly alternate between forward/backward movement
  3. Spam grenade button while moving between lanes
- **Expected Results**: All inputs should be correctly registered without delay or missed inputs

### Long Session Stability
- **Objective**: Test for memory leaks or performance degradation
- **Setup**: Multiple consecutive levels
- **Steps**:
  1. Play through 10+ levels without restarting
  2. Monitor memory usage and framerate over time
  3. Test with high-action scenarios throughout
- **Expected Results**: Performance should remain stable across extended play sessions

## Cross-Platform Testing

### Mobile Touch Controls
- **Objective**: Verify mobile-specific control scheme
- **Setup**: Game running on various mobile devices
- **Steps**:
  1. Test lane switching with touch controls
  2. Verify grenade activation on touchscreen
  3. Test on different screen sizes and aspect ratios
- **Expected Results**: Controls should be responsive and intuitive on all supported mobile devices

### Browser Compatibility
- **Objective**: Verify game functions across browsers
- **Setup**: Game running on major browsers (Chrome, Firefox, Safari, Edge)
- **Steps**:
  1. Test core gameplay on each browser
  2. Verify canvas rendering consistency
  3. Test audio playback across browsers
- **Expected Results**: Game should function identically across all supported browsers

## Custom Map Editor Testing

### Map Creation and Loading
- **Objective**: Verify map editor functionality
- **Setup**: Map editor interface
- **Steps**:
  1. Create complex map with various entity types
  2. Save map as JSON
  3. Load map into game
  4. Verify all entities appear as placed
- **Expected Results**: Maps should save and load correctly with all entity properties preserved

### Spawn Zone Functionality
- **Objective**: Test random entity generation from spawn zones
- **Setup**: Map with various spawn zone configurations
- **Steps**:
  1. Create spawn zones with different parameters
  2. Play level multiple times to test randomization
  3. Verify entity distribution matches configured weights
- **Expected Results**: Spawn zones should generate entities according to configured parameters with appropriate randomization

## Accessibility Testing

### Colorblind Mode
- **Objective**: Verify game is playable for colorblind users
- **Setup**: Enable colorblind mode (if implemented)
- **Steps**:
  1. Test with various colorblind filters (protanopia, deuteranopia, tritanopia)
  2. Verify all game elements remain distinguishable
- **Expected Results**: All critical game elements should be identifiable without relying solely on color

### Control Remapping
- **Objective**: Test custom control configurations
- **Setup**: Control settings menu (if implemented)
- **Steps**:
  1. Remap controls to alternative keys/buttons
  2. Test gameplay with custom controls
  3. Verify settings persist between sessions
- **Expected Results**: Game should function correctly with remapped controls

## Conclusion

These playtest scenarios and edge cases provide a comprehensive testing framework for Zombie Lane Defense. By systematically testing these scenarios, developers can identify and address potential issues before release, ensuring a polished and enjoyable player experience.

The scenarios are designed to test not only basic functionality but also edge cases that might occur during normal gameplay. Special attention should be paid to performance under stress conditions and behavior at system limits, as these are common sources of bugs in game development.