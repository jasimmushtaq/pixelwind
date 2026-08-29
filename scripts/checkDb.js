import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDb() {
  const { data, error } = await supabase.from('students').select('*');
  if (error) {
    console.error("Error fetching students:", error.message);
  } else {
    console.log("Students data:");
    console.dir(data, { depth: null });
  }
}

checkDb();
