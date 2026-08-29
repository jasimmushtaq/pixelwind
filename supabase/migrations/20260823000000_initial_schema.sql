-- Enums
CREATE TYPE admin_role AS ENUM ('super_admin', 'staff_admin');
CREATE TYPE enquiry_status AS ENUM ('new', 'follow_up', 'converted', 'closed');
CREATE TYPE enrollment_status AS ENUM ('enrolled', 'in_progress', 'completed', 'dropped');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue');

-- Profiles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role admin_role NOT NULL DEFAULT 'staff_admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enquiries
CREATE TABLE enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_no TEXT UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    interested_course TEXT,
    source TEXT,
    status enquiry_status NOT NULL DEFAULT 'new',
    notes JSONB DEFAULT '[]'::jsonb,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    father_name TEXT,
    mother_name TEXT,
    guardian_name TEXT,
    guardian_relation TEXT,
    guardian_phone TEXT,
    aadhaar_number TEXT,
    highest_qualification TEXT,
    institution_name TEXT,
    passing_year INT,
    percentage_or_cgpa TEXT,
    photo_url TEXT,
    photo_public_id TEXT,
    aadhaar_doc_url TEXT,
    qualification_doc_url TEXT,
    converted_from_enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name TEXT NOT NULL,
    course_code TEXT UNIQUE NOT NULL,
    duration TEXT,
    description TEXT,
    default_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_no TEXT UNIQUE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    final_payable NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    outstanding_balance NUMERIC(10, 2) GENERATED ALWAYS AS (final_payable - total_paid) STORED,
    status enrollment_status NOT NULL DEFAULT 'enrolled',
    joined_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installments
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    installment_no INT NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    due_date DATE,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_date DATE,
    payment_mode TEXT,
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT UNIQUE NOT NULL,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_fee NUMERIC(10, 2),
    discount NUMERIC(10, 2),
    final_payable NUMERIC(10, 2),
    total_paid NUMERIC(10, 2),
    balance NUMERIC(10, 2),
    payment_status TEXT,
    pdf_url TEXT,
    pdf_public_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE UNIQUE,
    certificate_no TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    template_version TEXT,
    pdf_url TEXT,
    pdf_public_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marks Memos
CREATE TABLE marks_memos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE UNIQUE,
    memo_no TEXT UNIQUE NOT NULL,
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_max_marks NUMERIC(10, 2),
    total_obtained_marks NUMERIC(10, 2),
    percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END
    ) STORED,
    result TEXT GENERATED ALWAYS AS (
        CASE WHEN (CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END) >= 40 THEN 'PASS' ELSE 'FAIL' END
    ) STORED,
    grade TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN (CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END) >= 80 THEN 'A+'
            WHEN (CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END) >= 70 THEN 'A'
            WHEN (CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END) >= 60 THEN 'B'
            WHEN (CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END) >= 50 THEN 'C'
            WHEN (CASE WHEN total_max_marks > 0 THEN (total_obtained_marks / total_max_marks) * 100 ELSE 0 END) >= 40 THEN 'D'
            ELSE 'F'
        END
    ) STORED,
    pdf_url TEXT,
    pdf_public_id TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- Trigger for total_paid recalculation
CREATE OR REPLACE FUNCTION recalculate_enrollment_total_paid()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE enrollments
    SET total_paid = (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM installments
        WHERE enrollment_id = COALESCE(NEW.enrollment_id, OLD.enrollment_id)
    )
    WHERE id = COALESCE(NEW.enrollment_id, OLD.enrollment_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_total_paid_after_installment_change
AFTER INSERT OR UPDATE OF amount_paid, enrollment_id OR DELETE ON installments
FOR EACH ROW
EXECUTE PROCEDURE recalculate_enrollment_total_paid();


-- Trigger for Auto-Generating sequence IDs
CREATE SEQUENCE IF NOT EXISTS enquiry_seq START 1;
CREATE OR REPLACE FUNCTION set_enquiry_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enquiry_no IS NULL THEN
        NEW.enquiry_no := 'ENQ-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('enquiry_seq')::text, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_set_enquiry_no BEFORE INSERT ON enquiries FOR EACH ROW EXECUTE PROCEDURE set_enquiry_no();

CREATE SEQUENCE IF NOT EXISTS student_seq START 1;
CREATE OR REPLACE FUNCTION set_student_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.student_id IS NULL THEN
        NEW.student_id := 'PXL-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('student_seq')::text, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_set_student_id BEFORE INSERT ON students FOR EACH ROW EXECUTE PROCEDURE set_student_id();

CREATE SEQUENCE IF NOT EXISTS enrollment_seq START 1;
CREATE OR REPLACE FUNCTION set_enrollment_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enrollment_no IS NULL THEN
        NEW.enrollment_no := 'ENR-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('enrollment_seq')::text, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_set_enrollment_no BEFORE INSERT ON enrollments FOR EACH ROW EXECUTE PROCEDURE set_enrollment_no();
