/**
 * UI Updaters Module
 *
 * Provides functions for updating the UI elements.
 */

import { globals } from './globals-test.js';
import { createButton, createToggle } from './ui-helpers.js';
import { formatNumber, toDegrees } from './utils.js';
import { PlayerSoldierService } from "../../src/core/player-soldier-service.js";
import { ServiceLocator } from '../../src/core/service-locator.js';

/**
 * Update the entity list panel
 */
export function updateEntityList(selectedEntity = null) {
    const entityList = document.getElementById('entity-list');
    if (!entityList) return;

    entityList.innerHTML = '';

    const entityManager = ServiceLocator.getService('entityManager');
    const entities = entityManager.getAllEntities();

    // Skip lane background entities
    const filteredEntities = entities.filter(entity => !entity.hasTag('lane'));

    if (filteredEntities.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No entities';
        emptyMessage.className = 'empty-message';
        entityList.appendChild(emptyMessage);
        return;
    }

    // Sort entities by ID
    filteredEntities.sort((a, b) => a.id - b.id);

    // Create entity items
    for (const entity of filteredEntities) {
        const entityItem = document.createElement('div');
        entityItem.className = 'entity-item';
        if (selectedEntity && entity.id === selectedEntity.id) {
            entityItem.className += ' selected';
        }

        // Entity header
        const entityHeader = document.createElement('div');
        entityHeader.className = 'entity-header';
        entityHeader.textContent = `Entity ID: ${entity.id}`;
        entityItem.appendChild(entityHeader);

        // Component list
        const componentCount = entity.getComponentCount();
        const componentInfo = document.createElement('div');
        componentInfo.className = 'entity-components';
        componentInfo.textContent = `Components: ${componentCount}`;
        entityItem.appendChild(componentInfo);

        // Tag list
        const tags = entity.getAllTags();
        if (tags.length > 0) {
            const tagList = document.createElement('div');
            tagList.className = 'tag-list';

            for (const tag of tags) {
                const tagItem = document.createElement('span');
                tagItem.className = 'tag-item';
                tagItem.textContent = tag;
                tagList.appendChild(tagItem);
            }

            entityItem.appendChild(tagList);
        }

        entityItem.addEventListener('click', () => {
            globals.selectedEntity = entity;
            updateEntityList();
            updateComponentPanel();
        });

        entityList.appendChild(entityItem);
    }



}
/**
 * Update the component panel
 */
export function updateComponentPanel() {
    const componentList = document.getElementById('component-list');
    if (!componentList) return;

    componentList.innerHTML = '';

    if (!globals.selectedEntity) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No entity selected';
        emptyMessage.className = 'empty-message';
        componentList.appendChild(emptyMessage);
        return;
    }

    // Get all components
    const components = globals.selectedEntity.getAllComponents();
    // Log the entity ID and its components
    console.log(`Entity ID ${globals.selectedEntity.id} has these components:`);
    for (const component of components) {
        console.log(`- Component: ${component.type}`);
        // Log component properties for debugging
        const properties = Object.entries(component)
            .filter(([key]) => !['type', 'entity', 'constructor', 'collidingEntities', 'blockingEntity', 'pushingEntity'].includes(key));
        console.log(`  Properties:`, Object.fromEntries(properties));
    }
    if (globals.selectedEntity.hasTag('player') && globals.player) {
        
        // Display soldier information
        const soldierInfo = document.createElement('div');
        soldierInfo.className = 'component-section';

        // Add soldier positions
        if (globals.player.soldiersByPosition) {
            const positionInfo = document.createElement('p');
            positionInfo.textContent = `Middle: ${globals.player.soldiersByPosition.middle.length}, ` +
                                      `Top: ${globals.player.soldiersByPosition.top.length}, ` +
                                      `Bottom: ${globals.player.soldiersByPosition.bottom.length}`;
            soldierInfo.appendChild(positionInfo);
        }
        
        componentList.appendChild(soldierInfo);
    } else if (globals.selectedEntity.hasTag('player')) {
        console.log(`Entity ID ${globals.selectedEntity.id} is a player but no player object found`);
    }


    if (components.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No components';
        emptyMessage.className = 'empty-message';
        componentList.appendChild(emptyMessage);
        return;
    }

    // Create component items
    for (const component of components) {
        const componentItem = document.createElement('div');
        componentItem.className = 'component-item';

        // Component header
        const componentHeader = document.createElement('div');
        componentHeader.className = 'component-header';
        componentHeader.textContent = `${component.type}`;
        componentItem.appendChild(componentHeader);

        // Component properties
        const componentProperties = document.createElement('div');
        componentProperties.className = 'component-properties';

        // Get component properties
        const properties = Object.entries(component)
            .filter(([key]) => !['type', 'entity', 'constructor', 'collidingEntities', 'blockingEntity', 'pushingEntity'].includes(key));

        // Create property rows
        for (const [key, value] of properties) {
            const propertyRow = document.createElement('div');
            propertyRow.className = 'property-row';

            // Property name
            const propertyName = document.createElement('div');
            propertyName.className = 'property-name';
            propertyName.textContent = key;
            propertyRow.appendChild(propertyName);

            // Property value
            const propertyValue = document.createElement('div');
            propertyValue.className = 'property-value';

            // Create input for editable properties
            if (typeof value === 'number') {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = value;
                input.step = key === 'rotation' ? '0.1' : '1';

                // Show degrees for rotation
                if (key === 'rotation') {
                    input.title = `${formatNumber(toDegrees(value))}°`;
                }

                // Update component when input changes
                input.addEventListener('change', () => {
                    component[key] = parseFloat(input.value);
                });

                propertyValue.appendChild(input);
            } else if (typeof value === 'boolean') {
                const toggle = createToggle(value, (newValue) => {
                    component[key] = newValue;
                });
                propertyValue.appendChild(toggle);
            } else if (typeof value === 'string') {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;

                // Update component when input changes
                input.addEventListener('change', () => {
                    component[key] = input.value;
                });

                propertyValue.appendChild(input);
            } else {
                propertyValue.textContent = String(value);
            }

            propertyRow.appendChild(propertyValue);
            componentProperties.appendChild(propertyRow);
        }

        componentItem.appendChild(componentProperties);
        componentList.appendChild(componentItem);
    }

    // Add tag management
    const tagSection = document.createElement('div');
    tagSection.className = 'component-item';

    // Tag header
    const tagHeader = document.createElement('div');
    tagHeader.className = 'component-header';
    tagHeader.textContent = 'Tags';
    tagSection.appendChild(tagHeader);

    // Current tags
    const currentTags = globals.selectedEntity.getAllTags();

    // Tag list
    const tagList = document.createElement('div');
    tagList.className = 'tag-list';

    for (const tag of currentTags) {
        const tagItem = document.createElement('span');
        tagItem.className = 'tag-item';
        tagItem.textContent = tag;

        // Add remove button
        const removeButton = document.createElement('span');
        removeButton.textContent = ' ×';
        removeButton.style.cursor = 'pointer';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            globals.selectedEntity.removeTag(tag);
            updateComponentPanel();
        });

        tagItem.appendChild(removeButton);
        tagList.appendChild(tagItem);
    }

    tagSection.appendChild(tagList);

    // Add tag input
    const tagInput = document.createElement('div');
    tagInput.className = 'tag-input';
    tagInput.style.marginTop = '5px';
    tagInput.style.display = 'flex';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'New tag';
    input.style.flex = '1';
    input.style.marginRight = '5px';
    input.style.backgroundColor = '#333';
    input.style.color = 'white';
    input.style.border = '1px solid #555';
    input.style.padding = '2px 5px';

    const addButton = createButton('Add', () => {
        const tag = input.value.trim();
        if (tag) {
            globals.selectedEntity.addTag(tag);
            input.value = '';
            updateComponentPanel();
        }
    });

    tagInput.appendChild(input);
    tagInput.appendChild(addButton);

    tagSection.appendChild(tagInput);
    componentList.appendChild(tagSection);
}

