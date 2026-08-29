import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Check, XCircle } from 'lucide-react';

export default function VerifyCertificate() {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState<any>({});

  useEffect(() => {
    async function fetchCertificate() {
      try {
        if (!id) throw new Error("No ID provided");
        
        let foundCert = null;

        // 1. Try searching by certificate_no (the public readable ID)
        const { data: certByNo } = await supabase
          .from('certificates')
          .select(`
            *,
            enrollments (
              start_date,
              end_date,
              students (full_name, student_id, father_name),
              courses (course_name)
            )
          `)
          .eq('certificate_no', id)
          .single();

        if (certByNo) {
          foundCert = certByNo;
        } else {
          // 2. If not found, and ID is a valid UUID, fallback to searching by internal UUID for backward compatibility
          const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
          
          if (isUUID) {
            const { data: certById } = await supabase
              .from('certificates')
              .select(`
                *,
                enrollments (
                  start_date,
                  end_date,
                  students (full_name, student_id, father_name),
                  courses (course_name)
                )
              `)
              .eq('id', id)
              .single();
              
            if (certById) foundCert = certById;
          }
        }

        if (!foundCert) {
          setError(true);
        } else {
          setCertificate(foundCert);
          if (foundCert.template_version) {
            try {
              setMeta(JSON.parse(foundCert.template_version));
            } catch (e) {
              console.error("Failed to parse metadata", e);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#002B49] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-[#002B49] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate not found</h1>
          <p className="text-gray-500 text-sm">
            We couldn't find a certificate matching this ID. Please check the certificate ID and try again, or contact Pixelwind Technologies if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const student = certificate.enrollments?.students;
  const course = certificate.enrollments?.courses;
  const startDate = meta.start_date || certificate.enrollments?.start_date;
  const endDate = meta.end_date || certificate.enrollments?.end_date;

  return (
    <div className="min-h-screen bg-[#002B49] py-8 px-4 sm:px-6 flex flex-col items-center font-sans">
      
      {/* Header Logo */}
      <div className="mb-8 bg-white px-6 py-3 rounded-xl shadow-md inline-block">
        <img src="/pixelwind-logo.png" alt="Pixelwind Technologies Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Main Card */}
      <div className="max-w-[480px] w-full bg-[#FCFDF9] rounded-[24px] shadow-2xl overflow-hidden relative">
        
        {/* VALID Sash */}
        <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none">
          <div className="bg-[#2D8C5A] text-white text-[11px] font-bold tracking-[0.2em] uppercase py-1.5 text-center transform rotate-45 translate-x-[34px] translate-y-[22px] shadow-sm w-40">
            VALID
          </div>
        </div>

        <div className="p-8 pb-4 flex flex-col items-center">
          
          {/* Checkmark Icon */}
          <div className="w-20 h-20 rounded-full border border-dashed border-[#2D8C5A] p-1 flex items-center justify-center mb-6">
            <div className="w-full h-full bg-[#EAF5EF] rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-[#2D8C5A]" strokeWidth={3} />
            </div>
          </div>

          {/* Authenticity Pill */}
          <div className="bg-[#EAF5EF] border border-[#BDE0CB] text-[#2D8C5A] px-6 py-1.5 rounded-full text-xs font-bold tracking-widest mb-8">
            THIS CERTIFICATE IS AUTHENTIC
          </div>

          {/* Student Info */}
          <h2 className="text-[28px] font-bold text-[#002B49] mb-3 text-center leading-tight">
            {student?.full_name}
          </h2>
          
          <p className="text-[#64748B] text-[15px] text-center mb-2">
            has successfully completed the Internship program in
          </p>
          
          <h3 className="text-[22px] font-bold text-[#C5A059] text-center mb-2">
            {course?.course_name || 'App Development'}
          </h3>
          
          <p className="text-[#64748B] text-[15px] text-center">
            at <span className="font-bold text-[#002B49]">{meta.organization || 'Pixel Wind Technologies'}</span>
          </p>
        </div>

        {/* Details Table */}
        <div className="px-8 py-6">
          <div className="border-t border-gray-200/60 divide-y divide-gray-200/60">
            
            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">CERTIFICATE ID</span>
              <span className="text-sm font-medium text-[#002B49]">{certificate.certificate_no}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">INTERNSHIP ID</span>
              <span className="text-sm font-medium text-[#002B49]">{student?.student_id || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">FATHER'S NAME</span>
              <span className="text-sm font-medium text-[#002B49]">{student?.father_name || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">JOINED</span>
              <span className="text-sm font-medium text-[#002B49]">
                {startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">RELIEVED</span>
              <span className="text-sm font-medium text-[#002B49]">
                {endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">PERFORMANCE</span>
              <span className="text-sm font-bold text-[#002B49]">{meta.grade || 'A+'}</span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">ISSUE DATE</span>
              <span className="text-sm font-medium text-[#002B49]">
                {format(new Date(certificate.issue_date), 'dd MMM yyyy')}
              </span>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">ISSUED BY</span>
              <span className="text-sm font-medium text-[#002B49]">{meta.organization || 'Pixelwind Technologies'}</span>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9F5] px-8 py-5 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400 leading-relaxed">
            Verified on {format(new Date(), 'dd MMM yyyy, h:mm a')}. This page confirms the authenticity of a certificate issued by {meta.organization || 'Pixelwind Technologies'}. Verified by certificate ID — never by student ID.
          </p>
        </div>
      </div>

    </div>
  );
}
