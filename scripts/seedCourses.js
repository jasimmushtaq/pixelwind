import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const coursesToInsert = [
  { course_name: "Full Stack Development", course_code: "FSD", description: "Frontend + Backend + Deployment", duration: "6 Months", default_fee: 45000 },
  { course_name: "App Development", course_code: "APP", description: "Cross-platform mobile apps", duration: "4 Months", default_fee: 35000 },
  { course_name: "UI/UX Design", course_code: "UIUX", description: "User-centered design", duration: "3 Months", default_fee: 25000 },
  { course_name: "Cloud & DevOps", course_code: "DEV", description: "CI/CD & cloud pipelines", duration: "4 Months", default_fee: 40000 },
  { course_name: "Digital Marketing", course_code: "DM", description: "SEO & paid campaigns", duration: "3 Months", default_fee: 20000 },
  { course_name: "IT Consulting", course_code: "ITC", description: "Business tech guidance", duration: "2 Months", default_fee: 30000 },
  { course_name: "Blockchain", course_code: "BLK", description: "Smart contracts & dApps", duration: "5 Months", default_fee: 50000 },
  { course_name: "Generative AI", course_code: "GAI", description: "AI-powered automation", duration: "4 Months", default_fee: 45000 },
  { course_name: "Machine Learning", course_code: "ML", description: "Predictive models", duration: "6 Months", default_fee: 55000 },
  { course_name: "Data Analytics", course_code: "DA", description: "Data visualization", duration: "3 Months", default_fee: 30000 },
  { course_name: "Business Intelligence", course_code: "BI", description: "Data insights", duration: "4 Months", default_fee: 35000 }
];

async function seedCourses() {
  console.log("Seeding courses...");
  for (const course of coursesToInsert) {
    const { data, error } = await supabase.from('courses').upsert(course, { onConflict: 'course_code' });
    if (error) {
      console.error(`Error inserting ${course.course_code}:`, error.message);
    } else {
      console.log(`Inserted: ${course.course_name}`);
    }
  }
  console.log("Done!");
}

seedCourses();
