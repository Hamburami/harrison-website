// Configuration
const CONFIG = {
    blot: {
        moveSpeed: 0.08,
        approachDistance: 120,
        patientDistance: 110,
        menuRadius: 50,
        smoothingFactor: 0.92
    },
    typing: {
        mouseStillThreshold: 50,
        storageKey: 'noteai-thoughts' // huh?
    },
    thought: {
        dragThreshold: 5
    }
};

// === THOUGHT CLASS ===
class Thought {
    constructor(text, x, y) {
        this.text = text;
        //this.displayText = text; // this could be an easy way to capitalize or uncapitalize without loosing original case
        this.x = x;
        this.y = y;
        this.element = this.createElement();
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.timestamp = Date.now();
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'thought';
        element.style.left = this.x + 'px';
        element.style.top = this.y + 'px';
        element.textContent = this.text;
        element.contentEditable = false; // What is this for? The div is not editable by defaut? ok
        return element;
    }


    target() {
        this.element.classList.add('targeted');
    }

    untarget() {
         this.element.classList.remove('targeted');
    }

    drag(tempX, tempY) { 
        this.element.style.left = this.x + tempX + 'px';
        this.element.style.top = this.y + tempY + 'px';
    }


    enableEditing() {
        this.element.contentEditable = true;
        this.element.focus();
        
        // Position cursor at end of text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(this.element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    disableEditing() {
        this.element.contentEditable = false;
    }


    updateText(text) {
           ///this.text = text;
           this.element.textContent = this.text;
    }

    setTextVisible() {
        this.text = this.element.textContent;
    }

    addText(text) {
        this.text += text;
        this.element.textContent = this.text; // This should be the function updateScreenText or something like that
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    }

    format(type) {
        switch (type) {
            case 'bold':
                this.element.style.fontWeight = 
                    this.element.style.fontWeight === 'bold' ? 'normal' : 'bold';
                break;
            case 'italic':
                this.element.style.fontStyle = 
                    this.element.style.fontStyle === 'italic' ? 'normal' : 'italic';
                break;
            case 'upper':
                this.element.textContent = this.element.textContent.toUpperCase();
                break;
            case 'lower':
                this.element.textContent = this.element.textContent.toLowerCase();
                break;
        }
    }

    remove() {
        this.element.remove();
    }
}

// === BLOT CLASS ===
/**
 * MODULE: Simplified Ink Blot Companion
 * PURPOSE: Simple companion that follows the current thought
 * 
 * INPUTS:
 * - currentThought variable - determines positioning
 * 
 * OUTPUTS:
 * - Visual blot element positioned next to current thought
 * 
 * BEHAVIOR:
 * - Moves to be next to current thought when it changes
 * - Simple positioning without complex menu system
 */
class Blot {
    constructor() {
        this.element = document.getElementById('inkBlot');
        // Default blot size - can be changed dynamically
        this.blotWidth = 75;
        this.blotHeight = 70;
        this.menuWidth = 115;
        this.menuHeight = 110;
        
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.menuExpanded = false;
        this.targetThought = null; // Track which thought this blot is positioned next to
        this.menuItems = [
            { text: 'B', action: 'bold', angle: 0 },
            { text: 'I', action: 'italic', angle: 60 },
            { text: 'a', action: 'lower', angle: 120 },
            { text: 'A', action: 'upper', angle: 180 },
            { text: '×', action: 'delete', angle: 300 }
        ];
        this.updateSize();
        this.updateTarget();
        this.renderBlot();
    }

    // Set blot size and maintain center position
    setSize(width, height) {
        this.blotWidth = width;
        this.blotHeight = height;
        this.updateSize();
        this.updateTarget(); // Recalculate position to maintain center
    }

    // Update the actual DOM element size and styling
    updateSize() {
        const currentWidth = this.menuExpanded ? this.menuWidth : this.blotWidth;
        const currentHeight = this.menuExpanded ? this.menuHeight : this.blotHeight;
        
        this.element.style.width = currentWidth + 'px';
        this.element.style.height = currentHeight + 'px';
        this.element.style.background = 'radial-gradient(circle at 30% 30%, #2c1810, #1a0f0a)';
    }

    // Get current center offsets based on current size
    getCurrentCenterOffsets() {
        const currentWidth = this.menuExpanded ? this.menuWidth : this.blotWidth;
        const currentHeight = this.menuExpanded ? this.menuHeight : this.blotHeight;
        return {
            centerX: currentWidth / 2,
            centerY: currentHeight / 2
        };
    }

