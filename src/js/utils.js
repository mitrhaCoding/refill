function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function checkWinCondition(containers) {
    // Win condition: All non-empty containers must be completely filled with single colors
    // Empty containers are allowed as they serve as temporary storage
    return containers.every(container => {
        if (container.isEmpty()) {
            return true; // Empty containers are fine
        }
        // Non-empty containers must be completely filled with same color
        return container.isCompletelyFilled();
    });
}

function checkLoseCondition(containers) {
    // First check if there are any moves at all
    const validMoves = getAllValidMoves(containers);
    
    if (validMoves.length === 0) {
        return true; // No moves possible = immediate loss
    }
    
    // Check if all available moves are futile (just moving liquids back and forth)
    return allMovesAreFutile(containers, validMoves);
}

function getAllValidMoves(containers) {
    const moves = [];
    
    for (let i = 0; i < containers.length; i++) {
        const sourceContainer = containers[i];
        if (sourceContainer.isEmpty()) continue;
        
        for (let j = 0; j < containers.length; j++) {
            if (i === j) continue;
            const targetContainer = containers[j];
            
            if (sourceContainer.canPourTo(targetContainer)) {
                // Get details about what would be moved
                const consecutiveLiquids = sourceContainer.getConsecutiveTopLiquids();
                const availableSpace = targetContainer.getAvailableSpace();
                const liquidsToMove = Math.min(consecutiveLiquids.length, availableSpace);
                
                if (liquidsToMove > 0) {
                    moves.push({ 
                        from: i, 
                        to: j, 
                        liquidsToMove,
                        color: sourceContainer.getTopLiquid().color
                    });
                }
            }
        }
    }
    
    return moves;
}

function allMovesAreFutile(containers, validMoves) {
    // If there are 3 or fewer moves, check if they're all cyclical
    if (validMoves.length <= 3) {
        return validMoves.every(move => isMoveNonProgressive(containers, move));
    }
    
    // If there are more moves, the game is probably not stuck
    return false;
}

function isMoveNonProgressive(containers, move) {
    const { from, to, liquidsToMove, color } = move;
    const sourceContainer = containers[from];
    const targetContainer = containers[to];
    
    // Case 1: Moving to empty container
    if (targetContainer.isEmpty()) {
        // Progressive if it empties the source container completely
        if (liquidsToMove === sourceContainer.liquids.length) {
            return false; // Progressive - empties a container
        }
        
        // Progressive if it separates different colors
        if (sourceContainer.liquids.length > liquidsToMove) {
            const remainingTopLiquid = sourceContainer.liquids[sourceContainer.liquids.length - liquidsToMove - 1];
            if (remainingTopLiquid.color !== color) {
                return false; // Progressive - separating colors
            }
        }
        
        // Otherwise, check if this move can be immediately reversed
        return canMoveBeImmediatelyReversed(containers, move);
    }
    
    // Case 2: Moving to container with same color
    else {
        // Progressive if it completes a container with single color
        const targetWillBeFull = targetContainer.liquids.length + liquidsToMove === targetContainer.capacity;
        if (targetWillBeFull) {
            // Check if target would be all same color
            const targetAllSameColor = targetContainer.liquids.every(liquid => liquid.color === color);
            if (targetAllSameColor) {
                return false; // Progressive - completing a single-color container
            }
        }
        
        // Progressive if it significantly consolidates colors
        if (liquidsToMove >= 2) {
            return false; // Moving multiple of same color is usually progressive
        }
        
        // For single liquid moves, check if it can be immediately reversed
        return canMoveBeImmediatelyReversed(containers, move);
    }
}

function canMoveBeImmediatelyReversed(containers, move) {
    const { from, to, liquidsToMove, color } = move;
    const sourceContainer = containers[from];
    const targetContainer = containers[to];
    
    // Simulate the move
    const sourceAfterMove = {
        isEmpty: sourceContainer.liquids.length === liquidsToMove,
        liquids: sourceContainer.liquids.slice(0, -liquidsToMove),
        getTopColor: function() {
            return this.liquids.length > 0 ? this.liquids[this.liquids.length - 1].color : null;
        }
    };
    
    const targetAfterMove = {
        isFull: targetContainer.liquids.length + liquidsToMove === targetContainer.capacity,
        topColor: color,
        availableSpace: targetContainer.capacity - (targetContainer.liquids.length + liquidsToMove)
    };
    
    // Can reverse if:
    // 1. Target can pour back (not full after move)
    // 2. Source can receive (has space after move)  
    // 3. Colors match for pouring back
    
    if (targetAfterMove.isFull) {
        return false; // Can't pour back if target becomes full
    }
    
    if (sourceAfterMove.isEmpty) {
        return true; // Can definitely pour back to empty container
    }
    
    // Check if colors would allow reverse pour
    const sourceTopAfterMove = sourceAfterMove.getTopColor();
    if (sourceTopAfterMove === color) {
        return true; // Same colors = can pour back = cyclical move
    }
    
    return false; // Different colors = can't pour back = potentially progressive
}

function hasValidMoves(containers) {
    return !checkLoseCondition(containers);
}