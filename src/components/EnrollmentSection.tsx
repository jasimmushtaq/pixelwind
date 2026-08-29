import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, FileText, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import NewEnrollmentModal from './NewEnrollmentModal';
import InstallmentsManager from './InstallmentsManager';
import CertificateModal from './CertificateModal';
import MarksMemoModal from './MarksMemoModal';
import { format } from 'date-fns';

export default function EnrollmentSection({ studentId }: { studentId: string }) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  
  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState<any>(null);
  const [issueMemo, setIssueMemo] = useState(true);
  const [issueCert, setIssueCert] = useState(true);
  const [markCompleted, setMarkCompleted] = useState(true);
  
  const [compStartDate, setCompStartDate] = useState('');
  const [compEndDate, setCompEndDate] = useState('');
  
  const [viewingCertificate, setViewingCertificate] = useState<any>(null);
  const [viewingMemo, setViewingMemo] = useState<any>(null);

  useEffect(() => {
    fetchEnrollments();
  }, [studentId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (course_name, duration),
          students (id, full_name, student_id, phone, email, city, state),
          certificates (*),
          marks_memos (*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCompleteModal = (enr: any) => {
    const hasMemo = enr.marks_memos && (Array.isArray(enr.marks_memos) ? enr.marks_memos.length > 0 : true);
    const hasCert = enr.certificates && (Array.isArray(enr.certificates) ? enr.certificates.length > 0 : true);
    
    setIssueMemo(!hasMemo);
    setIssueCert(!hasCert);
    setMarkCompleted(enr.status !== 'completed');
    setCompStartDate(enr.start_date || '');
    setCompEndDate(enr.end_date || '');
    setShowCompleteModal(enr);
  };

  const handleCompleteCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const enr = showCompleteModal;

      if (issueMemo) {
        const totalMax = Number((form.elements.namedItem('totalMax') as HTMLInputElement).value);
        const totalObtained = Number((form.elements.namedItem('totalObtained') as HTMLInputElement).value);
        
        const { error: memoErr } = await supabase.from('marks_memos').insert({
          enrollment_id: enr.id,
          memo_no: `MEMO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          total_max_marks: totalMax,
          total_obtained_marks: totalObtained
        });
        if (memoErr) throw memoErr;
      }

      if (issueCert) {
        const { error: certErr } = await supabase.from('certificates').insert({
          enrollment_id: enr.id,
          issue_date: new Date().toISOString().split('T')[0],
          certificate_no: `CERT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        });
        if (certErr) throw certErr;
      }

      await supabase.from('enrollments').update({ 
        status: markCompleted ? 'completed' : enr.status, 
        completed_at: markCompleted ? new Date().toISOString() : enr.completed_at,
        start_date: compStartDate || null,
        end_date: compEndDate || null
      }).eq('id', enr.id);

      setShowCompleteModal(null);
      fetchEnrollments();
    } catch (err: any) {
      alert("Error issuing documents: " + err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading enrollments...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Course Enrollments</h3>
        <button 
          onClick={() => setShowEnrollModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md transition text-sm font-medium"
        >
          <Plus size={16} />
          Enroll
        </button>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="mb-4">No active enrollments found for this student.</p>
          <button onClick={() => setShowEnrollModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Enroll in Course
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enr) => {
            const hasMemo = enr.marks_memos && (Array.isArray(enr.marks_memos) ? enr.marks_memos.length > 0 : true);
            const hasCert = enr.certificates && (Array.isArray(enr.certificates) ? enr.certificates.length > 0 : true);
            const allCompleted = enr.status === 'completed' && hasMemo && hasCert;

            return (
              <div key={enr.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={16} className="text-blue-500" />
                      <h4 className="font-medium text-gray-900 dark:text-white">{enr.courses?.course_name}</h4>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {enr.enrollment_no}
                      </span>
                      {enr.status === 'completed' && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 ml-2">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock size={14} /> {enr.courses?.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} /> Enrolled: {format(new Date(enr.created_at), 'dd MMM yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="md:text-right border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-3 md:pt-0 md:pl-4">
                    <p className="text-xs text-gray-500 uppercase font-medium">Final Fee</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{enr.final_payable.toLocaleString()}</p>
                    <div className="mt-1 flex items-center justify-between md:justify-end gap-2 text-sm">
                      <span className="text-gray-500">Paid: <span className="text-green-600 font-medium">₹{enr.total_paid.toLocaleString()}</span></span>
                      <span className="text-gray-500">Balance: <span className="text-red-500 font-medium">₹{enr.outstanding_balance.toLocaleString()}</span></span>
                    </div>
                  </div>
                </div>
                
                {enr.outstanding_balance === 0 && (
                  <div className="mt-4 flex justify-end items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">

                    {!allCompleted && (
                      <button 
                        onClick={() => openCompleteModal(enr)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition"
                      >
                        <Award size={16} /> Issue Documents
                      </button>
                    )}
                  </div>
                )}

                <InstallmentsManager enrollment={enr} />
              </div>
            );
          })}
        </div>
      )}

      {showEnrollModal && (
        <NewEnrollmentModal studentId={studentId} onClose={() => { setShowEnrollModal(false); fetchEnrollments(); }} />
      )}

      {viewingCertificate && (
        <CertificateModal certificate={viewingCertificate} onClose={() => setViewingCertificate(null)} />
      )}

      {viewingMemo && (
        <MarksMemoModal memo={viewingMemo} onClose={() => setViewingMemo(null)} />
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Issue Documents & Completion</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    value={compStartDate}
                    onChange={e => setCompStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-purple-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    value={compEndDate}
                    onChange={e => setCompEndDate(e.target.value)}
                  />
                </div>
              </div>

              {showCompleteModal.status !== 'completed' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={markCompleted} onChange={(e) => setMarkCompleted(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark Course as Completed</span>
                </label>
              )}
              
              {(!showCompleteModal.marks_memos || (Array.isArray(showCompleteModal.marks_memos) && showCompleteModal.marks_memos.length === 0)) && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={issueMemo} onChange={(e) => setIssueMemo(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue Marks Memo</span>
                </label>
              )}
              
              {(!showCompleteModal.certificates || (Array.isArray(showCompleteModal.certificates) && showCompleteModal.certificates.length === 0)) && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={issueCert} onChange={(e) => setIssueCert(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Issue Certificate</span>
                </label>
              )}
            </div>

            <form onSubmit={handleCompleteCourse}>
              {issueMemo && (
                <div className="space-y-4 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Marks Details</h4>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Total Max Marks</label>
                    <input name="totalMax" type="number" required defaultValue={100} className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Total Marks Obtained</label>
                    <input name="totalObtained" type="number" required className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCompleteModal(null)} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancel</button>
                <button type="submit" disabled={!markCompleted && !issueMemo && !issueCert} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Confirm Selection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
