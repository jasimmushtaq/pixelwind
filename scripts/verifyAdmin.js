import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAdmin() {
  console.log("Looking up admin@pixelwind.com...");
  
  // 1. Get the user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError.message);
    return;
  }

  const adminUser = users.find(u => u.email === 'admin@pixelwind.com');
  
  if (!adminUser) {
    console.error("User admin@pixelwind.com not found!");
    return;
  }

  console.log("User found. ID:", adminUser.id);
  console.log("Force verifying email...");

  // 2. Update the user to confirm their email
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    adminUser.id,
    { email_confirm: true }
  );

  if (updateError) {
    console.error("Error updating user:", updateError.message);
  } else {
    console.log("Success! The user's email has been verified.");
    console.log("You can now log in!");
  }
}

verifyAdmin();
