# Zombie Lane Defense - Developer Clarification Questions

## Project Scope and Timeline

1. **Development Priority**: Which features should be prioritized for the initial release versus features that could be added in post-launch updates?

First, user can build their own map and view their own map to edit. User can see how the map will look like after the spawn of objects.
In the first phase, user can use these elements in the map: unmovable obstacles, normal zombies, bonus to add soldier.

Second, user can play on their created map
Third, user can add additional elements such as: armored zombies, giant zombies, movable obstacles, movable obstacles with bonus, bonus to upgrade weapon, bonus to add grenade, bonus to add sticky grenade. User can control the stats of these elements on the map.
Then we add further features later.

2. **Minimum Viable Product**: What are the core features that must be included in the MVP to consider the game playable and releasable?

minimum viable product: user can build their own map and view their own map to edit. User can see how the map will look like after the spawn of objects. User can use these elements in the map: unmovable obstacles, normal zombies, bonus to add soldier.

3. **Target Platforms**: Are there specific mobile devices or browsers that should be prioritized for testing and optimization?

first target should be desktop using Windows 10 or 11.

4. **Timeline Flexibility**: How flexible is the 15-week development timeline outlined in the development checklist? Are there specific milestones that are more critical than others?

irrelevant considering AI will be developer.

## Gameplay Mechanics

5. **Difficulty Balancing**: What metrics should be used to determine if a level is appropriately challenging? Are there target completion rates or time expectations?

Difficulty configuration should be fine-tuned manually. Feature for difficulty will be updated later.

6. **Soldier Limit**: Is there a maximum number of soldiers the player can have? If so, what happens when the player collects soldier bonuses at the maximum?

No, there is no limit.

7. **Weapon Progression**: How many weapon upgrade levels are planned? Is there a maximum weapon level, and what are the specific multipliers for each upgrade?

Basic weapon is pistol. Next is rifle, then machine gun. Other guns can be added later such as shot gun with wide but short range, or sniper with slow but piercing bullets.
Weapon can be different in round-per-minute, damage, range, effect such as spreading bullets or piercing bullets.
First implemented weapon is pistol with simple effects. For starter, 1 damage, 60 rounds per minute, range: to the end of the screen, effect: hit the first zombie then stop.
Weapon configuration should be fine-tuned manually. Feature for weapon configuration will be updated later.

8. **Grenade Mechanics**: What is the exact area of effect for different grenade types? How is damage calculated for enemies within the blast radius?

area of effects and damage should be fine-tuned manually. For starter, 5 damage to a 3x3 area around the collision (with each unit is 1 lane height).  

9. **Sticky Grenade Mechanics**: How much do sticky grenades slow enemies, and for how long does the effect persist?

area of effects and damage should be fine-tuned manually. For starter, 50% speed reduction to a 3x3 area around the collision (with each unit is 1 lane height).

10. **Lane Switching Speed**: How quickly should the player be able to switch between lanes? Is there a cooldown or animation that affects gameplay?

Player can switch lane right after they press button, but there's a small cooldown (0.5 second, can be updated) to prevent spamming.

## Technical Implementation

11. **Performance Targets**: What are the specific FPS targets for different platforms? What's the minimum acceptable performance on low-end devices?

12fps for all.

12. **Asset Loading Strategy**: Should assets be loaded all at once at game start, or progressively as needed? What's the maximum acceptable initial loading time?

load all at once.

13. **Save System**: Will the game include a save system to track player progress across sessions? If so, what data needs to be persisted?

only save after a match is completed. This feature can be added later.

14. **Analytics Requirements**: What player metrics should be tracked for analysis? Are there specific events or user actions that should be logged?

game is local, no analytics needed.

15. **Browser Compatibility**: What is the minimum browser version support required for each major browser?

chrome 135.0

## Visual and Audio Design

16. **Art Style Consistency**: Are there specific reference images or style guides for the pixel art to ensure consistency across all game elements?

- Aesthetic: Classic 8-bit/16-bit era pixel art with clean, recognizable shapes and limited color palette
- Perspective: Top-down 3/4 view for elements
- Resolution: Low-resolution pixel art (similar to NES/early arcade games)
- Color Depth: Limited color palette (16-32 colors maximum)

17. **Audio Guidelines**: What is the target audio style for sound effects and music? Are there reference tracks or games that should inform the audio design?

take reference from Tank 90

18. **UI Design**: Are there mockups or wireframes for the UI elements? What is the preferred style for menus, HUD, and other interface components?

Match screen:
top lines: show resource stats such as soldier count, weapon type, grenade count, time remaining, map remaining, put menu button at top right corner.  
show the lanes in the middle with different themes such as urban road, jungle, desert, swamp, etc.

Home screen or other screens:
buttons on the left, game picture or map preview, etc on the right

19. **Accessibility Requirements**: Beyond colorblind mode and control remapping, are there other accessibility features that should be implemented?

No need to care about accessibility yet.

## Content and Level Design

20. **Level Count**: How many levels are planned for the initial release? What is the expected playtime for a complete playthrough?

No level yet as we will focus on custom map first.

21. **Enemy Variety**: How many variants of each enemy type should be implemented? Are there specific variant ideas already planned?

one for each type.

22. **Obstacle Variety**: How many variants of each obstacle type should be implemented? Are there specific variant ideas already planned?

one for each type.

23. **Bonus Distribution**: What is the recommended frequency and distribution of bonuses throughout levels to ensure balanced progression?

No need to specify yet as we will focus on custom map first.

24. **Narrative Elements**: Will the game include any story elements or context for the zombie invasion? Should this be incorporated into level design?

No need to specify yet as we will focus on custom map first.

## Testing and Quality Assurance

25. **Test Coverage Expectations**: What is the expected test coverage percentage for the codebase? Are there specific systems that require more thorough testing?

All features in the first few releases should be bug-free.

26. **Playtest Methodology**: Will there be external playtesting? If so, at what development stages and how will feedback be incorporated?

To be discussed later.

27. **Performance Benchmarking**: What specific performance benchmarks should be used to evaluate the game on different devices?

To be discussed later.

28. **Bug Priority Guidelines**: What criteria should be used to categorize bugs by severity? Which types of issues should block release versus being addressed post-launch?

All features in the first few releases should be bug-free.

## Post-Launch Support

29. **Update Frequency**: What is the expected frequency of updates after initial release? Is there a roadmap for post-launch content?

To be discussed later.

30. **Feature Expansion**: Are there specific features planned for post-launch updates that should influence the initial architecture?

No, the architecture already include all features.

31. **Community Engagement**: Will there be mechanisms for players to share custom maps or other user-generated content?

No, game is played locally.

32. **Monetization Plans**: Are there plans to monetize the game in the future (ads, premium content, etc.) that should be considered in the architecture?

No.

## Development Process

33. **Code Review Process**: What is the expected code review process? Are there specific standards or checklists for code reviews?

No information yet.

34. **Documentation Requirements**: Beyond the documentation mentioned in the development checklist, are there specific documentation needs for this project?

No information yet.

36. **Communication Cadence**: What is the expected frequency of progress updates and demos for the project owner?

No information yet.

36. **Decision-Making Process**: For design or implementation decisions not covered in the existing documentation, what is the process for making and documenting these decisions?

No information yet.