    updateTarget() { // goes to current thought or center if null, updatePosition is not descriptive because it also updates the target thought for the blot

        if (this.targetThought) {
            this.targetThought.untarget();
        }

        if (currentThought) {
            this.targetThought = currentThought; // Set which thought we're positioned next to
            this.targetThought.target();

            // Position to the left of current thought (center coordinates)
            this.x = currentThought.x - 80;
            this.y = currentThought.y + 0;
            
            // Keep within screen bounds (accounting for current blot size)
            const { centerX, centerY } = this.getCurrentCenterOffsets();
            this.x = Math.max(centerX, Math.min(window.innerWidth - centerX, this.x));
            this.y = Math.max(centerY, Math.min(window.innerHeight - centerY, this.y));
        } // else if (this.targetThought) {
        //     // Stay positioned next to the last target thought, don't move to center
        //     this.x = this.targetThought.x - 60;
        //     this.y = this.targetThought.y + 20;
            
        //     // Keep within screen bounds (accounting for current blot size)
        //     const { centerX, centerY } = this.getCurrentCenterOffsets();
        //     this.x = Math.max(centerX, Math.min(window.innerWidth - centerX, this.x));
        //     this.y = Math.max(centerY, Math.min(window.innerHeight - centerY, this.y));
        // } 
        else {
            // Only go to center if there's no target thought at all
            // Blot should keep its old target even when there is no current thought
            this.x = window.innerWidth / 8;
            this.y = window.innerHeight / 8;
        }
        
        // Position using center coordinates (subtract half current width/height)
        const { centerX, centerY } = this.getCurrentCenterOffsets();
        this.element.style.left = (this.x - centerX) + 'px';
        this.element.style.top = (this.y - centerY) + 'px';

    }

    // Called from ThoughtManager on hover
    expandMenu() {
        if (currentThought || thoughts.length > 0) {
            this.menuExpanded = true;
            this.element.classList.add('menu-expanded');
            this.updateSize(); // Update size first
            this.renderBlot();
        }
    }

    // Called from ThoughtManager on mouse leave
    collapseMenu() {
        this.menuExpanded = false;
        this.element.classList.remove('menu-expanded');
        this.updateSize(); // Update size first
        this.renderBlot();
    }

    renderBlot() {                                      // HUH??
        if (this.menuExpanded) {
            this.element.innerHTML = this.getMenuHTML();
        } else {
            this.element.innerHTML = '';
        }
    }

    getMenuHTML() {
        let html = '';
        // Use current blot center as reference
        const { centerX, centerY } = this.getCurrentCenterOffsets();
        const radius = 30;
        
        this.menuItems.forEach((item, index) => {
            const angle = item.angle;
            const x = centerX + radius * Math.cos(angle * Math.PI / 180);
            const y = centerY + radius * Math.sin(angle * Math.PI / 180);
            
            html += `<div class="menu-item" data-action="${item.action}" style="
                position: absolute;
                left: ${x - 12}px;
                top: ${y - 12}px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                font-weight: bold;
                color: white;
                cursor: pointer;
                transition: all 0.2s ease;
                animation: fadeIn 0.3s ease ${index * 0.05}s both;
            ">${item.text}</div>`;
        });
        return html;
    }

    // Called from ThoughtManager when menu item is clicked
    executeAction(action) {
        // Use targetThought (the thought we're positioned next to) instead of currentThought
        const targetThought = this.targetThought;
        if (!targetThought) return;
        
        switch (action) {
            case 'bold':
            case 'italic':
            case 'upper':
            case 'lower':
                targetThought.format(action);
                if (eventManager) eventManager.saveThoughts();
                break;
            case 'move':
                // TODO: Implement move functionality
                break;
            case 'delete':
                // Delete the target thought
                const index = thoughts.indexOf(targetThought);
                if (index > -1) {
                    targetThought.element.remove();
                    thoughts.splice(index, 1);
                    this.targetThought = null;
                    if (currentThought === targetThought) {
                        currentThought = null;
                    }
                    if (eventManager) {
                        this.updateTarget();
                        eventManager.saveThoughts();
                    }
                }
                break;
        }
        this.collapseMenu();
    }
}

// === THOUGHT MANAGER ===
/**
 * MODULE: Thought Manager
 * PURPOSE: Manages thought creation, editing, and keyboard input handling
 * 
 * INPUTS:
 * - Keyboard events (keydown, keypress)
 * - Mouse position and movement
 * - User typing input
 * 
 * OUTPUTS:
 * - New thought creation at mouse position
 * - Character addition to existing thoughts
 * - Backspace/delete functionality
 * - App mode switching between 'new_thought' and 'current_thought'
 * 
 * BEHAVIOR:
 * - Listens for all keyboard input to detect typing
 * - Creates thoughts at mouse cursor location
 * - Handles Enter key for line breaks
 * - Handles Backspace for character/thought deletion
 * - Manages mouse blob visibility based on app mode
 */




