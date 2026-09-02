import { format } from 'date-fns';
import { X, Printer } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

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

type CertificateModalProps = {
  certificate: any;
  onClose: () => void;
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
        {/* Blank template — sign & stamp are embedded in this background image */}
        <img src="/certificate-bg.jpg" alt="Certificate Background" className="absolute inset-0 w-full h-full object-cover z-0" />
        
        <div className="absolute top-[110px] left-0 right-0 text-center text-[18px] font-bold z-10 text-red-600">
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
        
        <div className="absolute bottom-[148px] left-0 right-0 text-center text-[10px] font-bold text-red-600 tracking-wider z-10">
          {formData.internship_no}
        </div>
        
        {showQR && (
          <div className="absolute top-[230px] right-[80px] w-[110px] h-[110px] qr-wrapper">
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

        {/* High-res signature & stamp overlay — mix-blend-mode:multiply makes white transparent */}
        <img
          src="/signature-highres.png"
          alt="Sign & Stamp"
          className="absolute z-20 pointer-events-none"
          style={{
            left: '240px',
            top: '498px',
            width: '340px',
            mixBlendMode: 'multiply',
          }}
        />
      </div>
    </>
  );
};

export default function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useContainerScale(containerRef, 1056, 816);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const student = certificate.enrollments?.students || certificate.students;
  const courseName = certificate.enrollments?.courses?.course_name || 'App Development';
  const startDate = certificate.enrollments?.start_date;
  const endDate = certificate.enrollments?.end_date;

  let meta: any = {};
  if (certificate.template_version) {
    try {
      meta = JSON.parse(certificate.template_version);
    } catch (e) {}
  }

  const formData = {
    certificate_id: certificate.certificate_no,
    name: student?.full_name || '',
    father_name: student?.father_name || '',
    course: courseName,
    start_date: startDate || new Date().toISOString(),
    end_date: endDate || new Date().toISOString(),
    organization: meta.organization || 'Pixelwind Technologies',
    branch: meta.branch || 'Vizag Branch',
    grade: meta.grade || 'A+',
    internship_no: meta.internship_no || `INTERNSHIP_${certificate.id?.replace(/-/g, '')}`,
    internship_id: certificate.id
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col print:h-auto print:shadow-none relative">
        
        {/* Modal Actions */}
        <div className="shrink-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-20 print:hidden rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-800">Certificate Preview</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg font-medium text-sm"
            >
              <Printer size={16} /> Print Native PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- CERTIFICATE CONTENT (Responsive Container) --- */}
        <div 
          ref={containerRef}
          className="flex-1 bg-gray-200 overflow-hidden flex items-center justify-center relative print:hidden rounded-b-xl"
        >
          <div 
            style={{ 
              width: 1056, 
              height: 816, 
              transform: `scale(${scale})`, 
              transformOrigin: 'center center'
            }} 
            className="shadow-2xl flex-shrink-0 bg-white"
          >
            <CertificateContent formData={formData} showQR={true} />
          </div>
        </div>

        {/* --- PRINT ONLY CONTENT --- */}
        <div className="hidden print:block w-[1056px] h-[816px]">
           <CertificateContent formData={formData} showQR={true} />
        </div>

      </div>
    </div>
  );
}
