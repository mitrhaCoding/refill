class Container {
    constructor(capacity) {
        this.capacity = capacity;
        this.liquids = [];
    }

    addLiquid(liquid) {
        if (!this.isFull()) {
            this.liquids.push(liquid);
            return true;
        }
        return false;
    }

    removeLiquid() {
        return this.liquids.pop();
    }

    isFull() {
        return this.liquids.length >= this.capacity;
    }

    isEmpty() {
        return this.liquids.length === 0;
    }

    getTopLiquid() {
        return this.liquids[this.liquids.length - 1];
    }

    getContents() {
        return this.liquids;
    }

    clear() {
        this.liquids = [];
    }

    canPourTo(targetContainer) {
        // Can't pour if source is empty
        if (this.isEmpty()) {
            return false;
        }
        
        // Can't pour if target is full
        if (targetContainer.isFull()) {
            return false;
        }
        
        // Can pour into empty container
        if (targetContainer.isEmpty()) {
            return true;
        }
        
        // Can only pour if top colors match
        const sourceTopColor = this.getTopLiquid().color;
        const targetTopColor = targetContainer.getTopLiquid().color;
        
        return sourceTopColor === targetTopColor;
    }

    getConsecutiveTopLiquids() {
        if (this.isEmpty()) {
            return [];
        }
        
        const topColor = this.getTopLiquid().color;
        const consecutiveLiquids = [];
        
        // Start from the top and work backwards
        for (let i = this.liquids.length - 1; i >= 0; i--) {
            if (this.liquids[i].color === topColor) {
                consecutiveLiquids.unshift(this.liquids[i]);
            } else {
                break;
            }
        }
        
        return consecutiveLiquids;
    }

    removeMultipleLiquids(count) {
        const removedLiquids = [];
        for (let i = 0; i < count; i++) {
            if (!this.isEmpty()) {
                removedLiquids.unshift(this.removeLiquid());
            }
        }
        return removedLiquids.reverse();
    }

    getAvailableSpace() {
        return this.capacity - this.liquids.length;
    }

    isSorted() {
        if (this.isEmpty()) {
            return true; // Empty containers are considered sorted
        }
        
        // Check if all liquids in the container are the same color
        const firstColor = this.liquids[0].color;
        return this.liquids.every(liquid => liquid.color === firstColor);
    }

    isCompletelyFilled() {
        return this.isFull() && this.isSorted();
    }
}