// This file contains the main entry point for the game logic. It initializes the game, handles user interactions, and manages the game state.

class Game {
    constructor() {
        this.containers = [];
        this.selectedContainer = null;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.numContainers = 8;
        this.containerCapacity = 4;
        this.init();
    }

    init() {
        this.createContainers();
        this.createLiquids();
        this.render();
        this.addEventListeners();
    }

    createContainers() {
        // Create filled containers (2 extra empty containers for sorting)
        for (let i = 0; i < this.numContainers; i++) {
            this.containers.push(new Container(this.containerCapacity));
        }
    }

    createLiquids() {
        const allLiquids = [];
        
        // Create 4 liquids of each color (for first 6 containers)
        for (let i = 0; i < 6; i++) {
            const color = this.colors[i];
            for (let j = 0; j < this.containerCapacity; j++) {
                allLiquids.push(new Liquid(color));
            }
        }
        
        // Shuffle the liquids
        shuffleArray(allLiquids);
        
        // Fill the first 6 containers with shuffled liquids
        let liquidIndex = 0;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.containerCapacity; j++) {
                this.containers[i].addLiquid(allLiquids[liquidIndex++]);
            }
        }
        
        // Leave the last 2 containers empty for sorting
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
        
        // Check win condition
        if (checkWinCondition(this.containers)) {
            setTimeout(() => {
                alert('Congratulations! You won!');
            }, 100);
        }
    }

    addEventListeners() {
        const containersDiv = document.getElementById('containers');
        
        // Click event for click-click functionality
        containersDiv.addEventListener('click', (e) => {
            const containerDiv = e.target.closest('.container');
            if (containerDiv && !containerDiv.classList.contains('dragging')) {
                const index = parseInt(containerDiv.dataset.index);
                this.handleContainerClick(index);
            }
        });
        
        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            this.resetGame();
        });
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
                this.pourLiquid(sourceIndex, targetIndex);
                this.render();
            }
        });
    }

    handleContainerClick(index) {
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
            this.pourLiquid(this.selectedContainer, index);
            this.selectedContainer = null;
            this.render();
        }
    }

    pourLiquid(fromIndex, toIndex) {
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
            }
        }
    }

    resetGame() {
        this.containers = [];
        this.selectedContainer = null;
        this.init();
    }

    checkWinCondition() {
        return checkWinCondition(this.containers);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});