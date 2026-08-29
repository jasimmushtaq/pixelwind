import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User, Phone, Mail, MapPin, ChevronLeft, Edit2 } from 'lucide-react';
import EditStudentModal from '@/components/EditStudentModal';
import EnrollmentSection from '@/components/EnrollmentSection';

export default function StudentProfile() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(searchParams.get('edit') === 'true');

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      setStudent(data);
    } catch (err) {
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSearchParams({}); // remove ?edit=true
    fetchStudent(); // refresh data
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Student not found</h2>
        <Link to="/students" className="mt-4 text-blue-600 hover:underline inline-block">Back to Students</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link to="/students" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2">
            <ChevronLeft size={16} className="mr-1" /> Back to Students
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {student.full_name}
            <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {student.student_id}
            </span>
          </h1>
        </div>
        
        <button 
          onClick={() => setShowEditModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <Edit2 size={16} />
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden shadow-inner border-2 border-white dark:border-gray-800">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-full h-full text-gray-400 p-4" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{student.full_name}</h2>
              <p className="text-sm text-gray-500">{student.student_id}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider mb-2">Contact Info</h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone size={16} className="mr-3 text-gray-400" />
                {student.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Mail size={16} className="mr-3 text-gray-400" />
                {student.email || 'N/A'}
              </div>
              <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} className="mr-3 text-gray-400 mt-1 shrink-0" />
                <span>
                  {student.address_line1}<br />
                  {student.address_line2 && <>{student.address_line2}<br/></>}
                  {student.city}, {student.state} {student.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Other Details & Enrollments */}
        <div className="md:col-span-2 space-y-6">
          <EnrollmentSection studentId={student.id} />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guardian & Additional Info</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Father's Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.father_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Mother's Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.mother_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Guardian Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.guardian_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Guardian Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.guardian_phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Highest Qualification</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.highest_qualification || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Passing Year</p>
                <p className="font-medium text-gray-900 dark:text-white">{student.passing_year || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditStudentModal student={student} onClose={closeEditModal} />
      )}
    </div>
  );
}
