import React, { useState, useRef, useEffect } from 'react';
import { Download, FileDown, Layers, Database } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

const CertificateContent: React.FC<{ formData: any, showQR: boolean }> = ({ formData, showQR }) => {
  const formattedStart = format(new Date(formData.start_date || new Date()), 'dd-MM-yyyy');
  const formattedEnd = format(new Date(formData.end_date || new Date()), 'dd-MM-yyyy');

  return (
    <div 
      className="relative bg-white shadow-2xl overflow-hidden font-serif"
      style={{ 
        width: 1056, 
        height: 816,
        backgroundImage: "url('/certificate-bg.jpg')",
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        color: '#002B49' 
      }}
    >
      <div className="absolute top-[110px] left-0 right-0 text-center text-lg font-bold">
        ID: {formData.certificate_id}
      </div>
      <div className="absolute top-[325px] left-0 right-0 text-center text-[38px] font-bold uppercase tracking-wide">
        {formData.name}
      </div>
      <div className="absolute top-[385px] left-0 right-0 text-center text-[19px]">
        S/o. <span className="font-medium">{formData.father_name}</span>,
      </div>
      <div className="absolute top-[420px] left-[150px] right-[150px] text-center text-[19px] italic leading-relaxed">
        Successfully Completed his Internship on "<span className="font-bold not-italic">{formData.course}</span>" from
      </div>
      <div className="absolute top-[450px] left-[150px] right-[150px] text-center text-[19px] italic leading-relaxed">
        "<span className="text-red-600 font-bold not-italic">{formattedStart} to {formattedEnd}</span>" in {formData.organization}.
      </div>
      <div className="absolute top-[480px] left-[150px] right-[150px] text-center text-[19px] italic leading-relaxed">
        ({formData.branch}) & his Performance Grade "<span className="font-bold not-italic">{formData.grade}</span>".
      </div>
      <div className="absolute bottom-[160px] left-0 right-0 text-center text-[10px] font-bold text-red-600 tracking-wider">
        {formData.internship_no}
      </div>
      {showQR && (
        <div className="absolute top-[230px] right-[80px] w-[110px] h-[110px]">
          <QRCodeSVG 
            value={`https://pixelwindcertify.vercel.app/verify/${formData.certificate_id}`} 
            width="100%" 
            height="100%" 
            fgColor="#000000" 
            bgColor="#ffffff" 
          />
        </div>
      )}
    </div>
  );
};

