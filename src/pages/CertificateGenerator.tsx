import React, { useState, useRef, useEffect } from 'react';
import { Download, FileDown, Layers, Database } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

// Custom hook to perfectly scale the preview without pixel stretching
const useContainerScale = (containerRef: React.RefObject<HTMLDivElement | null>, targetWidth: number, targetHeight: number) => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      // Calculate scale to fit with 40px padding
      const padding = 64; 
      const scaleX = (width - padding) / targetWidth;
      const scaleY = (height - padding) / targetHeight;
      setScale(Math.min(scaleX, scaleY));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, targetWidth, targetHeight]);
  return scale;
};

const CertificateContent: React.FC<{ formData: any, showQR: boolean }> = ({ formData, showQR }) => {
  const formattedStart = format(new Date(formData.start_date || new Date()), 'dd-MM-yyyy');
  const formattedEnd = format(new Date(formData.end_date || new Date()), 'dd-MM-yyyy');

  return (
    <>
      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div 
        className="relative bg-white shadow-2xl overflow-hidden font-serif"
        style={{ 
          width: 1056, 
          height: 816,
          color: '#002B49',
          imageRendering: 'auto',
          textRendering: 'optimizeLegibility'
        }}
      >
        {/* Sharp Background template with high-res signature & stamp built-in */}
        <img src="/certificate-bg-sharp.png" alt="Certificate Background" className="absolute inset-0 w-full h-full object-cover z-0" />
        
        {/* Certificate ID — red */}
        <div className="absolute top-[108px] left-0 right-0 text-center text-[17px] font-bold z-10" style={{ color: '#dc2626', fontFamily: 'sans-serif' }}>
          ID: {formData.certificate_id}
        </div>
        
        {/* Student Name */}
        <div className="absolute top-[318px] left-0 right-0 text-center text-[38px] font-bold uppercase tracking-wide z-20" style={{ color: '#0a2342', fontFamily: 'sans-serif' }}>
          {formData.name}
        </div>
        
        {/* S/o line */}
        <div className="absolute top-[392px] left-0 right-0 text-center text-[18px] z-20" style={{ color: '#000', fontFamily: 'serif' }}>
          S/o. <span className="font-semibold">{formData.father_name}</span>,
        </div>
        
        {/* Internship line 1 */}
        <div className="absolute top-[424px] left-[140px] right-[140px] text-center text-[18px] italic z-20" style={{ color: '#000', fontFamily: 'serif' }}>
          Successfully Completed his Internship on "<span className="font-bold not-italic">{formData.course}</span>" from
        </div>
        
        {/* Dates line */}
        <div className="absolute top-[454px] left-[140px] right-[140px] text-center text-[18px] italic z-20" style={{ fontFamily: 'serif' }}>
          "<span className="font-bold not-italic" style={{ color: '#cc0000' }}>{formattedStart} to {formattedEnd}</span>" in {formData.organization}.
        </div>
        
        {/* Branch & Grade line */}
        <div className="absolute top-[484px] left-[140px] right-[140px] text-center text-[18px] italic z-20" style={{ color: '#000', fontFamily: 'serif' }}>
          ({formData.branch}) &amp; his Performance Grade "<span className="font-bold not-italic">{formData.grade}</span>".
        </div>
        
        {/* Bottom internship ID */}
        <div className="absolute bottom-[148px] left-0 right-0 text-center text-[11px] font-bold tracking-wider z-20" style={{ color: '#dc2626', fontFamily: 'sans-serif' }}>
          {formData.internship_no}
        </div>
        
        {/* QR Code */}
        {showQR && (
          <div className="absolute top-[238px] right-[76px] w-[112px] h-[112px] qr-wrapper z-20">
            <QRCodeSVG 
              value={`https://pixelwind.vercel.app/verify/${formData.certificate_id}`} 
              width="100%" 
              height="100%" 
              fgColor="#000000" 
              bgColor="#ffffff" 
              level="M"
            />
          </div>
        )}
      </div>
    </>
  );
};

