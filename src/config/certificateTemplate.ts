export interface TemplateFieldConfig {
  id: string;
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export interface TemplateConfig {
  width: number;
  height: number;
  bgImage: string;
  fields: Record<string, TemplateFieldConfig>;
}

export const defaultTemplateConfig: TemplateConfig = {
  width: 1056,
  height: 816,
  bgImage: '/certificate-bg.jpg',
  fields: {
    certificate_no: {
      id: 'certificate_no',
      label: 'Certificate ID',
      x: 528,
      y: 120,
      fontSize: 22,
      fontFamily: 'sans-serif',
      color: '#0a2342',
      isBold: true,
    },
    qr_code: {
      id: 'qr_code',
      label: 'QR Code',
      x: 820,
      y: 280,
      fontSize: 120, // using fontSize for size of QR
      fontFamily: 'sans-serif',
      color: '#000000',
    },
    student_name: {
      id: 'student_name',
      label: 'Student Name',
      x: 528,
      y: 360,
      fontSize: 40,
      fontFamily: 'sans-serif',
      color: '#0a2342',
      isBold: true,
    },
    paragraph_line1: {
      id: 'paragraph_line1',
      label: 'S/o Line',
      x: 528,
      y: 460,
      fontSize: 18,
      fontFamily: 'serif',
      color: '#000000',
      isItalic: true,
    },
    paragraph_line2: {
      id: 'paragraph_line2',
      label: 'Internship On Line',
      x: 528,
      y: 490,
      fontSize: 18,
      fontFamily: 'serif',
      color: '#000000',
      isItalic: true,
    },
    paragraph_line3: {
      id: 'paragraph_line3',
      label: 'Dates Line',
      x: 528,
      y: 520,
      fontSize: 18,
      fontFamily: 'serif',
      color: '#cc0000',
      isItalic: true,
      isBold: true,
    },
    paragraph_line4: {
      id: 'paragraph_line4',
      label: 'Branch & Grade Line',
      x: 528,
      y: 550,
      fontSize: 18,
      fontFamily: 'serif',
      color: '#000000',
      isItalic: true,
    },
    internship_id: {
      id: 'internship_id',
      label: 'Bottom Internship ID',
      x: 528,
      y: 720,
      fontSize: 14,
      fontFamily: 'sans-serif',
      color: '#cc0000',
      isBold: true,
    }
  }
};
