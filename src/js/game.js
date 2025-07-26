// This file contains the main entry point for the game logic. It initializes the game, handles user interactions, and manages the game state.

class Game {
    constructor() {
        this.containers = [];
        this.selectedContainer = null;
        this.colors = [
            'red', 'blue', 'green', 'yellow', 'purple', 'orange',
            'pink', 'cyan', 'lime', 'brown', 'gray', 'navy',
            'maroon', 'olive', 'teal', 'silver', 'gold', 'indigo',
            'coral', 'salmon'
        ];
        this.difficulty = 2; // Extra containers (1-4)
        this.complexity = 6; // Filled containers (6-20)
        this.containerCapacity = 4;
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.moves = 0;
        
        // Store references to event listeners for cleanup
        this.eventListeners = {
            containerClick: null,
            resetClick: null,
            difficultyInput: null,
            complexityInput: null,
            applyClick: null
        };
        
        this.init();
    }

    init() {
        this.createContainers();
        this.createLiquids();
        this.displayVersion();
        this.setupControls();
        this.render();
        this.addEventListeners();
    }

    setupControls() {
        const difficultySlider = document.getElementById('difficulty-slider');
        const complexitySlider = document.getElementById('complexity-slider');
        const difficultyValue = document.getElementById('difficulty-value');
        const complexityValue = document.getElementById('complexity-value');
        const applyButton = document.getElementById('apply-settings');

        // Update slider values
        difficultySlider.value = this.difficulty;
        complexitySlider.value = this.complexity;
        difficultyValue.textContent = this.difficulty;
        complexityValue.textContent = this.complexity;

        // Remove existing event listeners before adding new ones
        if (this.eventListeners.difficultyInput) {
            difficultySlider.removeEventListener('input', this.eventListeners.difficultyInput);
        }
        if (this.eventListeners.complexityInput) {
            complexitySlider.removeEventListener('input', this.eventListeners.complexityInput);
        }
        if (this.eventListeners.applyClick) {
            applyButton.removeEventListener('click', this.eventListeners.applyClick);
        }

        // Create and store new event listeners
        this.eventListeners.difficultyInput = (e) => {
            difficultyValue.textContent = e.target.value;
        };

        this.eventListeners.complexityInput = (e) => {
            complexityValue.textContent = e.target.value;
        };

        this.eventListeners.applyClick = () => {
            this.difficulty = parseInt(difficultySlider.value);
            this.complexity = parseInt(complexitySlider.value);
            this.resetGame();
        };

        // Add event listeners for real-time value updates
        difficultySlider.addEventListener('input', this.eventListeners.difficultyInput);
        complexitySlider.addEventListener('input', this.eventListeners.complexityInput);

        // Apply settings button
        applyButton.addEventListener('click', this.eventListeners.applyClick);
    }

    createContainers() {
        // Total containers = filled containers + extra containers
        const totalContainers = this.complexity + this.difficulty;
        
        for (let i = 0; i < totalContainers; i++) {
            this.containers.push(new Container(this.containerCapacity));
        }
    }

    createLiquids() {
        const allLiquids = [];
        
        // Create 4 liquids of each color (for the filled containers)
        for (let i = 0; i < this.complexity; i++) {
            const color = this.colors[i % this.colors.length]; // Cycle through colors if needed
            for (let j = 0; j < this.containerCapacity; j++) {
                allLiquids.push(new Liquid(color));
            }
        }
        
        // Shuffle the liquids
        shuffleArray(allLiquids);
        
        // Fill the first 'complexity' containers with shuffled liquids
        let liquidIndex = 0;
        for (let i = 0; i < this.complexity; i++) {
            for (let j = 0; j < this.containerCapacity; j++) {
                this.containers[i].addLiquid(allLiquids[liquidIndex++]);
            }
        }
        
        // Leave the remaining containers empty for sorting
    }

