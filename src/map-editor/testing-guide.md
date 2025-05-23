# Map Editor Testing Guide

This guide will help you test the Map Editor functionality for Zombie Lane Defense.

## Setup

1. Make sure your development server is running:
   ```
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/src/map-editor/index.html
   ```

## Testing the Map Editor

### Creating a New Map

1. When the Map Editor loads, you should see the map list screen
2. Click on "Create New Map"
3. Enter a name for your map (e.g., "Test Map 1")
4. Enter a length for your map (e.g., 2000)
5. You should now be in the map editor view with lanes displayed

### Adding Entities

1. Click anywhere on a lane to place a Normal Zombie
2. The entity should appear as a red circle
3. Try clicking on different lanes to add more entities

### Selecting and Moving Entities

1. Click on an entity to select it
   - It should be highlighted with a blue outline
2. Click and drag the entity to move it horizontally
   - The entity should follow your mouse cursor
3. Release the mouse button to place the entity

### Editing Entity Properties

1. Double-click on an entity
2. A prompt should appear asking for the entity type
   - Try changing it to "obstacle" or "bonus"
3. Enter the object type (e.g., "Armored" instead of "Normal")
4. Enter the variant (e.g., "Elite" instead of "Standard")
5. The entity should update with the new properties
   - Obstacles appear as orange squares
   - Bonuses appear as green triangles

### Deleting Entities

1. Select an entity by clicking on it
2. Press the Delete key on your keyboard
3. The entity should be removed from the map

### Saving Maps

1. After creating and editing your map, click the "Save to File" button
2. A file download should start
3. The file should be named after your map (e.g., "Test Map 1.json")
4. Check that the file is saved to your downloads folder

### Importing Maps

1. Go back to the map list by clicking the "Back" button
2. Click on "Import Map from File"
3. Select the map file you just saved
4. The map should load and you should be taken to the edit view
5. Verify that all your entities are present and in the correct positions

## Testing the Map Viewer

1. Navigate to:
   ```
   http://localhost:3000/src/map-editor/map-viewer.html
   ```

2. Click "Load Map"
3. Select the map file you created
4. The map should load and display all entities
5. Test the navigation:
   - Click "← Scroll" to move left
   - Click "Scroll →" to move right
   - Verify that entities appear and disappear as you scroll

## Troubleshooting

If you encounter any issues:

1. Check the browser console (F12) for error messages
2. Verify that all files are being loaded correctly
3. Make sure your JSON map file is properly formatted

## Advanced Testing

1. Create multiple maps and switch between them
2. Create a map with many entities (20+) to test performance
3. Create entities at the edges of the map to test boundary handling
4. Try importing an invalid JSON file to test error handling