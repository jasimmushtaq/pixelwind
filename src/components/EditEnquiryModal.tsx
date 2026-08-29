import { useState } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export default function EditEnquiryModal({ enquiry, onClose }: { enquiry: any, onClose: () => void }) {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(enquiry.status);
  const [newNote, setNewNote] = useState('');

  const notes = enquiry.notes || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      let updatedNotes = [...notes];
      if (newNote.trim()) {
        updatedNotes.push({
          id: Math.random().toString(36).substr(2, 9),
          text: newNote.trim(),
          author_id: profile?.id,
          author_name: profile?.full_name || 'Admin',
          created_at: new Date().toISOString()
        });
      }

      const { error } = await supabase
        .from('enquiries')
        .update({
          status,
          notes: updatedNotes
        })
        .eq('id', enquiry.id);
        
      if (error) throw error;
      
      onClose();
    } catch (err: any) {
      console.error('Error updating enquiry:', err);
      alert('Failed to update enquiry: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Enquiry</h2>
            <p className="text-xs text-gray-500">{enquiry.enquiry_no} • {enquiry.full_name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-6 flex-1">
          {/* Status Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="new">New</option>
              <option value="follow_up">Follow Up</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Contact Details (Read Only) */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 text-sm">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Prospect Details</h4>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
              <div><span className="font-medium">Phone:</span> {enquiry.phone}</div>
              <div><span className="font-medium">Email:</span> {enquiry.email || 'N/A'}</div>
              <div><span className="font-medium">Course:</span> {enquiry.interested_course || 'N/A'}</div>
              <div><span className="font-medium">Source:</span> {enquiry.source || 'N/A'}</div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <MessageSquare size={16} /> Follow-up Notes
            </h4>
            
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No notes yet.</p>
              ) : (
                notes.map((note: any) => (
                  <div key={note.id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                    <p className="text-gray-800 dark:text-gray-200 mb-1">{note.text}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {note.author_name} • {format(new Date(note.created_at), 'dd MMM yyyy, p')}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add New Note</label>
              <textarea 
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Enter details of your follow-up call..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-6 sticky bottom-0 bg-white dark:bg-gray-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
