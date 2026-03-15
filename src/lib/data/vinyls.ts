import { createClient } from '@/lib/supabase/server';
import type { Vinyl } from '@/lib/types';

/**
 * Server-side function to fetch all vinyls.
 * Use this in Server Components for initial data loading.
 */
export async function getVinyls(limit?: number): Promise<Vinyl[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vinyls')
    .select('*')
    .order('artist', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vinyls:', error);
    return [];
  }

  return data || [];
}

/**
 * Server-side function to fetch a single vinyl by ID.
 * Use this in Server Components for detail page loading.
 */
export async function getVinylById(id: string): Promise<Vinyl | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vinyls')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching vinyl:', error);
    return null;
  }

  return data;
}
