import { format } from 'date-fns';
import { X, Printer } from 'lucide-react';
import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type CertificateModalProps = {
  certificate: any;
  onClose: () => void;
};

export default function CertificateModal({ certificate, onClose }: CertificateModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:w-full relative flex flex-col items-center">
        
        {/* Modal Actions */}
        <div className="sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-20 print:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Certificate Preview</h2>
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

        {/* --- CERTIFICATE CONTENT --- */}
        <div className="relative bg-white text-gray-900 w-[1056px] h-[816px] shadow-2xl print:shadow-none mx-auto overflow-hidden">
          
          {/* BACKGROUND IMAGE - User must place certificate-bg.png in public folder */}
          <div 
            className="absolute inset-0 bg-no-repeat bg-cover bg-center z-0" 
            style={{ backgroundImage: 'url("/certificate-bg.png")' }}
          ></div>

          {/* OVERLAY CONTENT */}
          <div className="relative z-10 w-full h-full">
            
            {/* Top ID */}
            <div className="absolute top-[120px] left-0 w-full text-center pl-[20px]">
              <p className="text-[22px] font-bold text-[#0a2342] tracking-wide font-sans">
                ID: {certificate.certificate_no}
              </p>
            </div>

            {/* QR Code */}
            <div className="absolute top-[280px] right-[80px] bg-white p-1 rounded-sm shadow-sm">
              <QRCodeSVG 
                value={`https://pixelwindcertify.vercel.app/verify/${certificate.id}`}
                size={120} 
              />
            </div>

            {/* Student Name */}
            <div className="absolute top-[360px] left-0 w-full text-center">
              <h2 className="text-[40px] font-bold text-[#0a2342] uppercase font-sans tracking-wide">
                {student?.full_name}
              </h2>
            </div>

            {/* Paragraph Text */}
            <div className="absolute top-[460px] left-0 w-full text-center px-[120px] space-y-2">
              <p className="text-[18px] text-[#000000] italic font-serif leading-snug">
                S/o. {student?.father_name || student?.guardian_name || '_________________________'},
              </p>
              <p className="text-[18px] text-[#000000] italic font-serif leading-snug">
                Successfully Completed his Internship on <span className="font-bold font-serif">"{courseName.toUpperCase()}"</span> from
              </p>
              <p className="text-[18px] text-[#000000] italic font-serif leading-snug">
                <span className="font-bold text-[#cc0000]">"{startDate ? format(new Date(startDate), 'dd-MM-yyyy') : '___'} to {endDate ? format(new Date(endDate), 'dd-MM-yyyy') : '___'}"</span> in Pixelwind Technologies.
              </p>
              <p className="text-[18px] text-[#000000] italic font-serif leading-snug">
                (Vizag Branch) & his Performance Grade <span className="font-bold font-serif">"{certificate.grade || 'A'}"</span>.
              </p>
            </div>

            {/* Bottom ID */}
            <div className="absolute top-[720px] left-0 w-full text-center">
               <p className="text-[#cc0000] font-bold text-[14px] tracking-wider">
                  INTERNSHIP_{certificate.id?.replace(/-/g, '')}
               </p>
            </div>
            
            {/* 
              Note: The Logo, the Seal, the Ribbons, the Badges, and the Signature graphic 
              should all be baked into the 'certificate-bg.png' background image. 
              The HTML only overlays the dynamic text and QR code on top of it.
            */}

          </div>
        </div>

      </div>
    </div>
  );
}

