import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { generateCloudinarySignature } from '@/lib/cloudinary';

const studentSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email().optional().or(z.literal('')),
  address_line1: z.string().min(5, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  father_name: z.string().min(2, "Father name is required"),
  mother_name: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_relation: z.string().optional(),
  guardian_phone: z.string().optional(),
  aadhaar_number: z.string().length(12, "Aadhaar must be 12 digits"),
  highest_qualification: z.string().min(2, "Qualification is required"),
  institution_name: z.string().min(2, "Institution is required"),
  passing_year: z.string().min(4, "Valid year required"),
  percentage_or_cgpa: z.string().min(1, "Required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function NewStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const enquiry = location.state?.enquiry;
  
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: enquiry?.full_name || '',
      phone: enquiry?.phone || '',
      email: enquiry?.email || '',
    }
  });

  const handleNextStep = async (fieldsToValidate: (keyof StudentFormValues)[]) => {
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const uploadToCloudinary = async (file: File, folder: string) => {
    try {
      const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
      const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

      if (!apiSecret || !apiKey || !cloudName) {
        throw new Error("Missing Cloudinary configuration in .env.local");
      }

      // 1. Generate Signature Locally
      const { signature, timestamp } = await generateCloudinarySignature(folder, apiSecret);

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Upload failed");

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      throw new Error("Failed to upload photo: " + err.message);
    }
  };

  const onSubmit = async (data: StudentFormValues) => {
    try {
      setIsSubmitting(true);
      setError('');

      let photoData = null;
      if (photoFile) {
        photoData = await uploadToCloudinary(photoFile, 'pixelwind/students/photos');
      }

      // Insert Student
      const { data: student, error: dbError } = await supabase.from('students').insert({
        ...data,
        passing_year: parseInt(data.passing_year),
        photo_url: photoData?.secure_url,
        photo_public_id: photoData?.public_id,
        created_by: profile?.id,
        converted_from_enquiry_id: enquiry?.id || null
      }).select().single();

      if (dbError) throw dbError;

      // If converted from an enquiry, mark enquiry as converted
      if (enquiry?.id) {
        await supabase.from('enquiries').update({ status: 'converted' }).eq('id', enquiry.id);
      }

      // Log activity
      await supabase.from('activity_log').insert({
        admin_id: profile?.id,
        action: 'CREATED_STUDENT',
        entity_type: 'students',
        entity_id: student.id,
        details: { student_id: student.student_id, full_name: student.full_name }
      });

      navigate('/students');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Student Registration</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Fill in the details to enroll a new student into the LMS.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
          <div className="flex justify-between items-center">
            <span className={`font-semibold ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>1. Personal</span>
            <span className={`font-semibold ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>2. Guardian</span>
            <span className={`font-semibold ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>3. Identity & Qualification</span>
            <span className={`font-semibold ${step >= 4 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>4. Photo</span>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</label>
                    <input type="text" {...register('full_name')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth *</label>
                    <input type="date" {...register('dob')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</label>
                    <select {...register('gender')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
                    <input type="text" {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" {...register('email')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1 *</label>
                    <input type="text" {...register('address_line1')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.address_line1 && <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</label>
                    <input type="text" {...register('address_line2')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City *</label>
                    <input type="text" {...register('city')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State *</label>
                    <input type="text" {...register('state')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode *</label>
                    <input type="text" {...register('pincode')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>}
                  </div>
                </div>
                
                <div className="flex justify-end pt-6">
                  <button type="button" onClick={() => handleNextStep(['full_name', 'dob', 'gender', 'phone', 'address_line1', 'city', 'state', 'pincode'])} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next Step</button>
                </div>
              </div>
            )}

            {/* Step 2: Guardian Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father's Name *</label>
                    <input type="text" {...register('father_name')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.father_name && <p className="mt-1 text-sm text-red-600">{errors.father_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mother's Name</label>
                    <input type="text" {...register('mother_name')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                  </div>
                  <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Local Guardian (Optional)</h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guardian Name</label>
                    <input type="text" {...register('guardian_name')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Relation</label>
                    <input type="text" {...register('guardian_relation')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guardian Phone</label>
                    <input type="text" {...register('guardian_phone')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button type="button" onClick={() => setStep(1)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Back</button>
                  <button type="button" onClick={() => handleNextStep(['father_name'])} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next Step</button>
                </div>
              </div>
            )}

            {/* Step 3: Identity & Qualification */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Aadhaar Number * (12 Digits)</label>
                    <input type="text" {...register('aadhaar_number')} maxLength={12} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.aadhaar_number && <p className="mt-1 text-sm text-red-600">{errors.aadhaar_number.message}</p>}
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Highest Qualification</h4>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qualification Degree/Standard *</label>
                    <input type="text" {...register('highest_qualification')} placeholder="e.g. B.Tech, 12th" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.highest_qualification && <p className="mt-1 text-sm text-red-600">{errors.highest_qualification.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Institution Name *</label>
                    <input type="text" {...register('institution_name')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.institution_name && <p className="mt-1 text-sm text-red-600">{errors.institution_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passing Year *</label>
                    <input type="number" {...register('passing_year')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.passing_year && <p className="mt-1 text-sm text-red-600">{errors.passing_year.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Percentage / CGPA *</label>
                    <input type="text" {...register('percentage_or_cgpa')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm px-3 py-2 border" />
                    {errors.percentage_or_cgpa && <p className="mt-1 text-sm text-red-600">{errors.percentage_or_cgpa.message}</p>}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Back</button>
                  <button type="button" onClick={() => handleNextStep(['aadhaar_number', 'highest_qualification', 'institution_name', 'passing_year', 'percentage_or_cgpa'])} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next Step</button>
                </div>
              </div>
            )}

            {/* Step 4: Photo & Submission */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                      {photoFile ? (
                        <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-sm text-center px-2">No photo selected</span>
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png"
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-200"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      />
                      <p className="mt-2 text-xs text-gray-500">Only JPG or PNG. Max 2MB.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button type="button" onClick={() => setStep(3)} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">Back</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    {isSubmitting ? 'Registering...' : 'Register Student'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
