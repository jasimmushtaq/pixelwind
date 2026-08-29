-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks_memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: 
-- 1. Users can read all profiles (needed for assignments)
-- 2. Only super_admin can insert/update/delete profiles
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Super admins can manage profiles" ON profiles FOR ALL USING (is_super_admin());
-- Users can update their own profile (maybe just full_name or something, but super_admin can update all).
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Enquiries: All admins can manage enquiries
CREATE POLICY "Admins can manage enquiries" ON enquiries FOR ALL USING (is_admin());

-- Students: All admins can manage students
CREATE POLICY "Admins can manage students" ON students FOR ALL USING (is_admin());

-- Courses: All admins can manage courses
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (is_admin());

-- Enrollments: All admins can manage enrollments
CREATE POLICY "Admins can manage enrollments" ON enrollments FOR ALL USING (is_admin());

-- Installments: All admins can manage installments
CREATE POLICY "Admins can manage installments" ON installments FOR ALL USING (is_admin());

-- Invoices: All admins can manage invoices
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (is_admin());

-- Certificates: All admins can manage certificates
CREATE POLICY "Admins can manage certificates" ON certificates FOR ALL USING (is_admin());

-- Marks Memos: All admins can manage marks memos
CREATE POLICY "Admins can manage marks memos" ON marks_memos FOR ALL USING (is_admin());

-- Activity Log: All admins can insert and read
CREATE POLICY "Admins can read activity log" ON activity_log FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert activity log" ON activity_log FOR INSERT WITH CHECK (is_admin());
