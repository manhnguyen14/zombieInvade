/**
 * UI Helpers Module
 * 
 * Provides helper functions for creating UI elements.
 */

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @returns {HTMLButtonElement} The button element
 */
export function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

/**
 * Create a toggle element
 * @param {boolean} initialState - Initial state of the toggle
 * @param {Function} onChange - Change handler
 * @returns {HTMLDivElement} The toggle element
 */
export function createToggle(initialState, onChange) {
    const toggle = document.createElement('div');
    toggle.className = `system-toggle ${initialState ? 'enabled' : 'disabled'}`;
    
    toggle.addEventListener('click', () => {
        const isEnabled = toggle.classList.contains('enabled');
        toggle.classList.remove(isEnabled ? 'enabled' : 'disabled');
        toggle.classList.add(isEnabled ? 'disabled' : 'enabled');
        
        if (onChange) {
            onChange(!isEnabled);
        }
    });
    
    return toggle;
}
