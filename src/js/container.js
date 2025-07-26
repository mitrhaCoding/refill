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
        if (this.isEmpty() || targetContainer.isFull()) {
            return false;
        }
        
        if (targetContainer.isEmpty()) {
            return true;
        }
        
        return this.getTopLiquid().color === targetContainer.getTopLiquid().color;
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
}