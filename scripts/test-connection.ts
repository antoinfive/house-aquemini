import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `✓ (${supabaseUrl})` : '✗ missing');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✓ (${supabaseAnonKey.substring(0, 20)}...)` : '✗ missing');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `✓ (${supabaseServiceKey.substring(0, 20)}...)` : '✗ missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\nMissing required environment variables!');
  process.exit(1);
}

console.log('\n--- Testing with ANON key ---');
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonConnection() {
  try {
    // Try to query profiles table (will fail if table doesn't exist)
    const { data, error } = await anonClient
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('✓ Connection works! But tables do not exist yet.');
        console.log('  → Run the migration in Supabase SQL Editor');
        return 'needs_migration';
      }
      if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
        console.log('✓ Connection works! Tables exist but RLS is blocking (expected for anon).');
        return 'connected';
      }
      console.error('Query error:', error.code, error.message);
      return 'error';
    }

    console.log('✓ Connection successful! Tables exist.');
    console.log('  Profiles found:', data?.length || 0);
    return 'connected';
  } catch (err) {
    console.error('Connection failed:', err);
    return 'error';
  }
}

async function testServiceConnection() {
  if (!supabaseServiceKey) {
    console.log('\n--- Skipping SERVICE key test (not provided) ---');
    return;
  }

  console.log('\n--- Testing with SERVICE ROLE key ---');
  const serviceClient = createClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { data, error } = await serviceClient.auth.admin.listUsers({ perPage: 1 });

    if (error) {
      console.error('Service key test failed:', error.message);
      console.log('\nPossible issues:');
      console.log('  - Service role key might be incorrect');
      console.log('  - Key might have extra whitespace or newlines');
      console.log('  - Get the correct key from Supabase Dashboard > Settings > API');
      return;
    }

    console.log('✓ Service role connection works!');
    console.log('  Users in database:', data.users.length);
  } catch (err) {
    console.error('Service key test failed:', err);
  }
}

async function main() {
  const anonResult = await testAnonConnection();
  await testServiceConnection();

  console.log('\n========================================');
  if (anonResult === 'needs_migration') {
    console.log('NEXT STEP: Run the migration SQL');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Paste contents of: supabase/migrations/001_initial_schema.sql');
    console.log('3. Click "Run"');
  } else if (anonResult === 'connected') {
    console.log('Database is ready! You can proceed with the app.');
  }
  console.log('========================================');
}

main();
