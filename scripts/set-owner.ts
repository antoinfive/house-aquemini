import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const email = process.argv[2] || 'test@example.com';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setOwner() {
  console.log(`Setting owner for: ${email}`);

  // Find user
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Failed to list users:', listError.message);
    return;
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.error(`User not found: ${email}`);
    console.log('Available users:', users.users.map(u => u.email).join(', ') || 'none');
    return;
  }

  console.log('Found user:', user.id);

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (existingProfile) {
    console.log('Profile exists, updating...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_owner: true })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update failed:', updateError.message);
      return;
    }
  } else {
    console.log('Profile does not exist, creating...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ user_id: user.id, is_owner: true });

    if (insertError) {
      console.error('Insert failed:', insertError.message);
      return;
    }
  }

  console.log('✓ Owner flag set successfully!');
  console.log('\n========================================');
  console.log(`Email: ${email}`);
  console.log('You can now log in at /login');
  console.log('========================================');
}

setOwner();
