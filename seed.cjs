const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://opxzdmvpmflurybnxwcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weHpkbXZwbWZsdXJ5Ym54d2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTM2NzksImV4cCI6MjEwMzA2OTY3OX0.zPlSpnl0E0uaKlG4hbxqSgR9Fiy-ji6sKBRKBoPK0Qc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  console.log("Seeding test data minimal...");

  // 1. Insert course
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .insert({ course_name: 'App Development' })
    .select().single();
  
  if (courseErr) console.log("Course error:", courseErr.message);

  // 2. Insert student
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert({ 
      full_name: 'JOHN DOE', 
      father_name: 'Richard Doe', 
      student_id: 'STU-12345',
      phone: '1234567890',
      email: 'john@example.com'
    })
    .select().single();
    
  if (studentErr) console.log("Student error:", studentErr.message);

  if (student && course) {
    // 3. Insert enrollment
    const { data: enrollment, error: enrollErr } = await supabase
      .from('enrollments')
      .insert({
        student_id: student.id,
        course_id: course.id,
        start_date: '2026-01-01',
        end_date: '2026-06-01',
        status: 'completed'
      })
      .select().single();

    if (enrollErr) console.log("Enrollment error:", enrollErr.message);

    if (enrollment) {
      // 4. Insert certificate
      const metadata = JSON.stringify({
        grade: 'A+',
        branch: 'Vizag Branch',
        organization: 'Pixelwind Technologies',
        start_date: '2026-01-01',
        end_date: '2026-06-01',
        internship_no: 'INTERNSHIP_123456789'
      });

      const { data: certificate, error: certErr } = await supabase
        .from('certificates')
        .insert({
          enrollment_id: enrollment.id,
          certificate_no: 'CERT-2026-9999',
          issue_date: '2026-06-01',
          template_version: metadata
        })
        .select().single();

      if (certErr) console.log("Certificate error:", certErr.message);
      else console.log("Successfully seeded test certificate CERT-2026-9999!");
    }
  }
}

seedData();
