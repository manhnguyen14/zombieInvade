# Lane-Based Collision System Design

## Problem Summary

We need to design a system for a game where objects move on lanes with the following requirements:

1. Objects can occupy multiple lanes (e.g., occupy lanes 1 and 2)
2. Objects have properties:
    - Speed: innate movement speed
    - Weight: affects group speed calculations during collisions
    - Size: number of lanes occupied

3. When objects collide, they form a group and move at a unified speed
4. Group speed is calculated as the weighted average of all objects in the group:
    - `(sum of each object's speed × weight) ÷ (sum of all weights)`

5. When part of a multi-lane object collides with another object in just one lane, the collision occurs only in that lane
6. Speed is only recalculated when necessary (when collisions occur, not every frame)
7. Objects can separate and regain their original speed when no longer blocked

### Example

When object A (speed 10, weight 4, occupy lane 1 and 2) collide with object B (speed 5, weight 2, occupy lane 1) and object C (speed 5, weight 2, occupy lane 2) from behind, the whole group speed is:
(A.speed * A.weight+B.speed * B.weight+C.speed * C.weight)/(A.weight+B.weight+C.weight)=60/8=7.5

Then object B collide with object D(speed 1, weight 34, occupy lane 1), object C is not blocked and free to go with the speed 5.
the group is now consist of object A, B, D:
(A.speed * A.weight+B.speed * B.weight+D.speed * D.weight)/(A.weight+B.weight+D.weight)=84/40=2.1

## Pseudocode Solution

