# Zombie Lane Defense - Code Best Practices

This document outlines the code best practices that all developers should follow when working on the Zombie Lane Defense project. Following these guidelines will ensure code quality, maintainability, and consistency across the codebase.

## Table of Contents
1. [Code Organization](#code-organization)
2. [Architecture Patterns](#architecture-patterns)
3. [Coding Style](#coding-style)
4. [Performance Optimization](#performance-optimization)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Debugging](#debugging)
8. [Version Control](#version-control)

## Code Organization

### Project Structure
- Follow the established project structure as defined in the architecture document
- Place new files in the appropriate directories based on their functionality
- Maintain separation between core, entity, system, and UI modules

### Module Organization
- Keep modules focused on a single responsibility
- Limit file size to maintain readability (aim for <300 lines per file)
- Group related functionality within appropriate subdirectories
- Use index.js files to expose public APIs from directories

### Import/Export
- Use named exports for better refactoring support
- Avoid circular dependencies between modules
- Keep import statements organized and grouped by type (external libraries, internal modules)
- Minimize dependencies between modules to reduce coupling

## Architecture Patterns

### Entity-Component-System (ECS)
- Keep entities as simple containers for components
- Ensure components store data but no logic
- Implement systems that act on entities with specific components
- Avoid direct communication between systems; use the event bus instead

### Service Locator Pattern
- Register core services through the service locator
- Access services through the locator rather than direct imports
- Create interfaces for services to allow for different implementations
- Use dependency injection in tests to provide mock services

### State Pattern
- Encapsulate state-specific behavior within state classes
- Implement clean transitions between states
- Avoid state-specific code outside of state classes
- Use a state manager to handle state transitions

### Observer Pattern (Event Bus)
- Use the event bus for communication between systems
- Define clear event types and payloads
- Subscribe to only the events needed by each system
- Unsubscribe from events when components are destroyed

## Coding Style

### JavaScript/ES6+ Features
- Use ES6+ features but ensure browser compatibility
- Prefer const over let, and let over var
- Use arrow functions for callbacks and anonymous functions
- Utilize destructuring, spread operators, and template literals for cleaner code
- Implement async/await for asynchronous operations

### Naming Conventions
- Use camelCase for variables, functions, and method names
- Use PascalCase for class names and constructors
- Use UPPER_SNAKE_CASE for constants
- Choose descriptive names that reflect purpose rather than implementation
- Prefix private methods and properties with underscore (_)

### Formatting
- Maintain consistent indentation (2 or 4 spaces)
- Limit line length to 80-100 characters
- Use semicolons at the end of statements
- Place opening braces on the same line as the statement
- Add spaces around operators and after commas

### Code Quality
- Keep functions small and focused (aim for <30 lines)
- Limit function parameters (aim for ≤3 parameters)
- Avoid deep nesting of conditionals and loops
- Extract complex conditions into named functions or variables
- Return early from functions to avoid nested if statements

## Performance Optimization

### Memory Management
- Implement object pooling for frequently created/destroyed objects (bullets, effects)
- Reuse objects to minimize garbage collection
- Avoid creating objects in update loops
- Be cautious with closures that might cause memory leaks

### Rendering Optimization
- Use the canvas efficiently, only redrawing what needs to be updated
- Implement sprite batching for similar entities
- Use requestAnimationFrame for smooth animation
- Consider using off-screen canvases for complex rendering

### Game Loop
- Implement a fixed time step for physics and game logic
- Separate update and render loops if necessary
- Use deltaTime for time-based movement and animations
- Handle variable frame rates gracefully

### Asset Loading
- Implement asset preloading before game start
- Use sprite sheets to reduce the number of image requests
- Compress and optimize assets for web delivery
- Implement progressive loading for large assets

## Testing

### Unit Testing
- Write unit tests for all systems and core functionality
- Use dependency injection to provide mocks for testing
- Focus on testing pure functions and predictable outcomes
- Aim for high test coverage of critical game systems

### Integration Testing
- Test interactions between systems using the event bus
- Verify that events trigger expected behaviors across systems
- Test the full lifecycle of game entities
- Validate game state transitions

### Playtest Automation
- Create automated playtest scenarios to verify game mechanics
- Test edge cases in enemy spawning, collision detection, etc.
- Automate tests for level completion and game over conditions
- Implement regression tests for fixed bugs

### Test-Driven Development
- Consider writing tests before implementing new features
- Use tests to define expected behavior
- Refactor code with confidence using test coverage
- Run tests automatically as part of the build process

## Documentation

### Code Comments
- Document public APIs with JSDoc comments
- Include parameter types, return values, and descriptions
- Document complex algorithms and non-obvious code
- Keep comments up-to-date with code changes

### Architecture Documentation
- Update architecture documents when making significant changes
- Document design decisions and trade-offs
- Maintain diagrams of system interactions
- Document performance considerations and optimizations

### README and Setup
- Maintain clear setup instructions for new developers
- Document development environment requirements
- Include build and test procedures
- Provide troubleshooting guides for common issues

## Debugging

### Debug Tools
- Implement a debug mode with:
  - Hitbox visualization
  - FPS counter
  - Entity inspector
  - Event logging
- Add toggleable logging for different subsystems
- Create developer shortcuts for testing scenarios

### Error Handling
- Implement proper error handling and reporting
- Use try/catch blocks for error-prone operations
- Log meaningful error messages
- Gracefully recover from non-critical errors

### Performance Monitoring
- Implement performance monitoring tools
- Track frame rates and identify bottlenecks
- Monitor memory usage
- Create performance test scenarios

## Version Control

### Commit Practices
- Write clear, descriptive commit messages
- Keep commits focused on a single change or feature
- Reference issue numbers in commit messages
- Commit frequently with smaller changes

### Branching Strategy
- Use feature branches for new development
- Create bug fix branches from the appropriate base
- Follow the project's merge request process
- Keep branches up-to-date with the main branch

### Code Reviews
- Review all code before merging to main branches
- Check for adherence to these best practices
- Verify test coverage for new code
- Ensure documentation is updated appropriately

---

By following these best practices, we can create a robust, maintainable, and high-quality codebase for Zombie Lane Defense. These guidelines should be reviewed and updated periodically as the project evolves.