/**
 * Map Editor UI
 * Handles UI elements for the map editor
 */
export class MapEditorUI {
    constructor(editor) {
        this.editor = editor;
        
        // Entity selection defaults
        this.selectedEntityType = 'enemy';
        this.selectedObjectType = 'normal';
        this.selectedVariant = 'standard';
        
        // UI containers
        this.uiContainer = null;
        this.entityListContainer = null;
        this.controlsContainer = null;
        this.propertiesFormContainer = null;
        this.mapListControlsContainer = null; // New container for map list controls
    }
    
    // Create external UI elements
    createExternalUI() {
        // Create UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'map-editor-ui';
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.right = '0';
        this.uiContainer.style.width = '300px';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.backgroundColor = '#34495e';
        this.uiContainer.style.color = '#ecf0f1';
        this.uiContainer.style.padding = '10px';
        this.uiContainer.style.boxSizing = 'border-box';
        this.uiContainer.style.overflowY = 'auto';
        this.uiContainer.style.zIndex = '100';
        this.uiContainer.style.display = 'none'; // Hide by default
        
        // Create map list controls container
        this.mapListControlsContainer = document.createElement('div');
        this.mapListControlsContainer.id = 'map-list-controls';
        
        // Create controls container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.id = 'controls-container';
        this.controlsContainer.style.marginBottom = '20px';
        
        // Create entity list container
        this.entityListContainer = document.createElement('div');
        this.entityListContainer.id = 'entity-list-container';
        this.entityListContainer.style.display = 'none';
        
        // Create properties form container
        this.propertiesFormContainer = document.createElement('div');
        this.propertiesFormContainer.id = 'properties-form-container';
        this.propertiesFormContainer.style.display = 'none';
        this.propertiesFormContainer.style.position = 'absolute';
        this.propertiesFormContainer.style.top = '50%';
        this.propertiesFormContainer.style.left = '50%';
        this.propertiesFormContainer.style.transform = 'translate(-50%, -50%)';
        this.propertiesFormContainer.style.backgroundColor = '#2c3e50';
        this.propertiesFormContainer.style.padding = '20px';
        this.propertiesFormContainer.style.borderRadius = '5px';
        this.propertiesFormContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        this.propertiesFormContainer.style.zIndex = '200';
        
        // Add containers to UI
        this.uiContainer.appendChild(this.controlsContainer);
        this.uiContainer.appendChild(this.entityListContainer);
        document.body.appendChild(this.uiContainer);
        document.body.appendChild(this.propertiesFormContainer);
        
        // Position the map list controls container inside the canvas
        const canvas = this.editor.canvas;
        
        // Get canvas position and dimensions
        this.mapListControlsContainer.style.position = 'absolute';
        this.mapListControlsContainer.style.zIndex = '50';
        
        document.body.appendChild(this.mapListControlsContainer);
        
        // Create controls
        this.createControls();
        this.createMapListControls();
        
        // Update UI visibility based on current mode
        this.updateUIVisibility();
        
        // Position buttons inside canvas
        this.positionMapListControls();
        
        // Add window resize listener to keep buttons positioned correctly
        window.addEventListener('resize', () => {
            this.positionMapListControls();
        });
    }
    
