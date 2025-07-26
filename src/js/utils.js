function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function checkWinCondition(containers) {
    return containers.every(container => {
        if (container.isEmpty()) return true;
        const firstColor = container.liquids[0].color;
        return container.liquids.every(liquid => liquid.color === firstColor);
    });
}