    displayVersion() {
        // Try to fetch version from version.ver file
        fetch('./version.ver')
            .then(response => response.text())
            .then(version => {
                const versionDiv = document.getElementById('version-info');
                if (versionDiv) {
                    versionDiv.textContent = `v${version.trim()}`;
                }
            })
            .catch(() => {
                // Fallback to package.json version or default
                const versionDiv = document.getElementById('version-info');
                if (versionDiv) {
                    versionDiv.textContent = 'v0.1.0';
                }
            });
    }

    render() {
        const containersDiv = document.getElementById('containers');
        containersDiv.innerHTML = '';
        
        this.containers.forEach((container, index) => {
            const containerDiv = document.createElement('div');
            containerDiv.className = 'container';
            containerDiv.dataset.index = index;
            
            // Make containers with liquid draggable
            if (!container.isEmpty()) {
                containerDiv.draggable = true;
                containerDiv.setAttribute('draggable', 'true');
            } else {
                containerDiv.draggable = false;
                containerDiv.setAttribute('draggable', 'false');
            }
            
            if (this.selectedContainer === index) {
                containerDiv.classList.add('selected');
            }
            
            // Get consecutive liquids for highlighting
            const consecutiveLiquids = this.selectedContainer === index ? 
                container.getConsecutiveTopLiquids() : [];
            
            // Create liquid layers
            const liquids = container.getContents();
            for (let i = 0; i < this.containerCapacity; i++) {
                const liquidDiv = document.createElement('div');
                liquidDiv.className = 'liquid-layer';
                
                if (liquids[i]) {
                    liquidDiv.style.backgroundColor = liquids[i].color;
                    liquidDiv.classList.add('filled');
                    
                    // Add bottom-layer class to the bottommost liquid
                    if (i === 0 && liquids[0]) {
                        liquidDiv.classList.add('bottom-layer');
                    }
                    
                    // Highlight consecutive liquids when container is selected
                    if (this.selectedContainer === index && 
                        i >= liquids.length - consecutiveLiquids.length) {
                        liquidDiv.classList.add('highlighted');
                    }
                } else {
                    liquidDiv.classList.add('empty');
                }
                
                containerDiv.appendChild(liquidDiv);
            }
            
            containersDiv.appendChild(containerDiv);
            
            // Add drag events to this specific container
            this.addDragEventsToContainer(containerDiv, index);
        });
        
        // Update move counter
        this.updateMoveCounter();
        
        // Check game end conditions
        this.checkGameEndConditions();
    }

    checkGameEndConditions() {
        if (this.gameState !== 'playing') {
            return; // Game already ended
        }
        
        // Check win condition first
        if (checkWinCondition(this.containers)) {
            this.gameState = 'won';
            const difficultyText = this.getDifficultyText();
            this.showGameOverModal('Congratulations!', 
                `🎉 You won in ${this.moves} moves! 🎉`, 
                `${difficultyText} - You successfully sorted all the liquids!`, 
                '#28a745');
            return;
        }
        
        // Then check lose condition
        if (checkLoseCondition(this.containers)) {
            this.gameState = 'lost';
            this.showGameOverModal('Game Over', 
                '😔 No more moves available!', 
                'Try adjusting the difficulty or reset the game to start over.', 
                '#dc3545');
            return;
        }
    }

    getDifficultyText() {
        const difficultyNames = {
            1: 'Easy',
            2: 'Medium', 
            3: 'Hard',
            4: 'Expert'
        };
        
        const difficultyName = difficultyNames[this.difficulty] || 'Custom';
        return `Difficulty: ${difficultyName} (${this.complexity} colors, ${this.difficulty} extra containers)`;
    }

