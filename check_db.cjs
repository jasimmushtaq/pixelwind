const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://opxzdmvpmflurybnxwcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weHpkbXZwbWZsdXJ5Ym54d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTM2NzksImV4cCI6MjEwMzA2OTY3OX0.zPlSpnl0E0uaKlG4hbxqSgR9Fiy-ji6sKBRKBoPK0Qc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("Authenticating as admin...");
  await supabase.auth.signInWithPassword({
    email: 'varun.pw@pw.com',
    password: 'India_Pw@1'
  });

  const { data: certs } = await supabase.from('certificates').select('certificate_no');
  console.log("Certificates in DB:", certs);
  
  const { data: students } = await supabase.from('students').select('full_name');
  console.log("Students in DB:", students);
}

checkData();
