import { useState, useEffect } from 'react';
import { Search, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import CertificateModal from '@/components/CertificateModal';

export default function Certificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          enrollments (
            start_date,
            end_date,
            students (id, full_name, student_id),
            courses (course_name)
          )
        `)
        .order('issue_date', { ascending: false });
        
      if (error) throw error;
      setCertificates(data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = certificates.filter(cert => {
    const student = cert.enrollments?.students;
    return (
      student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_no.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award size={24} className="text-purple-600" />
            Certificates Registry
          </h1>
          <p className="text-gray-500 text-sm mt-1">Global ledger of all issued certificates and marks memos.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by student name, ID, or Certificate No"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-100 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Certificate No
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Completed
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading registry...</td>
              </tr>
            ) : filteredList.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No certificates found.</td>
               </tr>
             ) : (
              filteredList.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-sm font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 font-mono">
                      {cert.certificate_no}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/students/${cert.enrollments?.students?.id}`} className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">
                      {cert.enrollments?.students?.full_name}
                    </Link>
                    <div className="text-xs text-gray-500">{cert.enrollments?.students?.student_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {cert.enrollments?.courses?.course_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {format(new Date(cert.issue_date), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedCertificate(cert)}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3"
                    >
                      View Certificate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
