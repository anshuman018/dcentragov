export interface ServiceRequirement {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  eligibility: string[];
  eligibilityHindi: string[];
  guidelines: string[];
  guidelinesHindi: string[];
  documents: DocumentRequirement[];
  fees: {
    amount: number;
    description: string;
    descriptionHindi: string;
  };
  timeline: string;
  timelineHindi: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  required: boolean;
  format: string[];
  maxSize: number; // in MB
}

export const serviceRequirements: Record<string, ServiceRequirement> = {
  'gst': {
    id: 'gst',
    title: 'GST Registration',
    titleHindi: 'जीएसटी पंजीकरण',
    description: 'Register for Goods & Services Tax under the Indian GST Act',
    eligibility: [
      'Business with annual turnover exceeding ₹40 lakhs (goods)',
      'Business with annual turnover exceeding ₹20 lakhs (services)',
      'Valid PAN card and business registration',
      'Bank account in the name of business'
    ],
    eligibilityHindi: [
      'व्यवसाय जिनका वार्षिक टर्नओवर ₹40 लाख से अधिक है (वस्तुएं)',
      'व्यवसाय जिनका वार्षिक टर्नओवर ₹20 लाख से अधिक है (सेवाएं)',
      'वैध पैन कार्ड और व्यवसाय पंजीकरण',
      'व्यवसाय के नाम पर बैंक खाता'
    ],
    guidelines: [
      'Complete the application form with accurate business details',
      'Upload clear, legible copies of all required documents',
      'Ensure bank account is active and verified',
      'Provide correct contact information for verification'
    ],
    guidelinesHindi: [
      'सटीक व्यवसाय विवरण के साथ आवेदन पत्र भरें',
      'सभी आवश्यक दस्तावेजों की स्पष्ट, पठनीय प्रतियां अपलोड करें',
      'सुनिश्चित करें कि बैंक खाता सक्रिय और सत्यापित है',
      'सत्यापन के लिए सही संपर्क जानकारी प्रदान करें'
    ],
    documents: [
      {
        id: 'pan',
        name: 'PAN Card',
        nameHindi: 'पैन कार्ड',
        description: 'Valid PAN card of the business entity or proprietor',
        descriptionHindi: 'व्यवसाय इकाई या मालिक का वैध पैन कार्ड',
        required: true,
        format: ['jpg', 'jpeg', 'png', 'pdf'],
        maxSize: 2
      },
      {
        id: 'address',
        name: 'Address Proof',
        nameHindi: 'पता प्रमाण',
        description: 'Recent utility bill or rental agreement',
        descriptionHindi: 'हाल का उपयोगिता बिल या किराया समझौता',
        required: true,
        format: ['jpg', 'jpeg', 'png', 'pdf'],
        maxSize: 5
      },
      // Add more documents as needed
    ],
    fees: {
      amount: 500,
      description: 'Registration fee (non-refundable)',
      descriptionHindi: 'पंजीकरण शुल्क (अप्रतिदेय)'
    },
    timeline: 'Processing time: 3-7 working days',
    timelineHindi: 'प्रसंस्करण समय: 3-7 कार्य दिवस'
  }
  // Add other services similarly
};