const CertificateGenerator: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const scale = useContainerScale(previewContainerRef, 1056, 816);
  
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const upsertCertificateToDatabase = async () => {
    if (!selectedEnrollmentId) return null;
    
    let certUUID = formData.internship_id;
    const metadataStr = JSON.stringify({
      grade: formData.grade,
      branch: formData.branch,
      organization: formData.organization,
      start_date: formData.start_date,
      end_date: formData.end_date,
      internship_no: formData.internship_no
    });

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
       return null;
    }
    
    certUUID = data.id;
    if (formData.internship_id !== certUUID) {
      setFormData(prev => ({ ...prev, internship_id: certUUID }));
      fetchEnrollments();
      await new Promise(resolve => setTimeout(resolve, 800)); 
    }
    return certUUID;
  };

  const handleSaveAndDownloadPNG = async () => {
    if (!selectedEnrollmentId) {
      alert("Please select a student from the dropdown first so the QR code can be linked correctly to the database!");
      return;
    }
    if (!(await upsertCertificateToDatabase())) return;
    
    if (!printRef.current) return;
    // For PNG export, html2canvas at high scale is best (raster)
    const canvas = await html2canvas(printRef.current, { scale: 4, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${formData.name}_Certificate.png`;
    link.click();
  };

  const handleSaveAndDownloadPDF = async () => {
    if (!selectedEnrollmentId) {
      alert("Please select a student from the dropdown first so the QR code can be linked correctly to the database!");
      return;
    }
    if (!(await upsertCertificateToDatabase())) return;
    
    try {
      // 1. Initialize native vector jsPDF
      const pdf = new jsPDF('landscape', 'px', [1056, 816]);
      
      // 2. Load and draw high-res background image directly (contains sharp signature and stamp)
      const bgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = '/certificate-bg-sharp.png';
      });
      pdf.addImage(bgImg, 'PNG', 0, 0, 1056, 816);

      // 3. Draw Vector Text Helper
      const drawCenterText = (text: string, y: number, size: number, fontStyle: 'normal'|'bold'|'italic' = 'normal', color = '#002B49') => {
        pdf.setFont('times', fontStyle);
        pdf.setFontSize(size * 0.75); // Convert px to pt
        pdf.setTextColor(color);
        pdf.text(text, 528, y, { align: 'center' });
      };

      // 4. Draw Rich Vector Text Helper for mixed styles inline
      const drawRichText = (parts: {text: string, font: 'normal'|'bold'|'italic', color?: string}[], y: number, fontSize: number) => {
        pdf.setFontSize(fontSize * 0.75);
        let totalWidth = 0;
        parts.forEach(p => {
          pdf.setFont('times', p.font);
          totalWidth += pdf.getTextWidth(p.text);
        });
        
        let currentX = 528 - (totalWidth / 2); // Center alignment calculation
        
        parts.forEach(p => {
          pdf.setFont('times', p.font);
          pdf.setTextColor(p.color || '#002B49');
          pdf.text(p.text, currentX, y);
          currentX += pdf.getTextWidth(p.text);
        });
      };

      // Y coordinates calculated as CSS top + ~font_size*0.75 for baseline approximation
      drawCenterText(`ID: ${formData.certificate_id}`, 108 + 12.75, 17, 'bold', '#dc2626');
      drawCenterText(formData.name.toUpperCase(), 318 + 28.5, 38, 'bold', '#0a2342');
      
      drawRichText([
        { text: 'S/o. ', font: 'normal' },
        { text: formData.father_name + ',', font: 'bold' }
      ], 392 + 13.5, 18);

      drawRichText([
        { text: 'Successfully Completed his Internship on "', font: 'italic' },
        { text: formData.course, font: 'bold' },
        { text: '" from', font: 'italic' }
      ], 424 + 13.5, 18);

      const formattedStart = format(new Date(formData.start_date || new Date()), 'dd-MM-yyyy');
      const formattedEnd = format(new Date(formData.end_date || new Date()), 'dd-MM-yyyy');
      drawRichText([
        { text: '"', font: 'italic' },
        { text: `${formattedStart} to ${formattedEnd}`, font: 'bold', color: '#cc0000' },
        { text: '" in ', font: 'italic' },
        { text: formData.organization + '.', font: 'italic' }
      ], 454 + 13.5, 18);

      drawRichText([
        { text: `(${formData.branch}) & his Performance Grade "`, font: 'italic' },
        { text: formData.grade, font: 'bold' },
        { text: '".', font: 'italic' }
      ], 484 + 13.5, 18);

      // Bottom internship ID — bottom: 148px => y = 816 - 148
      drawCenterText(formData.internship_no, 816 - 148 + 8.25, 11, 'bold', '#dc2626');

      // 5. Inject Vector QR Code
      if (showQR && printRef.current) {
        const qrContainer = printRef.current.querySelector('.qr-wrapper') as HTMLElement;
        if (qrContainer) {
          const qrCanvas = await html2canvas(qrContainer, { scale: 8, logging: false });
          const qrImgData = qrCanvas.toDataURL('image/png');
          pdf.addImage(qrImgData, 'PNG', 1056 - 76 - 112, 238, 112, 112);
        }
      }

      pdf.save(`${formData.name}_Certificate.pdf`);
    } catch (err) {
      console.error('Error generating vector PDF', err);
      alert('Failed to generate high-resolution PDF.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 font-sans">
      {/* Left: Input Form */}
      <div className="w-[450px] bg-white rounded-xl shadow-lg border p-6 overflow-y-auto shrink-0">
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

          {/* Sign & stamp permanently embedded via high-res overlay */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm font-bold text-green-900 mb-1">✅ Sign &amp; Stamp</p>
            <p className="text-xs text-green-700">The Managing Director signature and official stamp are embedded as a high-resolution overlay — sharp at any zoom level and in PDF export.</p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={handleSaveAndDownloadPNG} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
            <Download size={18} /> Save & Download PNG
          </button>
          <button onClick={handleSaveAndDownloadPDF} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition-colors">
            <FileDown size={18} /> Save Vector PDF (Print Ready)
          </button>
        </div>
      </div>

      {/* Right: Perfect Responsive Vector Preview */}
      <div 
        ref={previewContainerRef}
        className="flex-1 bg-gray-200 border border-gray-300 rounded-xl overflow-hidden flex items-center justify-center relative"
      >
        <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest shadow-lg">
          High-Res Preview
        </div>
        
        {/* Dynamic Scale Wrapper ensures pixel-perfect aspect ratio matching without blurring */}
        <div 
          style={{ 
            width: 1056, 
            height: 816, 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center'
          }} 
          className="shadow-2xl flex-shrink-0"
        >
          <CertificateContent formData={formData} showQR={showQR} />
        </div>
      </div>

      {/* Off-screen strict rendering target for HTML2Canvas (PNG export / QR extraction) */}
      <div className="absolute" style={{ left: '-9999px', top: '-9999px' }}>
        <div ref={printRef}>
          <CertificateContent formData={formData} showQR={showQR} />
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