/**
 * Update the system panel
 */
export function updateSystemPanel() {
    const systemList = document.getElementById('system-list');
    if (!systemList) return;

    systemList.innerHTML = '';

    // Get all systems
    const systemEntries = Object.entries(globals.systems);

    if (systemEntries.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No systems';
        emptyMessage.className = 'empty-message';
        systemList.appendChild(emptyMessage);
        return;
    }

    // Create system items
    for (const [name, system] of systemEntries) {
        const systemItem = document.createElement('div');
        systemItem.className = 'system-item';

        // System header
        const systemHeader = document.createElement('div');
        systemHeader.className = 'system-header';

        // System name
        const systemName = document.createElement('div');
        systemName.className = 'system-name';
        systemName.textContent = system.name;
        systemHeader.appendChild(systemName);

        // System controls
        const systemControls = document.createElement('div');
        systemControls.className = 'system-controls';
        systemControls.style.display = 'flex';
        systemControls.style.gap = '5px';

        // Toggle system
        const systemToggle = createToggle(system.isEnabled(), (enabled) => {
            if (enabled) {
                system.enable();
            } else {
                system.disable();
            }
        });
        systemControls.appendChild(systemToggle);

        // Run system once
        const runButton = document.createElement('button');
        runButton.className = 'system-run';
        runButton.textContent = 'Run';
        runButton.addEventListener('click', () => {
            // Use a small fixed delta time
            const fixedDeltaTime = 1/60; // 60 FPS

            // Run the system
            system.update(fixedDeltaTime);

        });
        systemControls.appendChild(runButton);

        systemHeader.appendChild(systemControls);
        systemItem.appendChild(systemHeader);

        // System info
        const systemInfo = document.createElement('div');
        systemInfo.className = 'system-info';

        // Required components
        if (system.requiredComponents && system.requiredComponents.length > 0) {
            const requiredComponents = document.createElement('div');
            requiredComponents.textContent = `Required components: ${system.requiredComponents.join(', ')}`;
            systemInfo.appendChild(requiredComponents);
        }

        // Priority
        const priority = document.createElement('div');
        priority.textContent = `Priority: ${system.getPriority()}`;
        systemInfo.appendChild(priority);

        // Entity count (if it's an EntitySystem)
        if (typeof system.getEntities === 'function') {
            const entityCount = document.createElement('div');
            entityCount.textContent = `Entities: ${system.getEntities().length}`;
            systemInfo.appendChild(entityCount);
        }

        systemItem.appendChild(systemInfo);
        systemList.appendChild(systemItem);
    }
}
