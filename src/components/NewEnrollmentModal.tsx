import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewEnrollmentModal({ studentId, onClose }: { studentId: string, onClose: () => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  const [baseFee, setBaseFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').eq('is_active', true).order('course_name');
    setCourses(data || []);
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCourseId(id);
    const course = courses.find(c => c.id === id);
    if (course) {
      setBaseFee(course.default_fee);
      setDiscount(0); // Reset discount when course changes
    } else {
      setBaseFee(0);
    }
  };

  const finalPayable = Math.max(0, baseFee - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return alert('Please select a course');
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: studentId,
          course_id: selectedCourseId,
          total_fee: baseFee,
          discount_amount: discount,
          final_payable: finalPayable,
          start_date: startDate || null,
          end_date: endDate || null,
          status: 'enrolled'
        });
        
      if (error) throw error;
      onClose();
    } catch (err: any) {
      console.error('Error creating enrollment:', err);
      alert('Failed to enroll student: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enroll in Course</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Course</label>
            <select 
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedCourseId}
              onChange={handleCourseChange}
            >
              <option value="">-- Choose a course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.course_name} (₹{c.default_fee.toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input 
                type="date"
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date (Expected)</label>
              <input 
                type="date"
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Base Fee</span>
              <span className="font-medium text-gray-900 dark:text-white">₹{baseFee.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Discount Amount (₹)</span>
              <input 
                type="number" 
                min="0"
                max={baseFee}
                className="w-1/2 text-right rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                value={discount || ''}
                onChange={e => setDiscount(Number(e.target.value))}
              />
            </div>
            
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Final Payable</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !selectedCourseId}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  <Save size={16} />
                  Confirm Enrollment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
