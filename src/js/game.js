// This file contains the main entry point for the game logic. It initializes the game, handles user interactions, and manages the game state.

class Game {
    constructor() {
        console.log('Game constructor called');
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
            settingsClick: null,
            closeSettingsClick: null,
            modalOverlayClick: null,
            difficultyInput: null,
            complexityInput: null,
            applyClick: null,
            settingsClick: null
        };
        
        // Store original settings to detect changes
        this.originalSettings = {
            difficulty: this.difficulty,
            complexity: this.complexity
        };
        
        this.init();
    }

    init() {
        console.log('Game init called');
        this.createContainers();
        this.createLiquids();
        this.displayVersion(); // Call the async function
        this.setupControls();
        this.render();
        this.addEventListeners();
    }

    setupControls() {
        // Setup only modal controls since all main controls are removed
        this.setupModalControls();
    }

    setupMainControls() {
        // No main controls needed anymore - everything is in the modal
    }

    setupModalControls() {
        const settingsButton = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettingsButton = document.getElementById('close-settings-btn');
        const modalDifficultySlider = document.getElementById('modal-difficulty-slider');
        const modalComplexitySlider = document.getElementById('modal-complexity-slider');
        const modalDifficultyValue = document.getElementById('modal-difficulty-value');
        const modalComplexityValue = document.getElementById('modal-complexity-value');
        const difficultySlider = document.getElementById('difficulty-slider');
        const complexitySlider = document.getElementById('complexity-slider');
        const difficultyValue = document.getElementById('difficulty-value');
        const complexityValue = document.getElementById('complexity-value');
        const applyButton = document.getElementById('apply-settings');
        const settingsPanel = document.getElementById('game-controls');
        
        // Log what we found
        console.log('Apply button:', applyButton);
        console.log('Settings button:', settingsButton);
        console.log('Settings panel:', settingsPanel);

        // Set initial values for modal controls
        modalDifficultySlider.value = this.difficulty;
        modalComplexitySlider.value = this.complexity;
        modalDifficultyValue.textContent = this.difficulty;
        modalComplexityValue.textContent = this.complexity;

        // Store original settings
        this.originalSettings = {
            difficulty: this.difficulty,
            complexity: this.complexity
        };

        // Remove existing event listeners before adding new ones
        this.removeControlEventListeners();

        // Create and store new event listeners
        this.eventListeners.settingsClick = () => {
            this.openSettingsModal();
        };

        this.eventListeners.closeSettingsClick = () => {
            this.closeSettingsModal();
        };

        this.eventListeners.modalOverlayClick = (e) => {
            if (e.target === settingsModal) {
                this.closeSettingsModal();
            }
        };

        this.eventListeners.modalDifficultyInput = (e) => {
            modalDifficultyValue.textContent = e.target.value;
        };

        this.eventListeners.modalComplexityInput = (e) => {
            modalComplexityValue.textContent = e.target.value;
        };

        this.eventListeners.applyClick = () => {
            this.applySettings();
        };

        // Add event listeners
        settingsButton.addEventListener('click', this.eventListeners.settingsClick);
        closeSettingsButton.addEventListener('click', this.eventListeners.closeSettingsClick);
        settingsModal.addEventListener('click', this.eventListeners.modalOverlayClick);
        modalDifficultySlider.addEventListener('input', this.eventListeners.modalDifficultyInput);
        modalComplexitySlider.addEventListener('input', this.eventListeners.modalComplexityInput);
        applyButton.addEventListener('click', this.eventListeners.applyClick);

        // Add keyboard support for closing modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
                this.closeSettingsModal();
            }
        });
    }

    removeControlEventListeners() {
        const settingsButton = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettingsButton = document.getElementById('close-settings-btn');
        const modalDifficultySlider = document.getElementById('modal-difficulty-slider');
        const modalComplexitySlider = document.getElementById('modal-complexity-slider');
        const applyButton = document.getElementById('apply-settings');

        if (this.eventListeners.settingsClick) {
            settingsButton.removeEventListener('click', this.eventListeners.settingsClick);
        }
        if (this.eventListeners.closeSettingsClick) {
            closeSettingsButton.removeEventListener('click', this.eventListeners.closeSettingsClick);
        }
        if (this.eventListeners.modalOverlayClick) {
            settingsModal.removeEventListener('click', this.eventListeners.modalOverlayClick);
        }
        if (this.eventListeners.modalDifficultyInput) {
            modalDifficultySlider.removeEventListener('input', this.eventListeners.modalDifficultyInput);
        }
        if (this.eventListeners.modalComplexityInput) {
            modalComplexitySlider.removeEventListener('input', this.eventListeners.modalComplexityInput);
        }

        if (this.eventListeners.applyClick) {
            applyButton.removeEventListener('click', this.eventListeners.applyClick);
        }
    }

    setupMainControls() {
        console.log('Setup Controls Debug:');
        // Get all required elements
        const settingsButton = document.getElementById('settings-button');
        const settingsPanel = document.getElementById('game-controls');
        const difficultySlider = document.getElementById('difficulty-slider');
        const complexitySlider = document.getElementById('complexity-slider');
        const difficultyValue = document.getElementById('difficulty-value');
        const complexityValue = document.getElementById('complexity-value');
        const applyButton = document.getElementById('apply-settings');
        
        console.log('Settings button:', settingsButton);
        console.log('Settings panel:', settingsPanel);
        console.log('Settings panel initial classes:', settingsPanel?.className);

        // Check for null elements
        if (!difficultySlider) console.error('difficultySlider not found!');
        if (!complexitySlider) console.error('complexitySlider not found!');
        if (!difficultyValue) console.error('difficultyValue not found!');
        if (!complexityValue) console.error('complexityValue not found!');
        if (!applyButton) console.error('applyButton not found!');
        if (!settingsButton) console.error('settingsButton not found!');
        if (!settingsPanel) console.error('settingsPanel not found!');

        // Only proceed if all required elements exist
        if (!settingsButton || !settingsPanel) {
            console.error('Critical elements missing, aborting setupControls');
            return;
        }

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
        if (this.eventListeners.applyClick && applyButton) {
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

    openSettingsModal() {
        const settingsModal = document.getElementById('settings-modal');
        
        // Sync modal controls with current game settings
        const modalDifficultySlider = document.getElementById('modal-difficulty-slider');
        const modalComplexitySlider = document.getElementById('modal-complexity-slider');
        const modalDifficultyValue = document.getElementById('modal-difficulty-value');
        const modalComplexityValue = document.getElementById('modal-complexity-value');
        
        modalDifficultySlider.value = this.difficulty;
        modalComplexitySlider.value = this.complexity;
        modalDifficultyValue.textContent = this.difficulty;
        modalComplexityValue.textContent = this.complexity;
        
        settingsModal.classList.remove('hidden');
        
        // Store current settings as original when opening
        this.originalSettings = {
            difficulty: this.difficulty,
            complexity: this.complexity
        };
        
        // Disable scrolling on body
        document.body.style.overflow = 'hidden';
    }

    closeSettingsModal() {
        const settingsModal = document.getElementById('settings-modal');
        settingsModal.classList.add('hidden');
        
        // Re-enable scrolling on body
        document.body.style.overflow = '';
    }

    applySettings() {
        const modalDifficultySlider = document.getElementById('modal-difficulty-slider');
        const modalComplexitySlider = document.getElementById('modal-complexity-slider');
        
        const newDifficulty = parseInt(modalDifficultySlider.value);
        const newComplexity = parseInt(modalComplexitySlider.value);
        
        // Check if settings have changed
        const settingsChanged = 
            newDifficulty !== this.originalSettings.difficulty || 
            newComplexity !== this.originalSettings.complexity;
        
        // Update game settings
        this.difficulty = newDifficulty;
        this.complexity = newComplexity;
        
        // Close modal
        this.closeSettingsModal();
        
        // Reset game only if settings changed
        if (settingsChanged) {
            console.log('Settings changed, resetting game...');
            this.resetGame();
        } else {
            console.log('No settings changed, keeping current game');
        }
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

    async displayVersion() {
        console.log('displayVersion called');
        const versionDiv = document.getElementById('version-info');
        if (!versionDiv) {
            console.error('version-info div not found');
            return;
        }

        // Set a temporary version while loading
        versionDiv.textContent = 'v... (loading)';

        try {
            // Try to fetch version from GitHub API
            console.log('Attempting GitHub version fetch...');
            const githubVersion = await this.fetchVersionFromGitHub();
            console.log('GitHub version result:', githubVersion);
            if (githubVersion) {
                console.log('GitHub version success:', githubVersion);
                versionDiv.textContent = `v${githubVersion}`;
                console.log('Version displayed successfully:', `v${githubVersion}`);
                return;
            }
        } catch (error) {
            console.warn('GitHub API fetch failed:', error);
        }

        try {
            // Fallback to local version.ver file
            console.log('Falling back to local version.ver...');
            const response = await fetch(`./version.ver`, {
                cache: 'no-cache'
            });

            if (response.ok) {
                const version = await response.text();
                console.log('Local version success:', version.trim());
                versionDiv.textContent = `v${version.trim()}`;
                return;
            }
        } catch (error) {
            console.warn('Local version fetch failed:', error);
        }

        // Final fallback - use default version
        versionDiv.textContent = 'v1.0.0';
    }

    async fetchVersionFromGitHub() {
        try {
            console.log('Fetching version from GitHub API...');
            
            // Fetch latest commit from GitHub API
            const apiUrl = `https://api.github.com/repos/mitrhaCoding/refill/commits?per_page=1`;
            console.log('API URL:', apiUrl);
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Liquid-Sort-Game-App'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API responded with ${response.status}`);
            }

            const data = await response.json();
            const latestCommit = data[0]; // Get the first (most recent) commit
            const commitMessage = latestCommit.commit.message.toLowerCase();
            const commitDate = new Date(latestCommit.commit.author.date);
            const commitHash = latestCommit.sha.substring(0, 7);

            // Generate version based on commit analysis
            let version = await this.generateVersionFromCommit(commitMessage, commitDate, commitHash);
            
            console.log('Generated version from GitHub:', version);
            return version;

        } catch (error) {
            console.warn('Failed to fetch from GitHub API:', error);
            return null;
        }
    }

    async generateVersionFromCommit(commitMessage, commitDate, commitHash) {
        console.log('generateVersionFromCommit called with:', { commitMessage, commitDate, commitHash });
        
        try {
            // Fetch commit history to track version progression
            const historyUrl = `https://api.github.com/repos/mitrhaCoding/refill/commits?per_page=50&_t=${Date.now()}`;
            const historyResponse = await fetch(historyUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Liquid-Sort-Game-App'
                }
            });

            if (!historyResponse.ok) {
                throw new Error(`Failed to fetch commit history: ${historyResponse.status}`);
            }

            const commits = await historyResponse.json();
            console.log('Fetched commit history:', commits.length, 'commits');

            // Start with base version and calculate increments from commit history
            let major = 0, minor = 0, patch = 0; // Starting version 0.0.0
            
            // Process commits from oldest to newest (reverse order)
            const reversedCommits = commits.slice().reverse();
            console.log('Processing commits in chronological order...');
            
            for (const commit of reversedCommits) {
                const msg = commit.commit.message.toLowerCase();
                const shortSha = commit.sha.substring(0, 7);
                
                // Only process version-related commits
                if (msg.includes('version') || msg.includes('major') || msg.includes('minor') || 
                    msg.includes('patch') || msg.includes('feature') || msg.includes('breaking')) {
                    
                    console.log(`Processing version commit ${shortSha}: "${msg}"`);
                    
                    if (msg.includes('major') || msg.includes('breaking')) {
                        major += 1;
                        minor = 0;
                        patch = 0;
                        console.log(`  → Major version increment: ${major}.${minor}.${patch}`);
                    } else if ((msg.includes('minor') && !msg.includes('patch')) || 
                               (msg.includes('feature') && !msg.includes('patch') && !msg.includes('version'))) {
                        minor += 1;
                        patch = 0;
                        console.log(`  → Minor version increment: ${major}.${minor}.${patch}`);
                    } else if (msg.includes('patch') || msg.includes('version')) {
                        patch += 1;
                        console.log(`  → Patch version increment: ${major}.${minor}.${patch}`);
                    } else {
                        // Default fallback for version-related commits
                        patch += 1;
                        console.log(`  → Default patch increment: ${major}.${minor}.${patch}`);
                    }
                } else {
                    console.log(`Skipping non-version commit ${shortSha}: "${msg}"`);
                }
            }

            const finalVersion = `${major}.${minor}.${patch}`;
            console.log('Final calculated version:', finalVersion);
            
            return finalVersion;

        } catch (error) {
            console.warn('Failed to fetch commit history, falling back to simple increment:', error);
            
            // Fallback: use a reasonable base version and simple increment
            let major = 0, minor = 0, patch = 1; // Start at 0.0.1 as reasonable fallback
            
            if (commitMessage.includes('major') || commitMessage.includes('breaking')) {
                major = 1;
                minor = 0;
                patch = 0;
            } else if (commitMessage.includes('minor') || commitMessage.includes('feature') || commitMessage.includes('add')) {
                minor = 1;
                patch = 0;
            } else if (commitMessage.includes('patch') || commitMessage.includes('version')) {
                patch = 1; // First patch version
            }
            
            return `${major}.${minor}.${patch}`;
        }
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
        
        console.log(`Found ${validMoves} valid moves. Check console for details.`);
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

        // Remove control event listeners (including modal events)
        this.removeControlEventListeners();
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

console.log('Script loaded');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    const game = new Game();
});