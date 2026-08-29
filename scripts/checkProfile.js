import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkProfile() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) return console.error(userError);
  
  const adminUser = users.users.find(u => u.email === 'admin@pixelwind.com');
  if (!adminUser) return console.error("No admin user found.");

  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', adminUser.id).single();
  
  if (profileError || !profile) {
    console.log("Profile missing! Creating one now...");
    const { error: insertError } = await supabase.from('profiles').insert({
      id: adminUser.id,
      full_name: 'Super Admin',
      role: 'super_admin'
    });
    if (insertError) console.error("Failed to create profile:", insertError);
    else console.log("Profile created successfully!");
  } else {
    console.log("Profile exists:", profile);
  }
}

checkProfile();
