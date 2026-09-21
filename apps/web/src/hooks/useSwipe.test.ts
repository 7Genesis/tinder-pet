import { SWIPE_THRESHOLD, resolveDirection } from './useSwipe';

describe('resolveDirection', () => {
  it('reconhece arrastar para a direita e para a esquerda', () => {
    expect(resolveDirection(SWIPE_THRESHOLD)).toBe('right');
    expect(resolveDirection(-SWIPE_THRESHOLD)).toBe('left');
  });

  it('ignora arrasto curto', () => {
    expect(resolveDirection(SWIPE_THRESHOLD - 1)).toBeNull();
    expect(resolveDirection(0)).toBeNull();
  });
});
