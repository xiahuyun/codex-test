export function registerSwipeInput(element, onDirection) {
    const tracker = { startX: 0, startY: 0 };
    const onTouchStart = (event) => {
        tracker.startX = event.changedTouches[0].clientX;
        tracker.startY = event.changedTouches[0].clientY;
    };
    const onTouchEnd = (event) => {
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;
        const dx = endX - tracker.startX;
        const dy = endY - tracker.startY;
        const threshold = 24;
        if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
            return;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
            onDirection(dx > 0 ? 'right' : 'left');
            return;
        }
        onDirection(dy > 0 ? 'down' : 'up');
    };
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
        element.removeEventListener('touchstart', onTouchStart);
        element.removeEventListener('touchend', onTouchEnd);
    };
}
