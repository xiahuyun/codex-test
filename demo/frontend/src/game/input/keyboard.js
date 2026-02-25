const keyDirectionMap = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
};
export function registerKeyboardInput(onDirection) {
    const handler = (event) => {
        const next = keyDirectionMap[event.code];
        if (!next) {
            return;
        }
        event.preventDefault();
        onDirection(next);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
}