const CertificateGenerator: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  
  const [formData, setFormData] = useState({
    certificate_id: 'CERT-2026-9999',
    name: 'JOHN DOE',
    father_name: 'Richard Doe',
    course: 'WEB DEVELOPMENT',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    organization: 'Pixelwind Technologies',
    branch: 'Vizag Branch',
    grade: 'A+',
    internship_no: 'INTERNSHIP_123456789',
    internship_id: 'd99d640d-899a-41f5-b535-369a9e0f52e0',
  });
  
  const [showQR, setShowQR] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, 
          start_date, 
          end_date, 
          students (full_name, father_name), 
          courses (course_name),
          certificates (id, certificate_no, template_version)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setEnrollments(data || []);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedEnrollmentId(val);
    
    if (!val) return;
    
    const enrollment = enrollments.find(env => env.id === val);
    if (!enrollment) return;

    // Check if they already have a certificate
    const existingCert = enrollment.certificates && enrollment.certificates.length > 0 ? enrollment.certificates[0] : null;

    let meta: Record<string, any> = {};
    if (existingCert && existingCert.template_version) {
      try {
        meta = JSON.parse(existingCert.template_version);
      } catch(e) {}
    }

    setFormData({
      certificate_id: existingCert ? existingCert.certificate_no : `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      name: enrollment.students?.full_name || '',
      father_name: enrollment.students?.father_name || '',
      course: enrollment.courses?.course_name || '',
      start_date: enrollment.start_date || format(new Date(), 'yyyy-MM-dd'),
      end_date: enrollment.end_date || format(new Date(), 'yyyy-MM-dd'),
      organization: meta.organization || 'Pixelwind Technologies',
      branch: meta.branch || 'Vizag Branch',
      grade: meta.grade || 'A+',
      internship_no: meta.internship_no || `INTERNSHIP_${Math.floor(Math.random() * 1000000000)}`,
      internship_id: existingCert ? existingCert.id : '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSaveAndDownloadPNG = async () => {
    if (!selectedEnrollmentId) {
      alert("Please select a student from the dropdown first so the QR code can be linked correctly to the database!");
      return;
    }
    await saveCertificateAndExport('png');
  };

  const handleSaveAndDownloadPDF = async () => {
    if (!selectedEnrollmentId) {
      alert("Please select a student from the dropdown first so the QR code can be linked correctly to the database!");
      return;
    }
    await saveCertificateAndExport('pdf');
  };

  const saveCertificateAndExport = async (formatType: 'png' | 'pdf') => {
    if (!printRef.current) return;
    
    try {


      let certUUID = formData.internship_id;
      const metadataStr = JSON.stringify({
        grade: formData.grade,
        branch: formData.branch,
        organization: formData.organization,
        start_date: formData.start_date,
        end_date: formData.end_date,
        internship_no: formData.internship_no
      });

      // Always upsert to ensure metadata (grade, branch) is updated if they change it
      const { data, error } = await supabase
        .from('certificates')
        .upsert({
          enrollment_id: selectedEnrollmentId,
          certificate_no: formData.certificate_id,
          issue_date: format(new Date(), 'yyyy-MM-dd'),
          template_version: metadataStr
        }, { onConflict: 'enrollment_id' })
        .select('id')
        .single();
        
      if (error) {
         if (error.code === '23505') {
            alert("A certificate with this ID already exists. Try changing the Certificate ID.");
         } else {
            alert("Error saving certificate to database: " + error.message);
         }
         console.error(error);
         return;
      }
      
      certUUID = data.id;
      
      // Update local state so QR code renders the real UUID
      if (formData.internship_id !== certUUID) {
        setFormData(prev => ({ ...prev, internship_id: certUUID }));
        // Re-fetch enrollments so next time we select this person, we know they have a cert
        fetchEnrollments();
        // Wait for React to re-render the QR code with the new UUID before capturing
        await new Promise(resolve => setTimeout(resolve, 800)); 
      }
      
      // Export canvas
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      if (formatType === 'png') {
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${formData.name}_Certificate.png`;
        link.click();
      } else {
        const pdf = new jsPDF('landscape', 'px', [1056, 816]);
        pdf.addImage(imgData, 'PNG', 0, 0, 1056, 816);
        pdf.save(`${formData.name}_Certificate.pdf`);
      }
      
    } catch (err) {
      console.error('Error generating export', err);
      alert('Failed to generate export.');
    }
  };

  const scale = 0.6; // Scale down for preview

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 font-sans">
      {/* Left: Input Form */}
      <div className="w-[450px] bg-white rounded-xl shadow-lg border p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Generate Certificate</h2>
        </div>
        
        <div className="space-y-4">
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Database size={16} /> Select Student (Database)
            </label>
            <select 
              value={selectedEnrollmentId} 
              onChange={handleEnrollmentSelect} 
              className="w-full border rounded-lg p-2 bg-white"
            >
              <option value="">-- Choose an Enrolled Student --</option>
              {enrollments.map((env) => (
                <option key={env.id} value={env.id}>
                  {env.students?.full_name} ({env.courses?.course_name})
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-700 mt-2">
              Selecting a student will automatically save the certificate to the database and link it to the QR code.
            </p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
            <span className="text-sm font-medium text-gray-700">Include QR Code</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID</label>
            <input type="text" name="certificate_id" value={formData.certificate_id} onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internship ID</label>
            <input type="text" name="internship_no" value={formData.internship_no} onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-2 uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
            <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course / Internship</label>
            <input type="text" name="course" value={formData.course} onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full border rounded-lg p-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select name="grade" value={formData.grade} onChange={handleChange} className="w-full border rounded-lg p-2">
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="w-full border rounded-lg p-2" />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={handleSaveAndDownloadPNG} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
            <Download size={18} /> Save & Download PNG
          </button>
          <button onClick={handleSaveAndDownloadPDF} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition-colors">
            <FileDown size={18} /> Save & Download PDF
          </button>
        </div>
      </div>

      {/* Right: Preview (Scaled) */}
      <div className="flex-1 bg-gray-200 border rounded-xl overflow-hidden flex items-center justify-center relative p-8">
        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
          Live Preview
        </div>
        
        {/* On-screen Scaled Preview */}
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <CertificateContent formData={formData} showQR={showQR} />
        </div>
      </div>

      {/* Off-screen Unscaled version for html2canvas to fix squished text bug */}
      <div className="absolute" style={{ left: '-9999px', top: '-9999px' }}>
        <div ref={printRef}>
          <CertificateContent formData={formData} showQR={showQR} />
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