    addEventListeners() {
        const containersDiv = document.getElementById('containers');
        const resetButton = document.getElementById('reset-button');
        
        // Remove existing event listeners before adding new ones
        if (this.eventListeners.containerClick) {
            containersDiv.removeEventListener('click', this.eventListeners.containerClick);
        }
        if (this.eventListeners.resetClick) {
            resetButton.removeEventListener('click', this.eventListeners.resetClick);
        }

        // Create and store new event listeners
        this.eventListeners.containerClick = (e) => {
            const containerDiv = e.target.closest('.container');
            if (containerDiv && !containerDiv.classList.contains('dragging')) {
                const index = parseInt(containerDiv.dataset.index);
                this.handleContainerClick(index);
            }
        };

        this.eventListeners.resetClick = () => {
            this.resetGame();
        };
        
        // Click event for click-click functionality
        containersDiv.addEventListener('click', this.eventListeners.containerClick);
        
        resetButton.addEventListener('click', this.eventListeners.resetClick);
    }

    debugValidMoves() {
        console.log('=== DEBUG: Checking all possible moves ===');
        let validMoves = 0;
        
        for (let i = 0; i < this.containers.length; i++) {
            const sourceContainer = this.containers[i];
            if (sourceContainer.isEmpty()) {
                console.log(`Container ${i}: Empty (skip)`);
                continue;
            }
            
            console.log(`Container ${i}: Has ${sourceContainer.liquids.length} liquids, top color: ${sourceContainer.getTopLiquid().color}`);
            
            for (let j = 0; j < this.containers.length; j++) {
                if (i === j) continue;
                
                const targetContainer = this.containers[j];
                const canPour = sourceContainer.canPourTo(targetContainer);
                
                if (canPour) {
                    validMoves++;
                    console.log(`  ✅ Can pour to container ${j} (${targetContainer.isEmpty() ? 'empty' : 'top color: ' + targetContainer.getTopLiquid().color})`);
                } else {
                    console.log(`  ❌ Cannot pour to container ${j} (${targetContainer.isFull() ? 'full' : targetContainer.isEmpty() ? 'empty but other reason' : 'top color: ' + targetContainer.getTopLiquid().color})`);
                }
            }
        }
        
        console.log(`=== Total valid moves: ${validMoves} ===`);
        
        if (validMoves === 0) {
            console.log('NO VALID MOVES - SHOULD TRIGGER LOSE CONDITION');
            this.checkGameEndConditions();
        }
        
        alert(`Found ${validMoves} valid moves. Check console for details.`);
    }

