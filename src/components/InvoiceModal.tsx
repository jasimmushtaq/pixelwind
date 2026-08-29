import { format } from 'date-fns';
import { X, Printer } from 'lucide-react';
import { useEffect } from 'react';

type InvoiceModalProps = {
  installment: any;
  enrollment: any;
  onClose: () => void;
};

export default function InvoiceModal({ installment, enrollment, onClose }: InvoiceModalProps) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${new Date(installment.paid_date || new Date()).getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full relative">
        
        {/* Modal Actions (Hidden in Print) */}
        <div className="sticky top-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-20 print:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Invoice Preview</h2>
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

        {/* --- INVOICE CONTENT --- */}
        <div className="relative bg-white text-gray-900 overflow-hidden" id="invoice-content">
          
          {/* Top Accent Bar */}
          <div className="h-3 w-full bg-gradient-to-r from-blue-600 to-cyan-500"></div>

          {/* Watermark */}
          {installment.status === 'paid' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0 transform -rotate-12 scale-150">
              <span className="text-9xl font-black tracking-tighter uppercase">PAID</span>
            </div>
          )}

          <div className="p-10 sm:p-14 print:p-10 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-100 pb-10 mb-10">
              <div className="mb-6 sm:mb-0">
                <img src="/pixelwind-logo.png" alt="" className="h-20 object-contain mb-5" />
                <div className="text-sm text-gray-600 space-y-1.5 font-medium">
                  <p>4th floor, Potluri Classic, beside Sun International,</p>
                  <p>Dwaraka Nagar, Visakhapatnam - 530016</p>
                  <p className="text-blue-600 pt-1">pwtvizag@gmail.com | +91 93989 29970</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <h2 className="text-5xl font-black text-gray-200 tracking-tight uppercase mb-2">Invoice</h2>
                <div className="inline-block bg-blue-50 px-4 py-2 rounded-lg mt-2">
                  <p className="text-blue-800 font-bold text-lg">#{invoiceNumber}</p>
                </div>
                <p className="text-gray-500 text-sm font-medium mt-3 uppercase tracking-widest">Date of Issue</p>
                <p className="text-gray-800 font-bold">{format(new Date(installment.paid_date || new Date()), 'dd MMM yyyy')}</p>
              </div>
            </div>

            {/* Billing Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Billed To</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{enrollment.students?.full_name || 'Student Name'}</h3>
                <div className="space-y-1.5 text-sm text-gray-600 font-medium">
                  <p>ID: <span className="text-gray-900">{enrollment.students?.student_id || 'N/A'}</span></p>
                  {enrollment.students?.phone && <p>Phone: <span className="text-gray-900">{enrollment.students.phone}</span></p>}
                  {enrollment.students?.email && <p>Email: <span className="text-gray-900">{enrollment.students.email}</span></p>}
                  {enrollment.students?.city && <p>{enrollment.students.city}, {enrollment.students.state}</p>}
                </div>
              </div>
              
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Payment Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Payment Method</p>
                    <p className="font-bold text-gray-900 text-lg">{installment.payment_mode || 'Cash'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Transaction Status</p>
                    <p className="font-bold text-green-600 text-lg uppercase tracking-wide">PAID</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="mb-10 rounded-xl overflow-hidden border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="py-6 px-6">
                      <p className="font-bold text-gray-900 text-lg mb-1">{enrollment.courses?.course_name || 'Course Fee'}</p>
                      <p className="text-sm text-gray-500 font-medium">Fee Installment #{installment.installment_no}</p>
                    </td>
                    <td className="py-6 px-6 text-right font-bold text-gray-900 text-xl">
                      ₹ {Number(installment.amount_paid).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
              <div className="w-full md:w-1/2">
                {/* Genuine stamp / signature area */}
                <div className="mt-8 border-t border-gray-200 pt-6 max-w-[200px]">
                  <p className="text-sm text-gray-800 font-bold mb-10">PixelWind Technologies</p>
                  <div className="border-b border-gray-400 mb-2"></div>
                  <p className="text-xs text-gray-500 font-medium text-center uppercase tracking-wider">Authorized Signatory</p>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-50 to-white shadow-sm rounded-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Total Course Fee</span>
                    <span className="font-bold text-gray-900">₹ {Number(enrollment.final_payable || enrollment.total_fee || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Previous Balance</span>
                    <span className="font-bold text-gray-900">
                      ₹ {(Number(enrollment.outstanding_balance) + Number(installment.amount_paid)).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 my-4 pt-6 flex justify-between items-center">
                    <span className="font-black text-gray-900 text-xl">Amount Paid</span>
                    <span className="font-black text-blue-600 text-3xl">₹ {Number(installment.amount_paid).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-100/50 p-4 rounded-xl mt-4">
                    <span className="text-gray-600 font-bold uppercase tracking-wider text-xs">Remaining Balance</span>
                    <span className="font-bold text-red-500 text-lg">₹ {Number(enrollment.outstanding_balance).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-100 pt-8 flex justify-center text-center">
              <div>
                <p className="text-gray-800 font-bold text-lg mb-1">Thank you for your payment!</p>
                <p className="text-gray-500 text-sm font-medium">This is a computer generated invoice and does not require a physical signature.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
