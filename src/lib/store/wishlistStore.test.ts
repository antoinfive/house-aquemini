import { beforeEach, describe, expect, it } from 'vitest';
import { useWishlistStore } from './wishlistStore';

describe('wishlistStore filter normalization', () => {
  beforeEach(() => {
    useWishlistStore.getState().reset();
  });

  it('does not invalidate cached results for an empty search', () => {
    useWishlistStore.setState({ lastFetchedAt: 789 });

    useWishlistStore.getState().setFilters({ search: undefined });

    const state = useWishlistStore.getState();

    expect(state.filters).toEqual({});
    expect(state.lastFetchedAt).toBe(789);
  });
});
