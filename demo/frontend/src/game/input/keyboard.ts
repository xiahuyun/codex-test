import type { Direction } from '../types';

const keyDirectionMap: Record<string, Direction> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

export function registerKeyboardInput(onDirection: (direction: Direction) => void): () => void {
  const handler = (event: KeyboardEvent): void => {
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