    // Create control elements
    createControls() {
        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Map Editor';
        title.style.margin = '0 0 20px 0';
        this.controlsContainer.appendChild(title);
        
        // Create back button
        const backButton = document.createElement('button');
        backButton.textContent = 'Back to Map List';
        backButton.style.padding = '8px 15px';
        backButton.style.backgroundColor = '#e74c3c';
        backButton.style.color = '#ecf0f1';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '3px';
        backButton.style.cursor = 'pointer';
        backButton.style.marginBottom = '10px';
        backButton.style.width = '100%';
        backButton.addEventListener('click', () => {
            this.editor.mode = 'list';
            this.entityListContainer.style.display = 'none';
            this.updateUIVisibility(); // Update UI visibility
            this.editor.render();
        });
        this.controlsContainer.appendChild(backButton);
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Map';
        saveButton.style.padding = '8px 15px';
        saveButton.style.backgroundColor = '#2ecc71';
        saveButton.style.color = '#ecf0f1';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '3px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.marginBottom = '10px';
        saveButton.style.width = '100%';
        saveButton.addEventListener('click', () => {
            if (this.editor.currentMap) {
                this.editor.storage.saveMaps(this.editor.maps);
                alert('Map saved successfully');
            }
        });
        this.controlsContainer.appendChild(saveButton);
        
        // Create export button
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export Map to File';
        exportButton.style.padding = '8px 15px';
        exportButton.style.backgroundColor = '#3498db';
        exportButton.style.color = '#ecf0f1';
        exportButton.style.border = 'none';
        exportButton.style.borderRadius = '3px';
        exportButton.style.cursor = 'pointer';
        exportButton.style.marginBottom = '10px';
        exportButton.style.width = '100%';
        exportButton.addEventListener('click', () => {
            if (this.editor.currentMap) {
                this.editor.storage.saveMapToFile(this.editor.currentMap);
            }
        });
        this.controlsContainer.appendChild(exportButton);
        
        // Create play button
        const playButton = document.createElement('button');
        playButton.textContent = 'Play Map';
        playButton.style.padding = '8px 15px';
        playButton.style.backgroundColor = '#9b59b6';
        playButton.style.color = '#ecf0f1';
        playButton.style.border = 'none';
        playButton.style.borderRadius = '3px';
        playButton.style.cursor = 'pointer';
        playButton.style.marginBottom = '20px';
        playButton.style.width = '100%';
        playButton.addEventListener('click', () => {
            this.editor.playCurrentMap();
        });
        this.controlsContainer.appendChild(playButton);
        
        // Create debug button
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug Map';
        debugButton.style.padding = '8px 15px';
        debugButton.style.backgroundColor = '#f39c12';
        debugButton.style.color = '#ecf0f1';
        debugButton.style.border = 'none';
        debugButton.style.borderRadius = '3px';
        debugButton.style.cursor = 'pointer';
        debugButton.style.marginBottom = '20px';
        debugButton.style.width = '100%';
        debugButton.addEventListener('click', () => {
            this.editor.debugCurrentMap();
        });
        this.controlsContainer.appendChild(debugButton);
        
        // Create entity type selection
        const entityTypeLabel = document.createElement('label');
        entityTypeLabel.textContent = 'Entity Type:';
        entityTypeLabel.style.display = 'block';
        entityTypeLabel.style.marginBottom = '5px';
        this.controlsContainer.appendChild(entityTypeLabel);
        
        const entityTypeSelect = document.createElement('select');
        entityTypeSelect.id = 'entity-type-select';
        entityTypeSelect.style.width = '100%';
        entityTypeSelect.style.padding = '5px';
        entityTypeSelect.style.backgroundColor = '#34495e';
        entityTypeSelect.style.color = '#ecf0f1';
        entityTypeSelect.style.border = '1px solid #7f8c8d';
        entityTypeSelect.style.borderRadius = '3px';
        entityTypeSelect.style.marginBottom = '10px';
        
        const entityTypes = [
            { value: 'enemy', text: 'Enemy' },
            { value: 'obstacle', text: 'Obstacle' },
            { value: 'bonus', text: 'Bonus' }
        ];
        
        entityTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.text;
            entityTypeSelect.appendChild(option);
        });
        
        entityTypeSelect.addEventListener('change', () => {
            this.selectedEntityType = entityTypeSelect.value;
            
            // Update object type options
            this.populateObjectTypeOptions(objectTypeSelect, this.selectedEntityType);
            
            // Update variant options
            this.populateVariantOptions(variantSelect, this.selectedEntityType, this.selectedObjectType);
        });
        
        this.controlsContainer.appendChild(entityTypeSelect);
        
        // Create object type selection
        const objectTypeLabel = document.createElement('label');
        objectTypeLabel.textContent = 'Object Type:';
        objectTypeLabel.style.display = 'block';
        objectTypeLabel.style.marginBottom = '5px';
        this.controlsContainer.appendChild(objectTypeLabel);
        
        const objectTypeSelect = document.createElement('select');
        objectTypeSelect.id = 'object-type-select';
        objectTypeSelect.style.width = '100%';
        objectTypeSelect.style.padding = '5px';
        objectTypeSelect.style.backgroundColor = '#34495e';
        objectTypeSelect.style.color = '#ecf0f1';
        objectTypeSelect.style.border = '1px solid #7f8c8d';
        objectTypeSelect.style.borderRadius = '3px';
        objectTypeSelect.style.marginBottom = '10px';
        
        // Populate object type options
        this.populateObjectTypeOptions(objectTypeSelect, this.selectedEntityType);
        
        objectTypeSelect.addEventListener('change', () => {
            this.selectedObjectType = objectTypeSelect.value;
            
            // Update variant options
            this.populateVariantOptions(variantSelect, this.selectedEntityType, this.selectedObjectType);
        });
        
        this.controlsContainer.appendChild(objectTypeSelect);
        
        // Create variant selection
        const variantLabel = document.createElement('label');
        variantLabel.textContent = 'Variant:';
        variantLabel.style.display = 'block';
        variantLabel.style.marginBottom = '5px';
        this.controlsContainer.appendChild(variantLabel);

        const variantSelect = document.createElement('select');
        variantSelect.id = 'variant-select';
        variantSelect.style.width = '100%';
        variantSelect.style.padding = '5px';
        variantSelect.style.backgroundColor = '#34495e';
        variantSelect.style.color = '#ecf0f1';
        variantSelect.style.border = '1px solid #7f8c8d';
        variantSelect.style.borderRadius = '3px';
        variantSelect.style.marginBottom = '20px';

        // Populate variant options
        this.selectedVariant = this.populateVariantOptions(variantSelect, this.selectedEntityType, this.selectedObjectType);

        variantSelect.addEventListener('change', () => {
            this.selectedVariant = variantSelect.value;
            console.log(`Variant changed to: ${this.selectedVariant}`);
        });

        this.controlsContainer.appendChild(variantSelect);
        
        // Add embedded bonus checkbox
        const embedBonusContainer = document.createElement('div');
        embedBonusContainer.style.marginBottom = '10px';

        const embedBonusCheckbox = document.createElement('input');
        embedBonusCheckbox.type = 'checkbox';
        embedBonusCheckbox.id = 'embed-bonus-checkbox';
        embedBonusCheckbox.style.marginRight = '5px';

        const embedBonusLabel = document.createElement('label');
        embedBonusLabel.textContent = 'Add Embedded Bonus';
        embedBonusLabel.htmlFor = 'embed-bonus-checkbox';

        embedBonusContainer.appendChild(embedBonusCheckbox);
        embedBonusContainer.appendChild(embedBonusLabel);
        this.controlsContainer.appendChild(embedBonusContainer);

        // Create embedded bonus type selection (initially hidden)
        const embedBonusTypeContainer = document.createElement('div');
        embedBonusTypeContainer.id = 'embed-bonus-type-container';
        embedBonusTypeContainer.style.display = 'none';
        embedBonusTypeContainer.style.marginBottom = '10px';

        const embedBonusTypeLabel = document.createElement('label');
        embedBonusTypeLabel.textContent = 'Bonus Type:';
        embedBonusTypeLabel.style.display = 'block';
        embedBonusTypeLabel.style.marginBottom = '5px';
        embedBonusTypeContainer.appendChild(embedBonusTypeLabel);

        const embedBonusTypeSelect = document.createElement('select');
        embedBonusTypeSelect.id = 'embed-bonus-type-select';
        embedBonusTypeSelect.style.width = '100%';
        embedBonusTypeSelect.style.padding = '5px';
        embedBonusTypeSelect.style.backgroundColor = '#34495e';
        embedBonusTypeSelect.style.color = '#ecf0f1';
        embedBonusTypeSelect.style.border = '1px solid #7f8c8d';
        embedBonusTypeSelect.style.borderRadius = '3px';
        embedBonusTypeSelect.style.marginBottom = '10px';

        const bonusTypes = [
            { value: 'random', text: 'Random' },
            { value: 'soldier', text: 'Soldier' },
            { value: 'gun', text: 'Gun' },
            { value: 'grenade', text: 'Grenade' }
        ];

        bonusTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.text;
            embedBonusTypeSelect.appendChild(option);
        });

        embedBonusTypeContainer.appendChild(embedBonusTypeSelect);

        // Create embedded bonus variant selection
        const embedBonusVariantLabel = document.createElement('label');
        embedBonusVariantLabel.textContent = 'Bonus Variant:';
        embedBonusVariantLabel.style.display = 'block';
        embedBonusVariantLabel.style.marginBottom = '5px';
        embedBonusTypeContainer.appendChild(embedBonusVariantLabel);

        const embedBonusVariantSelect = document.createElement('select');
        embedBonusVariantSelect.id = 'embed-bonus-variant-select';
        embedBonusVariantSelect.style.width = '100%';
        embedBonusVariantSelect.style.padding = '5px';
        embedBonusVariantSelect.style.backgroundColor = '#34495e';
        embedBonusVariantSelect.style.color = '#ecf0f1';
        embedBonusVariantSelect.style.border = '1px solid #7f8c8d';
        embedBonusVariantSelect.style.borderRadius = '3px';

        // Populate initial variants
        this.populateEmbedBonusVariants(embedBonusVariantSelect, 'soldier');

        embedBonusTypeContainer.appendChild(embedBonusVariantSelect);
        this.controlsContainer.appendChild(embedBonusTypeContainer);

        // Add event listeners
        embedBonusCheckbox.addEventListener('change', () => {
            embedBonusTypeContainer.style.display = embedBonusCheckbox.checked ? 'block' : 'none';
        });

        embedBonusTypeSelect.addEventListener('change', () => {
            const selectedType = embedBonusTypeSelect.value;
            if (selectedType !== 'random') {
                this.populateEmbedBonusVariants(embedBonusVariantSelect, selectedType);
            } else {
                // For random, just show "Random" option
                embedBonusVariantSelect.innerHTML = '';
                const option = document.createElement('option');
                option.value = 'random';
                option.textContent = 'Random';
                embedBonusVariantSelect.appendChild(option);
            }
        });
        
        // Create add entity button
        const addEntityButton = document.createElement('button');
        addEntityButton.textContent = 'Add Entity';
        addEntityButton.style.padding = '8px 15px';
        addEntityButton.style.backgroundColor = '#2ecc71';
        addEntityButton.style.color = '#ecf0f1';
        addEntityButton.style.border = 'none';
        addEntityButton.style.borderRadius = '3px';
        addEntityButton.style.cursor = 'pointer';
        addEntityButton.style.marginBottom = '10px';
        addEntityButton.style.width = '100%';
        addEntityButton.addEventListener('click', () => {
            this.editor.entityManager.showAddEntityDialog();
        });
        this.controlsContainer.appendChild(addEntityButton);
        
        // Create delete entity button
        const deleteEntityButton = document.createElement('button');
        deleteEntityButton.id = 'delete-entity-button';
        deleteEntityButton.textContent = 'Delete Selected Entity';
        deleteEntityButton.style.padding = '8px 15px';
        deleteEntityButton.style.backgroundColor = '#e74c3c';
        deleteEntityButton.style.color = '#ecf0f1';
        deleteEntityButton.style.border = 'none';
        deleteEntityButton.style.borderRadius = '3px';
        deleteEntityButton.style.cursor = 'pointer';
        deleteEntityButton.style.marginBottom = '20px';
        deleteEntityButton.style.width = '100%';
        deleteEntityButton.style.display = 'none';
        deleteEntityButton.addEventListener('click', () => {
            this.editor.deleteSelectedEntity();
        });
        this.controlsContainer.appendChild(deleteEntityButton);
        
        // Create entity list toggle button
        const toggleEntityListButton = document.createElement('button');
        toggleEntityListButton.textContent = 'Show Entity List';
        toggleEntityListButton.style.padding = '8px 15px';
        toggleEntityListButton.style.backgroundColor = '#3498db';
        toggleEntityListButton.style.color = '#ecf0f1';
        toggleEntityListButton.style.border = 'none';
        toggleEntityListButton.style.borderRadius = '3px';
        toggleEntityListButton.style.cursor = 'pointer';
        toggleEntityListButton.style.marginBottom = '10px';
        toggleEntityListButton.style.width = '100%';
        toggleEntityListButton.addEventListener('click', () => {
            this.editor.showEntityList = !this.editor.showEntityList;
            toggleEntityListButton.textContent = this.editor.showEntityList ? 'Hide Entity List' : 'Show Entity List';
            this.entityListContainer.style.display = this.editor.showEntityList ? 'block' : 'none';
        });
        this.controlsContainer.appendChild(toggleEntityListButton);
    }
    
    // Update the entity list in the UI
    updateEntityList() {
        if (!this.entityListElement) return;
        
        // Clear the list
        this.entityListElement.innerHTML = '';
        
        if (!this.editor.currentMap || !this.editor.currentMap.objects.length) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = 'No entities in map';
            emptyMessage.style.color = '#7f8c8d';
            emptyMessage.style.padding = '10px';
            this.entityListElement.appendChild(emptyMessage);
            return;
        }
        
        // Add entities to the list
        for (const entity of this.editor.currentMap.objects) {
            const entityItem = document.createElement('div');
            entityItem.className = 'entity-item';
            entityItem.style.padding = '8px';
            entityItem.style.marginBottom = '5px';
            entityItem.style.backgroundColor = entity === this.editor.selectedEntity ? '#3498db' : '#34495e';
            entityItem.style.borderRadius = '3px';
            entityItem.style.cursor = 'pointer';
            
            // Create entity info
            const entityInfo = document.createElement('div');
            entityInfo.textContent = `ID: ${entity.id} - ${entity.type} (${entity.objectType})`;
            entityInfo.style.marginBottom = '3px';
            
            const entityDetails = document.createElement('div');
            entityDetails.textContent = `Lane: ${entity.lane}, Position: ${entity.position}`;
            entityDetails.style.fontSize = '12px';
            entityDetails.style.color = '#bdc3c7';
            
            entityItem.appendChild(entityInfo);
            entityItem.appendChild(entityDetails);
            
            entityItem.addEventListener('click', () => {
                this.editor.selectedEntity = entity;
                this.editor.centerViewportOnEntity(entity);
                this.updateDeleteButtonVisibility();
                this.updateEntityList();
            });
            
            this.entityListElement.appendChild(entityItem);
        }
    }
    
    // Update delete button visibility
    updateDeleteButtonVisibility() {
        if (this.deleteButton) {
            this.deleteButton.style.display = this.editor.selectedEntity ? 'block' : 'none';
        }
    }
    
    // Populate object type options based on entity type
    populateObjectTypeOptions(selectElement, entityType, selectedValue) {
        console.log(`[UI] Populating object types for entity type: ${entityType}`);
        selectElement.innerHTML = ''; // Clear existing options
        
        let options = [];
        
        switch (entityType) {
            case 'enemy':
                options = [
                    { value: 'normal', text: 'normal zombie' },
                    { value: 'armored', text: 'armored zombie' },
                    { value: 'giant', text: 'giant zombie' }
                ];
                break;
            case 'obstacle':
                options = [
                    { value: 'small', text: 'small obstacle' },
                    { value: 'medium', text: 'medium obstacle' },
                    { value: 'large', text: 'large obstacle' },
                    { value: 'hazard', text: 'impassible hazard' }
                ];
                break;
            case 'bonus':
                options = [
                    { value: 'soldier', text: 'soldier' },
                    { value: 'gun', text: 'gun' },
                    { value: 'grenade', text: 'grenade' }
                ];
                break;
        }
        
        console.log(`[UI] Available object types: ${options.map(o => o.value).join(', ')}`);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === selectedValue) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        });
        
        // If no option is selected, select the first one
        if (selectElement.selectedIndex === -1 && selectElement.options.length > 0) {
            selectElement.selectedIndex = 0;
            this.selectedObjectType = selectElement.value;
            console.log(`[UI] No object type selected, defaulting to: ${this.selectedObjectType}`);
        } else if (selectElement.selectedIndex !== -1) {
            this.selectedObjectType = selectElement.value;
            console.log(`[UI] Selected object type: ${this.selectedObjectType}`);
        }
        
        return this.selectedObjectType;
    }
    
    // Populate variant options based on entity type and object type
    populateVariantOptions(selectElement, entityType, objectType, selectedValue) {
        console.log(`[UI] Populating variants for entity type: ${entityType}, object type: ${objectType}`);
        selectElement.innerHTML = ''; // Clear existing options
        
        let options = [];
        
        // Convert to lowercase for consistent comparison
        const entityTypeLower = entityType.toLowerCase();
        const objectTypeLower = objectType ? objectType.toLowerCase() : '';
        
        if (entityTypeLower === 'enemy') {
            switch (objectTypeLower) {
                case 'normal':
                    options = [
                        { value: 'standard', text: 'standard' },
                        { value: 'crawler', text: 'crawler' },
                        { value: 'runner', text: 'runner' }
                    ];
                    break;
                case 'armored':
                    options = [
                        { value: 'standard', text: 'standard' },
                        { value: 'heavy', text: 'heavy' }
                    ];
                    break;
                case 'giant':
                    options = [
                        { value: 'standard', text: 'standard' },
                        { value: 'tank', text: 'tank' },
                        { value: 'berserker', text: 'berserker' }
                    ];
                    break;
            }
        } else if (entityTypeLower === 'obstacle') {
            switch (objectTypeLower) {
                case 'small':
                    options = [
                        {value: 'standard', text: 'standard'},
                        {value: 'barricade', text: 'barricade'},
                        {value: 'crate', text: 'crate'},
                        {value: 'trashCan', text: 'trashCan'}
                    ];
                    break;
                case 'medium':
                    options = [
                        {value: 'standard', text: 'standard'},
                        {value: 'car', text: 'car'},
                        {value: 'dumpster', text: 'dumpster'},
                        {value: 'fence', text: 'fence'}
                    ];
                    break;
                case 'large':
                    options = [
                        {value: 'standard', text: 'standard'},
                        {value: 'bus', text: 'bus'},
                        {value: 'truck', text: 'truck'},
                        {value: 'wall', text: 'wall'}
                    ];
                    break;
                case 'hazard':
                    options = [
                        { value: 'standard', text: 'standard' },
                        { value: 'hole', text: 'hole' },
                        { value: 'spikes', text: 'spikes' },
                        { value: 'fire', text: 'fire' },
                        { value: 'toxic', text: 'toxic' }
                    ];
                    break;
            }
        } else if (entityTypeLower === 'bonus') {
            switch (objectTypeLower) {
                case 'soldier':
                    options = [
                        { value: 'standard', text: 'standard' }
                    ];
                    break;
                case 'gun':
                    options = [
                        { value: 'ak47', text: 'AK-47' }
                    ];
                    break;
                case 'grenade':
                    options = [
                        { value: 'standard', text: 'standard' },
                        { value: 'sticky', text: 'sticky' }
                    ];
                    break;
            }
        }
        
        console.log(`[UI] Available variants: ${options.map(o => o.value).join(', ')}`);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (option.value === selectedValue) {
                optionElement.selected = true;
            }
            selectElement.appendChild(optionElement);
        });
        
        // If no option is selected, select the first one
        if (selectElement.selectedIndex === -1 && selectElement.options.length > 0) {
            selectElement.selectedIndex = 0;
            this.selectedVariant = selectElement.value;
            console.log(`[UI] No variant selected, defaulting to: ${this.selectedVariant}`);
        } else if (selectElement.selectedIndex !== -1) {
            this.selectedVariant = selectElement.value;
            console.log(`[UI] Selected variant: ${this.selectedVariant}`);
        }
        
        return this.selectedVariant;
    }
    
    // Show entity properties dialog
    showEntityPropertiesDialog(entity) {
        // Clear the properties form container
        this.propertiesFormContainer.innerHTML = '';
        this.propertiesFormContainer.style.display = 'block';
        
        // Create a form for editing entity properties
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '10px';
        
        // Add form title
        const title = document.createElement('h3');
        title.textContent = 'Edit Entity Properties';
        title.style.margin = '0 0 10px 0';
        form.appendChild(title);
        
        // Entity type dropdown
        const typeContainer = document.createElement('div');
        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Entity Type:';
        typeLabel.style.display = 'block';
        typeLabel.style.marginBottom = '5px';
        typeContainer.appendChild(typeLabel);
        
        const typeSelect = document.createElement('select');
        typeSelect.id = 'entity-type';
        typeSelect.style.width = '100%';
        typeSelect.style.padding = '5px';
        typeSelect.style.backgroundColor = '#34495e';
        typeSelect.style.color = '#ecf0f1';
        typeSelect.style.border = '1px solid #7f8c8d';
        typeSelect.style.borderRadius = '3px';
        
        const entityTypes = [
            { value: 'enemy', text: 'Enemy' },
            { value: 'obstacle', text: 'Obstacle' },
            { value: 'bonus', text: 'Bonus' }
        ];
        
        entityTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.text;
            if (entity.type === type.value) {
                option.selected = true;
            }
            typeSelect.appendChild(option);
        });
        
        typeContainer.appendChild(typeSelect);
        form.appendChild(typeContainer);
        
        // Object type dropdown
        const objectTypeContainer = document.createElement('div');
        const objectTypeLabel = document.createElement('label');
        objectTypeLabel.textContent = 'Object Type:';
        objectTypeLabel.style.display = 'block';
        objectTypeLabel.style.marginBottom = '5px';
        objectTypeContainer.appendChild(objectTypeLabel);
        
        const objectTypeSelect = document.createElement('select');
        objectTypeSelect.id = 'object-type';
        objectTypeSelect.style.width = '100%';
        objectTypeSelect.style.padding = '5px';
        objectTypeSelect.style.backgroundColor = '#34495e';
        objectTypeSelect.style.color = '#ecf0f1';
        objectTypeSelect.style.border = '1px solid #7f8c8d';
        objectTypeSelect.style.borderRadius = '3px';
        
        // Populate object type options based on entity type
        this.populateObjectTypeOptions(objectTypeSelect, entity.type, entity.objectType);
        
        objectTypeContainer.appendChild(objectTypeSelect);
        form.appendChild(objectTypeContainer);
        
        // Variant dropdown
        const variantContainer = document.createElement('div');
        const variantLabel = document.createElement('label');
        variantLabel.textContent = 'Variant:';
        variantLabel.style.display = 'block';
        variantLabel.style.marginBottom = '5px';
        variantContainer.appendChild(variantLabel);
        
        const variantSelect = document.createElement('select');
        variantSelect.id = 'variant';
        variantSelect.style.width = '100%';
        variantSelect.style.padding = '5px';
        variantSelect.style.backgroundColor = '#34495e';
        variantSelect.style.color = '#ecf0f1';
        variantSelect.style.border = '1px solid #7f8c8d';
        variantSelect.style.borderRadius = '3px';
        
        // Populate variant options based on entity type and object type
        this.populateVariantOptions(variantSelect, entity.type, entity.objectType, entity.variant);
        
        variantContainer.appendChild(variantSelect);
        form.appendChild(variantContainer);
        
        // Lane input
        const laneContainer = document.createElement('div');
        const laneLabel = document.createElement('label');
        laneLabel.textContent = 'Lane:';
        laneLabel.style.display = 'block';
        laneLabel.style.marginBottom = '5px';
        laneContainer.appendChild(laneLabel);
        
        const laneInput = document.createElement('input');
        laneInput.id = 'lane';
        laneInput.type = 'number';
        laneInput.min = entity.type === 'bonus' ? '0' : '1';
        laneInput.max = (this.editor.laneCount - 1).toString();
        laneInput.value = entity.lane;
        laneInput.style.width = '100%';
        laneInput.style.padding = '5px';
        laneInput.style.backgroundColor = '#34495e';
        laneInput.style.color = '#ecf0f1';
        laneInput.style.border = '1px solid #7f8c8d';
        laneInput.style.borderRadius = '3px';
        
        laneContainer.appendChild(laneInput);
        form.appendChild(laneContainer);
        
        // Position input
        const positionContainer = document.createElement('div');
        const positionLabel = document.createElement('label');
        positionLabel.textContent = 'Position:';
        positionLabel.style.display = 'block';
        positionLabel.style.marginBottom = '5px';
        positionContainer.appendChild(positionLabel);
        
        const positionInput = document.createElement('input');
        positionInput.id = 'position';
        positionInput.type = 'number';
        positionInput.min = '0';
        positionInput.value = entity.position;
        positionInput.style.width = '100%';
        positionInput.style.padding = '5px';
        positionInput.style.backgroundColor = '#34495e';
        positionInput.style.color = '#ecf0f1';
        positionInput.style.border = '1px solid #7f8c8d';
        positionInput.style.borderRadius = '3px';
        
        positionContainer.appendChild(positionInput);
        form.appendChild(positionContainer);
        
        // Add event listeners for type changes
        typeSelect.addEventListener('change', () => {
            const selectedType = typeSelect.value;
            
            // Update lane input min based on entity type
            laneInput.min = selectedType === 'bonus' ? '0' : '1';
            
            // If changing to bonus and lane is not 0, set it to 0
            if (selectedType === 'bonus' && parseInt(laneInput.value) !== 0) {
                laneInput.value = '0';
            }
            
            // If changing from bonus and lane is 0, set it to 1
            if (selectedType !== 'bonus' && parseInt(laneInput.value) === 0) {
                laneInput.value = '1';
            }
            
            // Update object type options
            this.populateObjectTypeOptions(objectTypeSelect, selectedType, null);
            
            // Update variant options
            this.populateVariantOptions(variantSelect, selectedType, objectTypeSelect.value, null);
        });
        
        objectTypeSelect.addEventListener('change', () => {
            // Update variant options
            this.populateVariantOptions(variantSelect, typeSelect.value, objectTypeSelect.value, null);
        });
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '10px';
        
        const saveButton = document.createElement('button');
        saveButton.type = 'submit';
        saveButton.textContent = 'Save Changes';
        saveButton.style.padding = '8px 15px';
        saveButton.style.backgroundColor = '#2ecc71';
        saveButton.style.color = '#ecf0f1';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '3px';
        saveButton.style.cursor = 'pointer';
        
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-btn';
        cancelButton.type = 'button';
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '8px 15px';
        cancelButton.style.backgroundColor = '#e74c3c';
        cancelButton.style.color = '#ecf0f1';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '3px';
        cancelButton.style.cursor = 'pointer';
        
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);
        form.appendChild(buttonContainer);
        
        this.propertiesFormContainer.appendChild(form);
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newType = document.getElementById('entity-type').value;
            const newLane = parseInt(document.getElementById('lane').value);
            
            // Validate lane based on entity type
            if (newType === 'bonus' && newLane !== 0) {
                alert('Bonuses can only be placed in the bonus lane (lane 0)');
                return;
            } else if (newType !== 'bonus' && newLane === 0) {
                alert('Only bonuses can be placed in the bonus lane (lane 0)');
                return;
            }
            
            entity.type = newType;
            entity.objectType = document.getElementById('object-type').value;
            entity.variant = document.getElementById('variant').value;
            entity.lane = newLane;
            entity.position = parseInt(document.getElementById('position').value);
            
            this.propertiesFormContainer.style.display = 'none';
            this.updateEntityList();
            this.editor.render();
        });
        
        // Handle cancel button
        cancelButton.addEventListener('click', () => {
            this.propertiesFormContainer.style.display = 'none';
        });
    }
    
    // Add this method to the MapEditorUI class
    populateEmbedBonusVariants(selectElement, bonusType) {
        selectElement.innerHTML = ''; // Clear existing options
        
        let options = [];
        
        switch (bonusType) {
            case 'soldier':
                options = [
                    { value: 'standard', text: 'Standard' }
                ];
                break;
            case 'gun':
                options = [
                    { value: 'ak47', text: 'AK-47' },
                    { value: 'desert_eagle', text: 'Desert Eagle' },
                    { value: 'benelli_m4', text: 'Benelli M4' },
                    { value: 'barrett_xm109', text: 'Barrett XM109' }
                ];
                break;
            case 'grenade':
                options = [
                    { value: 'standard', text: 'Standard' },
                    { value: 'sticky', text: 'Sticky' }
                ];
                break;
        }
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            selectElement.appendChild(optionElement);
        });
        
        // Select first option by default
        if (selectElement.options.length > 0) {
            selectElement.selectedIndex = 0;
        }
    }
    
    // Position map list controls inside the canvas
    positionMapListControls() {
        const canvas = this.editor.canvas;
        const canvasRect = canvas.getBoundingClientRect();
        
        // Position at the bottom of the canvas with padding
        const bottomPadding = 20; // Padding from bottom of canvas
        
        this.mapListControlsContainer.style.position = 'absolute';
        this.mapListControlsContainer.style.bottom = `${window.innerHeight - canvasRect.bottom + bottomPadding}px`;
        this.mapListControlsContainer.style.left = `${canvasRect.left + canvasRect.width/2}px`;
        this.mapListControlsContainer.style.transform = 'translateX(-50%)';
        this.mapListControlsContainer.style.zIndex = '100'; // Ensure buttons are above canvas
    }
    
    // Create map list control elements
    createMapListControls() {
        // Create container for buttons in a row
        this.mapListControlsContainer.style.display = 'flex';
        this.mapListControlsContainer.style.flexDirection = 'row';
        this.mapListControlsContainer.style.gap = '10px';
        this.mapListControlsContainer.style.width = 'auto';
        
        // Create back to home button (first)
        const backToHomeButton = document.createElement('button');
        backToHomeButton.textContent = 'Back';
        backToHomeButton.style.padding = '10px 20px';
        backToHomeButton.style.backgroundColor = '#e74c3c';
        backToHomeButton.style.color = '#ecf0f1';
        backToHomeButton.style.border = 'none';
        backToHomeButton.style.borderRadius = '5px';
        backToHomeButton.style.cursor = 'pointer';
        backToHomeButton.style.fontSize = '16px';
        backToHomeButton.addEventListener('click', () => {
            window.location.href = '../ui/home-screen.html';
        });
        this.mapListControlsContainer.appendChild(backToHomeButton);
        
        // Create new map button (second)
        const createNewMapButton = document.createElement('button');
        createNewMapButton.textContent = 'Create';
        createNewMapButton.style.padding = '10px 20px';
        createNewMapButton.style.backgroundColor = '#2ecc71';
        createNewMapButton.style.color = '#ecf0f1';
        createNewMapButton.style.border = 'none';
        createNewMapButton.style.borderRadius = '5px';
        createNewMapButton.style.cursor = 'pointer';
        createNewMapButton.style.fontSize = '16px';
        createNewMapButton.addEventListener('click', () => {
            this.editor.showCreateMapDialog();
        });
        this.mapListControlsContainer.appendChild(createNewMapButton);
        
        // Create import map button (third)
        const importMapButton = document.createElement('button');
        importMapButton.textContent = 'Import';
        importMapButton.style.padding = '10px 20px';
        importMapButton.style.backgroundColor = '#3498db';
        importMapButton.style.color = '#ecf0f1';
        importMapButton.style.border = 'none';
        importMapButton.style.borderRadius = '5px';
        importMapButton.style.cursor = 'pointer';
        importMapButton.style.fontSize = '16px';
        importMapButton.addEventListener('click', () => {
            // Handle import map functionality
            this.editor.storage.importMapFromFile()
                .then(importedMap => {
                    // Refresh the maps list
                    this.editor.maps = this.editor.storage.loadMaps();
                    
                    // Set the current map to the imported map
                    this.editor.currentMap = importedMap;
                    
                    // Switch to edit mode
                    this.editor.mode = 'edit';
                    this.editor.viewportOffset = 0;
                    
                    // Update UI and render
                    this.updateUIVisibility();
                    this.editor.render();
                    
                    // Show success message
                    alert('Map imported successfully!');
                })
                .catch(error => {
                    console.error('Error importing map:', error);
                    if (error.message !== 'No file selected') {
                        alert('Error importing map: ' + error.message);
                    }
                });
        });
        this.mapListControlsContainer.appendChild(importMapButton);
    }
    
    // Update UI visibility based on editor mode
    updateUIVisibility() {
        if (this.editor.mode === 'list') {
            this.uiContainer.style.display = 'none';
            this.mapListControlsContainer.style.display = 'flex';
            this.positionMapListControls(); // Ensure buttons are positioned correctly
        } else if (this.editor.mode === 'edit') {
            this.uiContainer.style.display = 'block';
            this.mapListControlsContainer.style.display = 'none';
        }
    }
}
