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
    // Check if all available moves are non-progressive regardless of count
    // A game is stuck when all moves are just shuffling liquids without making progress
    
    // If there are very few moves, they're more likely to be futile
    if (validMoves.length <= 3) {
        return validMoves.every(move => isMoveNonProgressive(containers, move));
    }
    
    // For games with more moves, check if a high percentage are futile
    // This handles cases where there are many possible moves but they're all cyclical
    const futileMoves = validMoves.filter(move => isMoveNonProgressive(containers, move));
    const futilePercentage = futileMoves.length / validMoves.length;
    
    // If 80% or more of moves are futile, consider the game stuck
    // Also check for specific patterns that indicate a stuck state
    if (futilePercentage >= 0.8) {
        return true;
    }
    
    // Additional check: if all moves just shuffle between containers without 
    // creating any complete containers or meaningful separations
    return areAllMovesJustShuffling(containers, validMoves);
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
        
        // Progressive if it separates different colors meaningfully
        if (sourceContainer.liquids.length > liquidsToMove) {
            const remainingTopLiquid = sourceContainer.liquids[sourceContainer.liquids.length - liquidsToMove - 1];
            if (remainingTopLiquid.color !== color) {
                // Check if the remaining consecutive liquids form a meaningful group
                const remainingConsecutive = getConsecutiveCount(sourceContainer.liquids, sourceContainer.liquids.length - liquidsToMove - 1);
                if (remainingConsecutive >= 2) {
                    return false; // Progressive - meaningful color separation
                }
            }
        }
        
        // Check if this move can be immediately reversed (cyclical)
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
        
        // Progressive if it significantly consolidates colors (2+ liquids)
        if (liquidsToMove >= 2) {
            return false; // Moving multiple of same color is usually progressive
        }
        
        // Progressive if it creates a longer consecutive sequence
        const targetConsecutiveAfter = targetContainer.liquids.filter(l => l.color === color).length + liquidsToMove;
        if (targetConsecutiveAfter >= 3) {
            return false; // Building up a good sequence
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

function areAllMovesJustShuffling(containers, validMoves) {
    // Check if all moves are just moving liquids between containers
    // without making meaningful progress toward completion
    
    // Count how many containers are already complete (single color, full)
    const completeContainers = containers.filter(c => c.isCompletelyFilled()).length;
    
    // Check if any move would complete a container or meaningfully separate colors
    for (const move of validMoves) {
        const { from, to, liquidsToMove, color } = move;
        const sourceContainer = containers[from];
        const targetContainer = containers[to];
        
        // Progressive if it would complete a container
        if (targetContainer.liquids.length + liquidsToMove === targetContainer.capacity) {
            const targetAllSameColor = targetContainer.liquids.every(liquid => liquid.color === color);
            if (targetAllSameColor) {
                return false; // Found a completing move
            }
        }
        
        // Progressive if it would empty a container completely
        if (liquidsToMove === sourceContainer.liquids.length) {
            return false; // Found an emptying move
        }
        
        // Progressive if it would separate different colors meaningfully
        if (sourceContainer.liquids.length > liquidsToMove) {
            const remainingTopLiquid = sourceContainer.liquids[sourceContainer.liquids.length - liquidsToMove - 1];
            if (remainingTopLiquid.color !== color) {
                // This separates colors - check if it leads to better sorting
                const remainingConsecutive = getConsecutiveCount(sourceContainer.liquids, sourceContainer.liquids.length - liquidsToMove - 1);
                if (remainingConsecutive >= 2) {
                    return false; // Meaningful color separation
                }
            }
        }
    }
    
    // If no meaningful moves found, it's just shuffling
    return true;
}

function getConsecutiveCount(liquids, startIndex) {
    if (startIndex < 0 || startIndex >= liquids.length) return 0;
    
    const color = liquids[startIndex].color;
    let count = 1;
    
    // Count backwards from startIndex
    for (let i = startIndex - 1; i >= 0; i--) {
        if (liquids[i].color === color) {
            count++;
        } else {
            break;
        }
    }
    
    return count;
}

function hasValidMoves(containers) {
    return !checkLoseCondition(containers);
}