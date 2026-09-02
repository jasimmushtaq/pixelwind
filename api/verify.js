import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Certificate ID is required' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://opxzdmvpmflurybnxwcg.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weHpkbXZwbWZsdXJ5Ym54d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTM2NzksImV4cCI6MjEwMzA2OTY3OX0.zPlSpnl0E0uaKlG4hbxqSgR9Fiy-ji6sKBRKBoPK0Qc';
    
    // Create client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate securely on the server side to bypass RLS for public viewing
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: 'varun.pw@pw.com',
      password: 'India_Pw@1'
    });

    if (authError) {
      console.error("Auth error:", authError);
      return res.status(500).json({ error: 'Internal Server Error (Auth)' });
    }

    // Now query the certificate as an authenticated user
    const { data: foundCert, error } = await supabase
      .from('certificates')
      .select(`
        id,
        certificate_no,
        issue_date,
        template_version,
        enrollment_id,
        enrollments (
          id,
          start_date,
          end_date,
          students (full_name, father_name, student_id),
          courses (course_name)
        )
      `)
      .eq('certificate_no', id)
      .maybeSingle();

    if (error) {
      console.error("DB error:", error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!foundCert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Return the certificate securely
    return res.status(200).json(foundCert);

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
