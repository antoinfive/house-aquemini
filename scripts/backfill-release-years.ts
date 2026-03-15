import { createClient } from '@supabase/supabase-js';
import { getMaster, getRelease } from '../src/lib/discogs/client';

interface VinylRow {
  id: string;
  artist: string;
  album: string;
  discogs_id: string | null;
  year: number | null;
  release_year: number | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const args = new Set(process.argv.slice(2));
const writeChanges = args.has('--write');
const processAllRows = args.has('--all');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

if (limitArg && Number.isNaN(limit)) {
  console.error(`Invalid limit value: ${limitArg}`);
  process.exit(1);
}

async function fetchRows(): Promise<VinylRow[]> {
  const pageSize = 200;
  const rows: VinylRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('vinyls')
      .select('id, artist, album, discogs_id, year, release_year')
      .not('discogs_id', 'is', null)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch vinyls: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...(data as VinylRow[]));

    if (data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

function isCandidate(row: VinylRow): boolean {
  if (!row.discogs_id) {
    return false;
  }

  if (processAllRows) {
    return true;
  }

  // Default mode focuses on rows that were backfilled from pressing year
  // or still have no release year at all.
  return row.release_year === null || row.release_year === row.year;
}

async function resolveReleaseYear(discogsId: string): Promise<number | null> {
  const releaseId = parseInt(discogsId, 10);
  if (Number.isNaN(releaseId) || releaseId <= 0) {
    return null;
  }

  const { data: release, error: releaseError } = await getRelease(releaseId);
  if (releaseError || !release) {
    throw new Error(releaseError || 'Discogs release not found');
  }

  if (release.master_id) {
    const { data: master, error: masterError } = await getMaster(release.master_id);
    if (!masterError && master?.year) {
      return master.year;
    }
  }

  return release.year || null;
}

async function main() {
  const allRows = await fetchRows();
  const candidates = allRows.filter(isCandidate);
  const targetRows = typeof limit === 'number' ? candidates.slice(0, limit) : candidates;

  console.log(`Mode: ${writeChanges ? 'write' : 'dry-run'}`);
  console.log(`Scope: ${processAllRows ? 'all Discogs-backed rows' : 'rows needing backfill review'}`);
  console.log(`Discogs-backed rows: ${allRows.length}`);
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Processing: ${targetRows.length}`);

  const stats = {
    updated: 0,
    unchanged: 0,
    skipped: 0,
    failed: 0,
  };

  for (const [index, row] of targetRows.entries()) {
    const label = `${row.artist} - ${row.album}`;
    const prefix = `[${index + 1}/${targetRows.length}]`;

    if (!row.discogs_id) {
      stats.skipped += 1;
      console.log(`${prefix} skip ${label}: missing Discogs ID`);
      continue;
    }

    try {
      const resolvedReleaseYear = await resolveReleaseYear(row.discogs_id);

      if (resolvedReleaseYear === null) {
        stats.skipped += 1;
        console.log(`${prefix} skip ${label}: no release year from Discogs`);
        continue;
      }

      if (row.release_year === resolvedReleaseYear) {
        stats.unchanged += 1;
        console.log(`${prefix} ok ${label}: already ${resolvedReleaseYear}`);
        continue;
      }

      if (!writeChanges) {
        stats.updated += 1;
        console.log(
          `${prefix} would update ${label}: ${row.release_year ?? 'null'} -> ${resolvedReleaseYear}`
        );
        continue;
      }

      const { error: updateError } = await supabase
        .from('vinyls')
        .update({ release_year: resolvedReleaseYear })
        .eq('id', row.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      stats.updated += 1;
      console.log(
        `${prefix} updated ${label}: ${row.release_year ?? 'null'} -> ${resolvedReleaseYear}`
      );
    } catch (error) {
      stats.failed += 1;
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`${prefix} failed ${label}: ${message}`);
    }
  }

  console.log('\nSummary');
  console.log(`  Updated: ${stats.updated}`);
  console.log(`  Unchanged: ${stats.unchanged}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Failed: ${stats.failed}`);

  if (!writeChanges) {
    console.log('\nRun with --write to persist changes.');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
