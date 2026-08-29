import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const admins = [
    { email: 'varun.pw@pw.com', password: 'India_Pw@1', name: 'Varun Admin' },
    { email: 'hr.pw@pw.com', password: 'India_Pw@1', name: 'HR Admin' }
  ];

  for (const admin of admins) {
    console.log(`Attempting to sign up ${admin.email}...`);
    
    const { data, error } = await supabase.auth.signUp({
      email: admin.email,
      password: admin.password,
      options: {
        data: {
          full_name: admin.name
        }
      }
    });

    if (error) {
      console.error(`Error creating ${admin.email}:`, error.message);
    } else {
      console.log(`Success! User ${admin.email} created.`);
    }
  }
}

createAdmin();
