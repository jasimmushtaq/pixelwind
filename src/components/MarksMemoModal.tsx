import { format } from 'date-fns';
import { X, Printer, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';

type MarksMemoModalProps = {
  memo: any;
  onClose: () => void;
};

export default function MarksMemoModal({ memo, onClose }: MarksMemoModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const student = memo.enrollments?.students || memo.students;
  const courseName = memo.enrollments?.courses?.course_name || 'App Development';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full relative flex flex-col items-center">
        
        {/* Modal Actions */}
        <div className="sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-20 print:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Marks Memo Preview</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium text-sm"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- MARKS MEMO CONTENT --- */}
        <div className="relative bg-white text-gray-900 w-full aspect-[1/1.414] max-w-[794px] border border-gray-200 m-4 print:m-0 flex flex-col p-12 overflow-hidden shadow-sm">
          
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          {/* Header */}
          <div className="flex flex-col items-center border-b-2 border-indigo-100 pb-8 mb-8 mt-4">
            <img src="/pixelwind-logo.png" alt="PixelWind Logo" className="h-20 object-contain mb-4" />
            <h1 className="text-3xl font-black text-indigo-900 uppercase tracking-widest mb-1">Memorandum of Marks</h1>
            <p className="text-gray-500 font-medium">PixelWind Technologies Certification Board</p>
          </div>

          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Student Name</p>
              <h2 className="text-xl font-bold text-gray-800 capitalize">{student?.full_name || 'Student Name'}</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {student?.student_id || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Memo No.</p>
              <p className="font-mono text-gray-800 font-bold">{memo.memo_no}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 mb-1">Date</p>
              <p className="text-sm text-gray-800 font-medium">{format(new Date(memo.issue_date || new Date()), 'dd MMM yyyy')}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Course Completed</p>
            <h3 className="text-lg font-bold text-indigo-900 bg-indigo-50 inline-block px-4 py-2 rounded-lg border border-indigo-100">
              {courseName}
            </h3>
          </div>

          {/* Marks Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Max Marks</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Marks Secured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-white">
                  <td className="py-6 px-6 font-medium text-gray-900">{courseName} - Final Assessment</td>
                  <td className="py-6 px-6 text-center text-gray-700 font-medium">{memo.total_max_marks}</td>
                  <td className="py-6 px-6 text-center font-bold text-indigo-700 text-lg">{memo.total_obtained_marks}</td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="py-4 px-6 font-bold text-gray-900 text-right uppercase text-xs tracking-wider">Total</td>
                  <td className="py-4 px-6 text-center font-bold text-gray-900">{memo.total_max_marks}</td>
                  <td className="py-4 px-6 text-center font-black text-indigo-700 text-xl">{memo.total_obtained_marks}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Percentage</p>
              <p className="text-3xl font-black text-gray-800">{Number(memo.percentage).toFixed(2)}%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Grade</p>
              <p className="text-3xl font-black text-gray-800">{memo.grade}</p>
            </div>
            <div className={`rounded-xl p-6 text-center border ${memo.result === 'PASS' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${memo.result === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>Result</p>
              <p className={`text-3xl font-black ${memo.result === 'PASS' ? 'text-green-700' : 'text-red-700'}`}>{memo.result}</p>
            </div>
          </div>

          <div className="mt-auto pt-8 flex justify-between items-end border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-400">
              <GraduationCap size={24} />
              <span className="text-xs font-bold uppercase tracking-widest">Official Record</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-2 mb-2 pt-8 w-48 mx-auto">Authorized Signatory</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">PixelWind Tech</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