```
// Object definition
class GameObject {
    float speed;          // Innate speed of the object
    float currentSpeed;   // Current speed (may be affected by collisions)
    int weight;           // Weight for collision calculations
    int[] lanes;          // Array of lane indices occupied by this object
    float position;       // Position on the track
    GameObject[] collidingWith;  // Array of objects this object is colliding with
}

// Function to detect collisions between objects
function detectCollisions(allObjects) {
    // Create a map to track collision groups
    Map<int, List<GameObject>> collisionGroups = new Map();
    
    // Sort objects by position (from front to back)
    sortByPosition(allObjects);
    
    // Create lane occupancy map
    Map<int, List<GameObject>> laneOccupancy = new Map();
    for each lane in totalLanes:
        laneOccupancy[lane] = empty list;
    
    // Fill lane occupancy
    for each object in allObjects:
        for each lane in object.lanes:
            laneOccupancy[lane].add(object);
    
    // Find collision groups
    for each lane in laneOccupancy:
        List<GameObject> objectsInLane = laneOccupancy[lane];
        
        // Sort objects in lane by position
        sortByPosition(objectsInLane);
        
        // Check for collisions
        for i = 1 to objectsInLane.length-1:
            GameObject front = objectsInLane[i-1];
            GameObject back = objectsInLane[i];
            
            // Check if the objects are close enough to collide
            if (back.position + back.currentSpeed > front.position + front.currentSpeed):
                // Create or merge collision groups
                createOrMergeCollisionGroup(collisionGroups, front, back, lane);
    
    // Calculate new speeds for collision groups
    for each group in collisionGroups:
        updateGroupSpeed(group);
    
    return collisionGroups;
}

// Function to create or merge collision groups
function createOrMergeCollisionGroup(collisionGroups, frontObject, backObject, lane) {
    // Check if either object is already in a collision group
    int frontGroupId = findGroupContaining(collisionGroups, frontObject);
    int backGroupId = findGroupContaining(collisionGroups, backObject);
    
    if (frontGroupId == -1 && backGroupId == -1):
        // Create new collision group
        int newGroupId = generateUniqueGroupId();
        collisionGroups[newGroupId] = [frontObject, backObject];
        
        // Record which objects are colliding with which
        frontObject.collidingWith.add(backObject);
        backObject.collidingWith.add(frontObject);
    
    else if (frontGroupId != -1 && backGroupId == -1):
        // Add back object to front object's group
        collisionGroups[frontGroupId].add(backObject);
        
        // Update collision records
        for each object in collisionGroups[frontGroupId]:
            if shares lane with backObject:
                object.collidingWith.add(backObject);
                backObject.collidingWith.add(object);
    
    else if (frontGroupId == -1 && backGroupId != -1):
        // Add front object to back object's group
        collisionGroups[backGroupId].add(frontObject);
        
        // Update collision records
        for each object in collisionGroups[backGroupId]:
            if shares lane with frontObject:
                object.collidingWith.add(frontObject);
                frontObject.collidingWith.add(object);
    
    else if (frontGroupId != backGroupId):
        // Merge the two groups
        mergeGroups(collisionGroups, frontGroupId, backGroupId);
        
        // Update collision records
        for each objectA in former collisionGroups[frontGroupId]:
            for each objectB in former collisionGroups[backGroupId]:
                if shares lane between objectA and objectB:
                    objectA.collidingWith.add(objectB);
                    objectB.collidingWith.add(objectA);
}

// Function to calculate and update speed for a collision group
function updateGroupSpeed(group) {
    float totalWeightedSpeed = 0;
    float totalWeight = 0;
    
    for each object in group:
        totalWeightedSpeed += object.speed * object.weight;
        totalWeight += object.weight;
    
    float newGroupSpeed = totalWeightedSpeed / totalWeight;
    
    // Apply the new speed to all objects in the group
    for each object in group:
        object.currentSpeed = newGroupSpeed;
}

// Function to update positions of all objects
function updatePositions(allObjects, deltaTime) {
    for each object in allObjects:
        object.position += object.currentSpeed * deltaTime;
}

// Function to check if collisions still apply and break groups if needed
function checkAndBreakCollisionGroups(collisionGroups) {
    List<int> groupsToRemove = new List();
    
    for each groupId, objects in collisionGroups:
        // Check if objects in this group still need to be grouped
        // If any two objects aren't directly or indirectly connected, we need to split the group
        
        // Build a graph of collisions within the group
        Graph collisionGraph = buildCollisionGraph(objects);
        
        // Check if the graph is fully connected
        if not isFullyConnected(collisionGraph):
            // Split the group
            List<List<GameObject>> newGroups = findConnectedComponents(collisionGraph);
            
            // Remove the old group
            groupsToRemove.add(groupId);
            
            // Create new groups
            for each newGroup in newGroups:
                if newGroup.size > 1:  // Only create groups with multiple objects
                    int newGroupId = generateUniqueGroupId();
                    collisionGroups[newGroupId] = newGroup;
                    updateGroupSpeed(newGroup);
                else:
                    // Single object, restore original speed
                    newGroup[0].currentSpeed = newGroup[0].speed;
    
    // Remove old groups
    for each groupId in groupsToRemove:
        collisionGroups.remove(groupId);
}

// Main game loop
function gameLoop() {
    // Initialize objects, lanes, etc.
    
    Map<int, List<GameObject>> collisionGroups = new Map();
    
    while (game is running):
        // Process input, etc.
        
        // Only recalculate collisions when needed:
        // - When objects move and potentially collide
        // - When objects separate and can move freely
        
        if (collisionRecalculationNeeded()):
            collisionGroups = detectCollisions(allObjects);
        
        // Check if any collision groups need to be broken
        checkAndBreakCollisionGroups(collisionGroups);
        
        // Update positions
        updatePositions(allObjects, deltaTime);
        
        // Render, etc.
}
```

## When Collision Recalculation is Needed

Collision recalculation is needed in these situations:

1. When an object accelerates or decelerates (changes its innate speed)
2. When a new object enters the game field
3. When an object changes lanes
4. When the distance between objects in the same lane decreases below a threshold
5. At fixed time intervals, but not every frame (optimization)
6. When an object is removed from the game

## Example Scenario Walkthrough

Using the example provided:

1. Object A (speed 10, weight 4, occupies lanes 1,2) approaches and collides with objects B (speed 5, weight 2, lane 1) and C (speed 5, weight 2, lane 2)

2. System detects collision and creates a collision group containing A, B, and C
    - Group speed = (10×4 + 5×2 + 5×2)/(4+2+2) = 60/8 = 7.5
    - All three objects now move at speed 7.5

3. This group approaches object D (speed 1, weight 34, lane 1)
    - Collision is detected between object B and object D in lane 1
    - System merges the collision groups, but notices that C is not directly or indirectly connected to D
    - C is separated from the group, returns to its original speed of 5
    - A and B remain connected to D
    - New group speed for A+B+D = (10×4 + 5×2 + 1×34)/(4+2+34) = 84/40 = 2.1

This system efficiently manages collisions and speed calculations only when necessary, preserving the physical behavior described in the requirements.