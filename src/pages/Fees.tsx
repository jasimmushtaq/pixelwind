import { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Fees() {
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInstallments();
  }, []);

  const fetchInstallments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('installments')
        .select(`
          *,
          enrollments (
            enrollment_no,
            courses (course_name),
            students (id, full_name, student_id)
          )
        `)
        .order('due_date', { ascending: true });
        
      if (error) throw error;
      setInstallments(data || []);
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstallments = installments.filter(inst => {
    const student = inst.enrollments?.students;
    const matchesSearch = 
      student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'pending') return matchesSearch && inst.status !== 'paid';
    if (statusFilter === 'paid') return matchesSearch && inst.status === 'paid';
    return matchesSearch;
  });

  const totalCollected = installments.reduce((sum, inst) => sum + Number(inst.amount_paid || 0), 0);
  const totalPending = installments.reduce((sum, inst) => {
    return inst.status !== 'paid' ? sum + (Number(inst.amount_due) - Number(inst.amount_paid)) : sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees & Invoices</h1>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Pending Due</p>
            <p className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="text-orange-600" size={24} />
          </div>
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
            placeholder="Search by student name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-transparent focus:outline-none focus:ring-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Installments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-100 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrollment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading records...</td>
              </tr>
            ) : filteredInstallments.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No installments found.</td>
               </tr>
             ) : (
              filteredInstallments.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/students/${inst.enrollments?.students?.id}`} className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                      {inst.enrollments?.students?.full_name}
                    </Link>
                    <div className="text-xs text-gray-500">{inst.enrollments?.students?.student_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{inst.enrollments?.courses?.course_name}</div>
                    <div className="text-xs text-gray-500">Inst #{inst.installment_no} ({inst.enrollments?.enrollment_no})</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${new Date(inst.due_date) < new Date() && inst.status !== 'paid' ? 'text-red-600 font-medium' : 'text-gray-900 dark:text-gray-300'}`}>
                      {format(new Date(inst.due_date), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">₹{Number(inst.amount_due).toLocaleString()}</div>
                    {inst.amount_paid > 0 && <div className="text-xs text-green-600">Paid: ₹{Number(inst.amount_paid).toLocaleString()}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inst.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {inst.status === 'paid' ? 'PAID' : 'PENDING'}
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
