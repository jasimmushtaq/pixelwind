import { format } from 'date-fns';
import { X, Printer } from 'lucide-react';
import { useEffect } from 'react';

type InvoiceModalProps = {
  installment: any;
  installments?: any[];
  enrollment: any;
  onClose: () => void;
};

export default function InvoiceModal({ installment, installments, enrollment, onClose }: InvoiceModalProps) {
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

  // Parse Payment Mode and Reference
  let paymentMethod = installment.payment_mode || 'Cash';
  let paymentRef = '';
  if (paymentMethod.includes('(Txn:')) {
    const match = paymentMethod.match(/\(Txn:\s*(.*?)\)/);
    if (match) {
      paymentRef = match[1];
      paymentMethod = paymentMethod.replace(/\s*\(Txn:.*?\)/, '').trim();
    }
  }

  // Financial Calculations
  const totalCourseFee = Number(enrollment.final_payable || enrollment.total_fee || 0);
  const amountPaidThisInvoice = Number(installment.amount_paid || 0);
  
  // Calculate total paid across all successful installments
  const totalPaid = installments && installments.length > 0
    ? installments.reduce((acc, curr) => acc + Number(curr.amount_paid || 0), 0)
    : amountPaidThisInvoice; // Fallback if installments array is missing

  const balanceDue = totalCourseFee - totalPaid;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full relative">
        
        {/* Modal Actions (Hidden in Print) */}
        <div className="sticky top-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-20 print:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Invoice Preview</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium text-sm"
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
          <style>{`
            @media print {
              @page { size: portrait; margin: 0.5cm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          `}</style>

          {/* Top Accent Bar */}
          <div className="h-2 print:h-1.5 w-full bg-gradient-to-r from-blue-600 to-cyan-500"></div>

          <div className="p-6 sm:p-10 print:p-0 relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start border-b-2 border-gray-100 pb-6 mb-6 print:pb-4 print:mb-4">
              <div className="mb-4 sm:mb-0 print:mb-0">
                <img src="/pixelwind-logo.png" alt="" className="w-56 h-auto object-contain mb-3 print:mb-2 transform origin-left scale-110" />
                <div className="text-xs text-gray-600 space-y-1 font-medium mt-3">
                  <p>4th floor, Potluri Classic, beside Sun International,</p>
                  <p>Dwaraka Nagar, Visakhapatnam - 530016</p>
                  <p className="text-blue-600 pt-1">pwtvizag@gmail.com | +91 93989 29970</p>
                </div>
              </div>
              <div className="text-left sm:text-right print:text-right">
                <h2 className="text-4xl print:text-3xl font-black text-gray-200 tracking-tight uppercase mb-1">Invoice</h2>
                <div className="inline-block bg-blue-50 px-3 py-1.5 rounded mt-1 relative">
                  <p className="text-blue-800 font-bold text-base">#{invoiceNumber}</p>
                  {installment.status === 'paid' && (
                    <span className="absolute -top-3 -right-3 transform rotate-12 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-sm border border-white">
                      PAID
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Date of Issue</p>
                <p className="text-gray-800 text-sm font-bold">{format(new Date(installment.paid_date || new Date()), 'dd MMM yyyy')}</p>
              </div>
            </div>

            {/* Billing Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 mb-6 print:gap-4 print:mb-4">
              <div className="bg-gray-50/50 p-4 print:p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Billed To</p>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{enrollment.students?.full_name || 'Student Name'}</h3>
                <div className="space-y-1 text-xs text-gray-600 font-medium">
                  <p>ID: <span className="text-gray-900">{enrollment.students?.student_id || 'N/A'}</span></p>
                  {enrollment.students?.phone && <p>Phone: <span className="text-gray-900">{enrollment.students.phone}</span></p>}
                  {enrollment.students?.email && <p>Email: <span className="text-gray-900">{enrollment.students.email}</span></p>}
                  {enrollment.students?.city && (
                    <p>{enrollment.students.city}, {enrollment.students.state} {enrollment.students.pincode ? `- ${enrollment.students.pincode}` : ''}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50/50 p-4 print:p-3 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Payment Information</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase font-semibold">Payment Method</p>
                    <p className="font-bold text-gray-900 text-sm">{paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase font-semibold">Transaction Status</p>
                    <p className={`font-bold text-sm uppercase tracking-wide ${installment.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                      {installment.status === 'paid' ? 'PAID' : 'PENDING'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase font-semibold">Payment Date</p>
                    <p className="font-bold text-gray-900 text-sm">{installment.paid_date ? format(new Date(installment.paid_date), 'dd MMM yyyy') : '-'}</p>
                  </div>
                  {paymentRef && (
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase font-semibold">Reference No.</p>
                      <p className="font-bold text-gray-900 text-sm break-all">{paymentRef}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Installment Schedule (Compact) */}
            {installments && installments.length > 0 && (
              <div className="mb-6 print:mb-4">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Installment Schedule</h4>
                <div className="flex flex-col gap-1">
                  {installments.map(inst => {
                    const isPaid = inst.status === 'paid';
                    return (
                      <div key={inst.id} className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded text-xs print:text-[11px] border border-gray-100">
                        <span className="font-medium text-gray-700 w-24">Installment #{inst.installment_no}</span>
                        <span className="text-gray-900 font-bold w-20">₹ {Number(inst.amount_due).toLocaleString()}</span>
                        <span className="text-gray-500 flex-1 text-center">Due: {format(new Date(inst.due_date), 'dd MMM yyyy')}</span>
                        <span className={`font-bold w-16 text-right ${isPaid ? 'text-green-600' : inst.status === 'partial' ? 'text-orange-500' : 'text-gray-400'}`}>
                          {isPaid ? 'PAID' : inst.status === 'partial' ? 'PARTIAL' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Invoice Table */}
            <div className="mb-8 print:mb-4 rounded-lg overflow-hidden border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4 print:py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-2.5 px-4 print:py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Installment</th>
                    <th className="py-2.5 px-4 print:py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white">
                    <td className="py-3 px-4 print:py-2">
                      <p className="font-bold text-gray-900 text-sm">{enrollment.courses?.course_name || 'Course Fee'}</p>
                    </td>
                    <td className="py-3 px-4 print:py-2 text-center text-gray-600 text-sm font-bold">
                      #{installment.installment_no}
                    </td>
                    <td className="py-3 px-4 print:py-2 text-right font-bold text-gray-900 text-sm">
                      ₹ {amountPaidThisInvoice.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary section */}
            <div className="flex flex-col md:flex-row print:flex-row justify-between items-end mb-10 print:mb-6 gap-6 print:gap-4">
              <div className="w-full md:w-1/2 print:w-1/2">
                {/* Genuine stamp / signature area */}
                <div className="mt-4 border-t border-gray-200 pt-4 max-w-[180px]">
                  <p className="text-xs text-gray-800 font-bold mb-8 print:mb-6">PixelWind Technologies</p>
                  <div className="border-b border-gray-400 mb-1.5"></div>
                  <p className="text-[10px] text-gray-500 font-medium text-center uppercase tracking-wider">Authorized Signatory</p>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 print:w-1/2 bg-gray-50 rounded-lg p-5 print:p-4 border border-gray-100">
                <div className="space-y-2.5 print:space-y-2">
                  <div className="flex justify-between items-center text-sm print:text-xs">
                    <span className="text-gray-600 font-medium">Total Course Fee</span>
                    <span className="font-bold text-gray-900">₹ {totalCourseFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm print:text-xs">
                    <span className="text-gray-600 font-medium">Amount Paid (This Invoice)</span>
                    <span className="font-bold text-gray-900">₹ {amountPaidThisInvoice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm print:text-xs">
                    <span className="text-gray-600 font-medium">Total Paid</span>
                    <span className="font-bold text-gray-900">₹ {totalPaid.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center bg-white p-2.5 rounded shadow-sm">
                    <span className="font-black text-gray-900 text-sm uppercase">Balance Due</span>
                    <span className={`font-black text-base ${balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      ₹ {balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 print:pt-3 flex justify-center text-center">
              <div>
                <p className="text-gray-800 font-bold text-sm mb-0.5">Thank you for your payment!</p>
                <p className="text-gray-400 text-[10px] font-medium">This is a computer generated invoice and does not require a physical signature.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
