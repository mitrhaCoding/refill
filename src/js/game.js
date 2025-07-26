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
            
            if (this.selectedContainer === index) {
                containerDiv.classList.add('selected');
            }
            
            // Create liquid layers
            const liquids = container.getContents();
            for (let i = 0; i < this.containerCapacity; i++) {
                const liquidDiv = document.createElement('div');
                liquidDiv.className = 'liquid-layer';
                
                if (liquids[i]) {
                    liquidDiv.style.backgroundColor = liquids[i].color;
                    liquidDiv.classList.add('filled');
                } else {
                    liquidDiv.classList.add('empty');
                }
                
                containerDiv.appendChild(liquidDiv);
            }
            
            containersDiv.appendChild(containerDiv);
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
        containersDiv.addEventListener('click', (e) => {
            const containerDiv = e.target.closest('.container');
            if (containerDiv) {
                const index = parseInt(containerDiv.dataset.index);
                this.handleContainerClick(index);
            }
        });
        
        const resetButton = document.getElementById('reset-button');
        resetButton.addEventListener('click', () => {
            this.resetGame();
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
            const liquid = fromContainer.removeLiquid();
            toContainer.addLiquid(liquid);
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