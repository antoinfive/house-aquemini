import { beforeEach, describe, expect, it } from 'vitest';
import { useVinylStore } from './vinylStore';

describe('vinylStore filter normalization', () => {
  beforeEach(() => {
    useVinylStore.getState().reset();
  });

  it('does not create a fake active filter for an empty search', () => {
    useVinylStore.setState({ lastFetchedAt: 123 });

    useVinylStore.getState().setFilters({ search: undefined });

    const state = useVinylStore.getState();

    expect(state.filters).toEqual({});
    expect(state.lastFetchedAt).toBe(123);
  });

  it('removes empty array filters when clearing a selected genre', () => {
    useVinylStore.getState().setFilters({ genre: ['Hip-Hop'] });
    useVinylStore.setState({ lastFetchedAt: 456 });

    useVinylStore.getState().setFilters({ genre: [] });

    const state = useVinylStore.getState();

    expect(state.filters).toEqual({});
    expect(state.lastFetchedAt).toBeNull();
  });
});