// THIS SHOULD ALL BE IN THE EVENT MANAGER AND IT NEEDS A BETTER NAME
// Global variables
let mouseX = 0;
let mouseY = 0;
let mouseBlob = null;
let currentThought = null; // This could replace appMode, if currentThought == null then appMode = new_thought else appMode = currentThought
let thoughts = [];

let eventManager;
let blot;

function setCurrentThought(thought) {
    // deactivate the current thought
    if (currentThought) {
        currentThought.isActive = false;
    }
    // activate the input thought or set currentThought to null
    if (thought instanceof Thought) {
        currentThought = thought;
        currentThought.enableEditing();
        thought.isActive = true;
    } else {
        currentThought = null;
    }
}


class EventManager { // BETTER NAME FOR GLOBAL APP HANDLER
    constructor() {
        this.loadThoughts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse tracking variables for drag detection
        let mouseDownTime = 0;
        let mouseDown = false;
        let mouseDownX = 0; // weird how these can be declared outside of the scope that the eventlisteners are using and this is jsut a single function that would unload these variables after runnning?
        let mouseDownY = 0;
        let deltaX = 0;
        let deltaY = 0;
        // let hasMoved = false;
        let draggedThought = null;
        let dragThreshold = CONFIG.thought.dragThreshold;


        // These should each be discrete functions for readablity and simplicity
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!mouseDown) {
                this.updateSelectedThought(); // update what the current thought is
            }