    addDragEventsToContainer(containerDiv, index) {
        // Only add drag events if container has liquid
        if (!this.containers[index].isEmpty()) {
            containerDiv.addEventListener('dragstart', (e) => {
                console.log('Drag start:', index);
                e.dataTransfer.setData('text/plain', index.toString());
                e.dataTransfer.effectAllowed = 'move';
                containerDiv.classList.add('dragging');
                this.selectedContainer = null;
                setTimeout(() => this.render(), 0);
            });

            containerDiv.addEventListener('dragend', (e) => {
                console.log('Drag end:', index);
                containerDiv.classList.remove('dragging');
                // Clean up any drag-over states
                document.querySelectorAll('.container').forEach(container => {
                    container.classList.remove('drag-over');
                });
            });
        }

        // All containers can be drop targets
        containerDiv.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        containerDiv.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (!containerDiv.classList.contains('dragging')) {
                containerDiv.classList.add('drag-over');
            }
        });

        containerDiv.addEventListener('dragleave', (e) => {
            if (!containerDiv.contains(e.relatedTarget)) {
                containerDiv.classList.remove('drag-over');
            }
        });

        containerDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            containerDiv.classList.remove('drag-over');
            
            const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIndex = parseInt(containerDiv.dataset.index);
            
            console.log('Drop:', sourceIndex, '->', targetIndex);
            
            if (sourceIndex !== targetIndex && !isNaN(sourceIndex)) {
                if (this.pourLiquid(sourceIndex, targetIndex)) {
                    this.moves++;
                }
                this.render();
            }
        });
    }

    handleContainerClick(index) {
        if (this.gameState !== 'playing') {
            return; // Don't allow moves if game is over
        }

        if (this.selectedContainer === null) {
            // Select a container
            if (!this.containers[index].isEmpty()) {
                this.selectedContainer = index;
                this.render();
            }
        } else if (this.selectedContainer === index) {
            // Deselect the same container
            this.selectedContainer = null;
            this.render();
        } else {
            // Try to pour from selected container to clicked container
            if (this.pourLiquid(this.selectedContainer, index)) {
                this.moves++;
            }
            this.selectedContainer = null;
            this.render();
        }
    }

    pourLiquid(fromIndex, toIndex) {
        if (this.gameState !== 'playing') {
            return false; // Don't allow moves if game is over
        }

        const fromContainer = this.containers[fromIndex];
        const toContainer = this.containers[toIndex];
        
        if (fromContainer.canPourTo(toContainer)) {
            // Get all consecutive liquids of the same color from the top
            const consecutiveLiquids = fromContainer.getConsecutiveTopLiquids();
            
            // Calculate how many we can actually move (limited by target container space)
            const availableSpace = toContainer.getAvailableSpace();
            const liquidsToMove = Math.min(consecutiveLiquids.length, availableSpace);
            
            if (liquidsToMove > 0) {
                // Remove the liquids from source container
                const movedLiquids = fromContainer.removeMultipleLiquids(liquidsToMove);
                
                // Add them to target container
                movedLiquids.forEach(liquid => {
                    toContainer.addLiquid(liquid);
                });
                
                return true; // Move was successful
            }
        }
        return false; // Move was not possible
    }

    showGameOverModal(title, message, subtitle, color) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.style.borderColor = color;
        
        modal.innerHTML = `
            <h2 style="color: ${color}">${title}</h2>
            <p class="main-message">${message}</p>
            <p class="sub-message">${subtitle}</p>
            <div class="modal-buttons">
                <button class="modal-btn restart-btn" style="background-color: ${color}">
                    🔄 Play Again
                </button>
                <button class="modal-btn close-btn">
                    ✖️ Close
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add event listeners
        modal.querySelector('.restart-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            this.resetGame();
        });
        
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    resetGame() {
        // Clean up all event listeners before resetting
        this.removeAllEventListeners();
        
        this.containers = [];
        this.selectedContainer = null;
        this.gameState = 'playing';
        this.moves = 0;
        this.init();
    }

    removeAllEventListeners() {
        // Remove main game event listeners
        const containersDiv = document.getElementById('containers');
        const resetButton = document.getElementById('reset-button');
        
        if (this.eventListeners.containerClick) {
            containersDiv.removeEventListener('click', this.eventListeners.containerClick);
        }
        if (this.eventListeners.resetClick) {
            resetButton.removeEventListener('click', this.eventListeners.resetClick);
        }

        // Remove control event listeners
        const difficultySlider = document.getElementById('difficulty-slider');
        const complexitySlider = document.getElementById('complexity-slider');
        const applyButton = document.getElementById('apply-settings');

        if (this.eventListeners.difficultyInput) {
            difficultySlider.removeEventListener('input', this.eventListeners.difficultyInput);
        }
        if (this.eventListeners.complexityInput) {
            complexitySlider.removeEventListener('input', this.eventListeners.complexityInput);
        }
        if (this.eventListeners.applyClick) {
            applyButton.removeEventListener('click', this.eventListeners.applyClick);
        }

        // Remove drag and drop event listeners from all existing container elements
        const existingContainers = document.querySelectorAll('.container');
        existingContainers.forEach(containerDiv => {
            // Clone the node and replace it to remove all event listeners
            const newContainerDiv = containerDiv.cloneNode(true);
            containerDiv.parentNode.replaceChild(newContainerDiv, containerDiv);
        });

        // Clear the containers div completely to ensure clean state
        containersDiv.innerHTML = '';
    }

    checkWinCondition() {
        return checkWinCondition(this.containers);
    }

    updateMoveCounter() {
        const moveCounter = document.getElementById('move-counter');
        if (moveCounter) {
            moveCounter.textContent = `Moves: ${this.moves}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});