import { useState, useEffect } from 'react';
import { Search, Users, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function JoiningList() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrollRes, courseRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            *,
            courses (id, course_name, course_code),
            students (id, full_name, student_id, phone, email)
          `)
          .eq('status', 'enrolled')
          .order('created_at', { ascending: false }),
        supabase.from('courses').select('id, course_name').order('course_name')
      ]);
        
      if (enrollRes.error) throw enrollRes.error;
      if (courseRes.error) throw courseRes.error;
      
      setEnrollments(enrollRes.data || []);
      setCourses(courseRes.data || []);
    } catch (err) {
      console.error('Error fetching joining list:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = enrollments.filter(enr => {
    const student = enr.students;
    const matchesSearch = 
      student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.phone?.includes(searchTerm);
      
    if (courseFilter !== 'all') {
      return matchesSearch && enr.course_id === courseFilter;
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            Joining List (Active Rosters)
          </h1>
          <p className="text-gray-500 text-sm mt-1">View and manage currently active students by course.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium text-sm">
          <Download size={16} />
          Export CSV
        </button>
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
            placeholder="Search by student name, ID, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-transparent focus:outline-none focus:ring-blue-500 min-w-[200px]"
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
        >
          <option value="all">All Courses</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.course_name}</option>
          ))}
        </select>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-100 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Enrolled
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joining Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading roster...</td>
              </tr>
            ) : filteredList.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No active enrollments found for these filters.</td>
               </tr>
             ) : (
              filteredList.map((enr) => (
                <tr key={enr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/students/${enr.students?.id}`} className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400">
                      {enr.students?.full_name}
                    </Link>
                    <div className="text-xs text-gray-500">{enr.students?.student_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{enr.students?.phone}</div>
                    <div className="text-xs text-gray-500">{enr.students?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{enr.courses?.course_name}</div>
                    <div className="text-xs text-gray-500 font-mono">{enr.enrollment_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {format(new Date(enr.created_at), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
