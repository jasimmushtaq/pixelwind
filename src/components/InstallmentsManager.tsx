import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import InvoiceModal from './InvoiceModal';

export default function InstallmentsManager({ enrollment }: { enrollment: any }) {
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [activePaymentMode, setActivePaymentMode] = useState('UPI');

  useEffect(() => {
    fetchInstallments();
  }, [enrollment.id]);

  const fetchInstallments = async () => {
    const { data } = await supabase
      .from('installments')
      .select('*')
      .eq('enrollment_id', enrollment.id)
      .order('installment_no', { ascending: true });
    setInstallments(data || []);
    setLoading(false);
  };

  const handlePay = async (e: React.FormEvent, instId: string, amountDue: number) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const amountPaid = Number((form.elements.namedItem('amountPaid') as HTMLInputElement).value);
      let paymentMode = (form.elements.namedItem('paymentMode') as HTMLSelectElement).value;
      const transactionNo = (form.elements.namedItem('transactionNo') as HTMLInputElement)?.value;

      if (transactionNo && transactionNo.trim() !== '') {
        paymentMode = `${paymentMode} (Txn: ${transactionNo.trim()})`;
      }

      if (amountPaid > amountDue) return alert("Cannot pay more than the due amount.");

      const { error } = await supabase
        .from('installments')
        .update({
          amount_paid: amountPaid,
          paid_date: new Date().toISOString().split('T')[0],
          payment_mode: paymentMode,
          status: amountPaid >= amountDue ? 'paid' : 'partial'
        })
        .eq('id', instId);

      if (error) throw error;
      setShowPayModal(null);
      fetchInstallments();
    } catch (err: any) {
      alert("Error processing payment: " + err.message);
    }
  };

  const handleAddInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const amountDue = Number((form.elements.namedItem('amountDue') as HTMLInputElement).value);
      const dueDate = (form.elements.namedItem('dueDate') as HTMLInputElement).value;

      const { error } = await supabase
        .from('installments')
        .insert({
          enrollment_id: enrollment.id,
          installment_no: installments.length + 1,
          amount_due: amountDue,
          due_date: dueDate,
        });

      if (error) throw error;
      setShowAddModal(false);
      fetchInstallments();
    } catch (err: any) {
      alert("Error adding installment: " + err.message);
    }
  };

  if (loading) return <div className="text-sm text-gray-500 py-2">Loading schedule...</div>;

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Fee Installment Schedule</h5>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          <Plus size={14} /> Add Installment
        </button>
      </div>

      {installments.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No installments configured yet.</p>
      ) : (
        <div className="space-y-2">
          {installments.map(inst => (
            <div key={inst.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${inst.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  #{inst.installment_no}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{Number(inst.amount_due).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> Due: {format(new Date(inst.due_date), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:ml-auto">
                <div className="text-right">
                  {inst.status === 'paid' ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle size={14} /> Paid
                      </span>
                      <button 
                        onClick={() => setShowPayModal(`receipt-${inst.id}`)}
                        className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-medium"
                      >
                        View Invoice
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Paid: ₹{Number(inst.amount_paid).toLocaleString()}
                    </span>
                  )}
                  {inst.paid_date && <p className="text-[10px] text-gray-400 mt-1">on {format(new Date(inst.paid_date), 'dd MMM yy')}</p>}
                </div>
                
                {inst.status !== 'paid' && (
                  <button 
                    onClick={() => {
                      setShowPayModal(inst.id);
                      setActivePaymentMode('UPI');
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition"
                  >
                    Pay
                  </button>
                )}
              </div>

              {/* Receipt Modal */}
              {showPayModal === `receipt-${inst.id}` && (
                <InvoiceModal 
                  installment={inst} 
                  enrollment={enrollment} 
                  onClose={() => setShowPayModal(null)} 
                />
              )}

              {/* Pay Modal for this specific installment */}
              {showPayModal === inst.id && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Record Payment</h3>
                    <form onSubmit={(e) => handlePay(e, inst.id, inst.amount_due - inst.amount_paid)}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paying Now (₹)</label>
                          <input 
                            name="amountPaid"
                            type="number" 
                            max={inst.amount_due - inst.amount_paid}
                            required
                            defaultValue={inst.amount_due - inst.amount_paid}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Mode</label>
                          <select 
                            name="paymentMode"
                            required
                            value={activePaymentMode}
                            onChange={(e) => setActivePaymentMode(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Credit/Debit Card</option>
                          </select>
                        </div>
                        {activePaymentMode !== 'Cash' && (
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction No. / Ref ID</label>
                            <input 
                              name="transactionNo"
                              type="text"
                              required
                              placeholder="e.g. UTR / Txn ID"
                              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowPayModal(null)} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md">Cancel</button>
                          <button type="submit" className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md">Confirm Payment</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Installment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Installment</h3>
            <form onSubmit={handleAddInstallment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Due (₹)</label>
                  <input 
                    name="amountDue"
                    type="number" 
                    min="1"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Remaining Balance: ₹{enrollment.outstanding_balance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                  <input 
                    name="dueDate"
                    type="date"
                    required
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md">Save</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