            if (currentThought && currentThought.isDragging) {

                deltaX = mouseX - mouseDownX;
                deltaY = mouseY - mouseDownY;
                
                currentThought.drag(deltaX, deltaY);

                // Threshold math
                // if (deltaX > dragThreshold || deltaY > dragThreshold) { 
                    
                // }
            }
        });


        document.addEventListener('mousedown', (e) => {
            mouseDown = true;
            mouseDownX = e.clientX; //should these be set regardless?
            mouseDownY = e.clientY;

            if (e.target.classList.contains('thought')) { // this is all wrong, it should not be selecting thoughts as it moves if the mouse is down it should store a draggin thought instead
                e.preventDefault();
                let selectedThought = thoughts.find(t => t.element === e.target);
                if (selectedThought) {
                    setCurrentThought(selectedThought);
                    selectedThought.isDragging = true;
                }
            }
        });

        // Single mouse up handler - ALWAYS clears drag state
        document.addEventListener('mouseup', (e) => {
            mouseDown = false;

            if (currentThought) {
                if (currentThought.isDragging) {
                    currentThought.moveTo(currentThought.x + deltaX, currentThought.y + deltaY);
                }
                currentThought.isDragging = false;
            }

            //blot.updateTarget();
        });

        // Blot hover handling: should this be an event listener on the blot instead of the document?
        document.addEventListener('mouseenter', (e) => {
            if (e.target.id === 'inkBlot' && blot) {
                blot.expandMenu();
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.id === 'inkBlot' && blot) {
                // Add small delay to prevent flickering
                setTimeout(() => {
                    if (!blot.element.matches(':hover')) {
                        blot.collapseMenu();
                    }
                }, 100);
            }
        }, true);


        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item')) {
                e.preventDefault();
                e.stopPropagation();
                const action = e.target.getAttribute('data-action');
                blot.executeAction(action);
                return;
            }
            if (e.target.id === 'inkBlot') {
                return;
            }

            // Blot click handling
            // if (e.target.id === 'inkBlot' && blot) {
            //     e.preventDefault();
            //     e.stopPropagation();
            //     if (!currentThought && thoughts.length > 0) {
            //         this.setCurrentThought(thoughts[thoughts.length - 1]);
            //     }
            //     return;
            // }

            // Click handling for deselecting thoughts when clicking empty space
            if (!e.target.classList.contains('thought') && !e.target.closest('.thought')) {
                setCurrentThought(null);
                blot.updateTarget();
            }
        });

        // Unified keyboard input handling - ALL TYPING DETECTED HERE
        document.addEventListener('keydown', (e) => {
            // If a thought is active, let contentEditable handle most keys
            // if (currentThought) {
            //     if (e.key === 'Escape') {
            //         e.preventDefault();
            //         currentThought.setActive(false);
            //         currentThought = null;
            //         appMode = 'new_thought';
            //         blot.updateTarget();
            //     }
            //     // Let contentEditable handle other keys naturally
            //     console.log("editing a current thought");
            //     return;
            // }

            // if (e.key === 'Backspace' || e.key === 'Delete') {
            //     e.preventDefault();
            //     this.deleteCurrentThought(); // erm huh no
            // } else 
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                // Regular character input
                e.preventDefault();
                this.createOrUpdateThought(e.key); // <---------------------
                blot.updateTarget();
            }
        });
    }

    updateSelectedThought() {
        if (currentThought) {
            // Check if mouse is over blot - if so, don't switch modes
            const blotRect = document.getElementById('inkBlot').getBoundingClientRect();
            const mouseOverBlot = mouseX >= blotRect.left && mouseX <= blotRect.right && 
                                    mouseY >= blotRect.top && mouseY <= blotRect.bottom;
            
            if (mouseOverBlot) {
                // Don't change mode when hovering over blot
                return;
            }
            
            // Calculate distance to thought's bounding box, not just top-left position
            const rect = currentThought.element.getBoundingClientRect();
            
            // Find closest point on the bounding box to the mouse
            const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
            const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
            
            const distance = Math.sqrt(
                (mouseX - closestX) ** 2 + (mouseY - closestY) ** 2
            );
            
            if (distance > CONFIG.typing.mouseStillThreshold) {
                // Mouse moved far from current thought - switch to new thought mode
                setCurrentThought(null);
            }
        }
    }

    createOrUpdateThought(char) {
        //if (char === ' ' || char.length > 1) return;

        const nearbyThought = this.findNearbyThought(mouseX, mouseY);
        
        if (nearbyThought) { // update
            nearbyThought.addText(char);
            //nearbyThought.updateText(char);
            setCurrentThought(nearbyThought);
        } else { // create
            const newThought = new Thought(char, mouseX, mouseY);
            document.getElementById('thoughtsContainer').appendChild(newThought.element);
            thoughts.push(newThought);
            setCurrentThought(newThought);
        }
        
        this.saveThoughts();
    }

    findNearbyThought(x, y) {
        return thoughts.find(thought => {
            const distance = Math.sqrt((x - thought.x) ** 2 + (y - thought.y) ** 2);
            return distance < CONFIG.typing.mouseStillThreshold;
        });
    }

    deleteCurrentThought() { // MAYBE this should be delete a specific thought with an input, eh maybe not
        if (currentThought) {
            // Delete the current thought
            const index = thoughts.indexOf(currentThought);
            if (index > -1) {
                currentThought.element.remove();
                thoughts.splice(index, 1);
                currentThought = null;
                blot.updateTarget(); //This is when I want the blot to stay where it is and not be linked to a thought
                this.saveThoughts(); // placeholder it should instead delete itself from the current memory? (Saving would be more reliable but it might run slower)
            }
        }
    }

    // updateMouseBlob() {
    //     if (appMode === 'new_thought') {
    //         if (!mouseBlob) {
    //             mouseBlob = document.createElement('div');
    //             mouseBlob.className = 'mouse-blob';
    //             document.body.appendChild(mouseBlob);
    //         }
    //         mouseBlob.style.left = (mouseX - 6) + 'px';
    //         mouseBlob.style.top = (mouseY - 6) + 'px';
    //     } else {
    //         if (mouseBlob) {
    //             mouseBlob.remove();
    //             mouseBlob = null;
    //         }
    //     }
    // }

    saveThoughts() { // this should be done on each thought creation
        // const thoughtsData = thoughts.map(t => ({
        //     text: t.text,
        //     x: t.x,
        //     y: t.y,
        //     isActive: t.isActive
        // }));
        // localStorage.setItem(CONFIG.typing.storageKey, JSON.stringify(thoughtsData)); // Look into this
    }

    loadThoughts() {
        // const saved = localStorage.getItem(CONFIG.typing.storageKey);
        // if (saved) {
        //     const thoughtsData = JSON.parse(saved);
        //     thoughtsData.forEach(data => {
        //         const thought = new Thought(data.text, data.x, data.y);
        //         document.getElementById('thoughtsContainer').appendChild(thought.element);
        //         thoughts.push(thought);
                
        //         if (data.isActive) {
        //             this.setCurrentThought(thought);
        //         }
        //     });
        // }
    }
}

// === CLEAR FUNCTIONALITY ===
function clearAllThoughts() {
    // Remove all thought elements
    thoughts.forEach(thought => thought.remove());
    
    // Clear arrays and state
    thoughts = [];
    currentThought = null;
    appMode = 'new_thought';
    
    // Update UI
    if (eventManager) {
        blot.updateTarget();
    }
    
    // Clear storage
    localStorage.removeItem(CONFIG.typing.storageKey);
    
    // Notify blot of current thought change
    if (blot) {
        blot.onCurrentThoughtChanged();
        if (blot.menuExpanded) {
            blot.collapseMenu();
        }
    }
}

// === INITIALIZATION ===

document.addEventListener('DOMContentLoaded', () => {
    eventManager = new EventManager();   
    blot = new Blot(); 
    // Setup clear button
    document.getElementById('clearButton').addEventListener('click', clearAllThoughts);
});