import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, AlertCircle, CheckCircle, Clock, FileText, 
  IndianRupee, Building2, Users, Landmark, MapPin 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { serviceRequirements } from '../../data/serviceRequirements';
// import { AIVerificationService, VerificationStatus } from '../../services/AIVerificationService';
import { OpenAIService } from '../../services/OpenAIService';

type ApplicationStep = 'guidelines' | 'business-info' | 'documents' | 'verification' | 'processing';

// In ServiceApplication.tsx
interface BusinessFormData {
  trade_name: string;
  business_type: string;
  pan: string;
  email: string;
  mobile: string;
  constitution: string;
  commencement_date: string; // This will be formatted before sending to DB
  address: string;
  state: string;
  district: string;
}

interface UploadState {
  [key: string]: {
    file: File | null;
    progress: number;
    error?: string;
  };
}

interface AIProcessingStatus {
  step: string;
  message: string;
}

const ServiceApplication = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<ApplicationStep>('guidelines');
  const [businessInfo, setBusinessInfo] = useState<BusinessFormData>({
    trade_name: '',
    business_type: '',
    pan: '',
    email: '',
    mobile: '',
    constitution: '',
    commencement_date: '',
    address: '',
    state: '',
    district: ''
  });
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [uploadState, setUploadState] = useState<UploadState>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiHelp, setAiHelp] = useState<string>('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIProcessingStatus[]>([]);

  const service = serviceId ? serviceRequirements[serviceId] : null;

  if (!service) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Service not found</h2>
          <p className="mt-2 text-gray-600">The requested service does not exist.</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (docId: string, file: File | null) => {
    if (!file) return;

    // Validate file size and type
    const doc = service.documents.find(d => d.id === docId);
    if (!doc) return;

    if (file.size > doc.maxSize * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        [docId]: {
          file: null,
          progress: 0,
          error: `File size exceeds ${doc.maxSize}MB limit`
        }
      }));
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!doc.format.includes(extension || '')) {
      setUploadState(prev => ({
        ...prev,
        [docId]: {
          file: null,
          progress: 0,
          error: `Invalid file format. Allowed: ${doc.format.join(', ')}`
        }
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      [docId]: { file, progress: 0 }
    }));
  };

  const validateBusinessInfo = () => {
    if (!businessInfo.commencement_date) {
      throw new Error('Please select a valid commencement date');
    }
  
    // Validate date format
    const date = new Date(businessInfo.commencement_date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
  
    // Validate PAN
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(businessInfo.pan)) {
      throw new Error('Invalid PAN format');
    }
  
    // Add more validations as needed
  };

  const handleBusinessInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      validateBusinessInfo();
      // Format date to YYYY-MM-DD for PostgreSQL
      const formattedDate = new Date(businessInfo.commencement_date)
        .toISOString()
        .split('T')[0];

      const { error: dbError } = await supabase
        .from('business_info')
        .insert({
          user_id: user?.id,
          service_id: serviceId,
          ...businessInfo,
          commencement_date: formattedDate // Use formatted date
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message);
      }

      // Get AI suggestions
      const suggestions = await OpenAIService.generateBusinessSuggestions(businessInfo);
      setAiSuggestions(suggestions);

      setStep('documents');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docId: string, file: File) => {
    try {
      setDocuments(prev => ({ ...prev, [docId]: file }));
      setUploadState(prev => ({
        ...prev,
        [docId]: { file, progress: 0 }
      }));

      // Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${serviceId}/${docId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          duplex: 'half'
        });

      if (uploadError) throw uploadError;

      // AI Document Analysis
      const reader = new FileReader();
      reader.onload = async () => {
        const analysis = await OpenAIService.analyzeDocument(
          docId,
          reader.result as string
        );
        
        if (!analysis.isValid) {
          setUploadState(prev => ({
            ...prev,
            [docId]: { 
              ...prev[docId], 
              error: analysis.feedback
            }
          }));
        }
      };
      reader.readAsText(file);

    } catch (err: any) {
      setUploadState(prev => ({
        ...prev,
        [docId]: { 
          ...prev[docId], 
          error: err.message 
        }
      }));
    }
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    setAiProcessing(true);
    setAiStatus([]);
    
    try {
      addAiStatus('init', '🔄 आवेदन प्रक्रिया प्रारंभ / Starting application submission...');
      
      if (Object.keys(documents).length < service.documents.filter(d => d.required).length) {
        throw new Error('Please upload all required documents');
      }

      addAiStatus('documents', '📄 दस्तावेज़ सत्यापन / Documents validation complete');
      
      addAiStatus('ai_processing', '🤖 एआई विश्लेषण चल रहा है / AI analysis in progress...');
      const verificationResult = await OpenAIService.verifyDocuments(
        serviceId || '',
        Object.fromEntries(
          Object.entries(uploadState).map(([key, value]) => [
            key,
            value.file?.name || ''
          ])
        )
      );

      addAiStatus('ai_complete', `✅ एआई विश्लेषण पूर्ण / AI Analysis Complete: ${verificationResult.status}`);

      // Create application record
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: user?.id,
          service_id: serviceId,
          documents: Object.keys(documents),
          status: verificationResult.status,
          ai_confidence: verificationResult.confidence,
          reason: verificationResult.reason
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Then create business info with application reference
      const { error: businessError } = await supabase
        .from('business_info')
        .insert({
          user_id: user?.id,
          service_id: serviceId,
          application_id: applicationData.id,
          trade_name: businessInfo.trade_name,
          business_type: businessInfo.business_type,
          pan: businessInfo.pan,
          email: businessInfo.email,
          mobile: businessInfo.mobile,
          constitution: businessInfo.constitution,
          commencement_date: businessInfo.commencement_date,
          address: businessInfo.address,
          state: businessInfo.state,
          district: businessInfo.district
        });

      if (businessError) throw businessError;

      setStep('verification');
      navigate('/dashboard');

    } catch (err: any) {
      addAiStatus('error', `❌ त्रुटि / Error: ${err.message}`);
      setError(err.message);
    } finally {
      setAiProcessing(false);
      setLoading(false);
    }
  };

  const addAiStatus = (step: string, message: string) => {
    setAiStatus(prev => [...prev, { step, message }]);
  };

  const getAIHelp = async () => {
    const help = await OpenAIService.generateApplicationHelp(
      serviceId || '',
      step,
      businessInfo
    );
    setAiHelp(help);
  };

  const handleBusinessInfoChange = async (field: keyof BusinessFormData, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
    
    if (Object.keys(businessInfo).every(k => businessInfo[k as keyof BusinessFormData])) {
      const suggestions = await OpenAIService.generateBusinessSuggestions(businessInfo);
      setAiSuggestions(suggestions);
    }
  };

  const renderGuidelines = () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-semibold mb-4">
          पात्रता / Eligibility
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          {service.eligibility.map((item, index) => (
            <li key={index} className="text-gray-700">
              <div className="font-medium">{service.eligibilityHindi[index]}</div>
              <div className="text-gray-600">{item}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">
          दिशानिर्देश / Guidelines
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          {service.guidelines.map((item, index) => (
            <li key={index} className="text-gray-700">
              <div className="font-medium">{service.guidelinesHindi[index]}</div>
              <div className="text-gray-600">{item}</div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">
          शुल्क / Fees
        </h3>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <IndianRupee className="w-5 h-5 text-orange-600" />
            <span className="ml-2 text-lg font-semibold">₹{service.fees.amount}</span>
          </div>
          <p className="mt-2 text-gray-600">
            {service.fees.descriptionHindi}
            <br />
            {service.fees.description}
          </p>
        </div>
      </section>

      <button
        onClick={() => setStep('business-info')}
        className="w-full mt-8 bg-gradient-to-r from-orange-600 to-red-700 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-800 transition-colors"
      >
        आगे बढ़ें / Proceed
      </button>
    </div>
  );

  const renderBusinessInfoForm = () => (
    <form onSubmit={handleBusinessInfoSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            व्यापार का नाम / Trade Name
          </label>
          <input
            type="text"
            required
            value={businessInfo.trade_name}
            onChange={e => handleBusinessInfoChange('trade_name', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            पैन नंबर / PAN Number
          </label>
          <input
            type="text"
            required
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            value={businessInfo.pan}
            onChange={e => handleBusinessInfoChange('pan', e.target.value.toUpperCase())}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            व्यवसाय प्रकार / Business Type
          </label>
          <select
            required
            value={businessInfo.business_type}
            onChange={e => handleBusinessInfoChange('business_type', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="">चुनें / Select</option>
            <option value="proprietorship">एकल स्वामित्व / Proprietorship</option>
            <option value="partnership">साझेदारी / Partnership</option>
            <option value="pvt_ltd">प्राइवेट लिमिटेड / Private Limited</option>
            <option value="ltd">पब्लिक लिमिटेड / Public Limited</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            आरंभ तिथि / Commencement Date
          </label>
          <input
            type="date"
            required
            value={businessInfo.commencement_date}
            onChange={e => handleBusinessInfoChange('commencement_date', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ईमेल / Email
          </label>
          <input
            type="email"
            required
            value={businessInfo.email}
            onChange={e => handleBusinessInfoChange('email', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            मोबाइल / Mobile
          </label>
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            value={businessInfo.mobile}
            onChange={e => handleBusinessInfoChange('mobile', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            संविधान / Constitution
          </label>
          <select
            required
            value={businessInfo.constitution}
            onChange={e => handleBusinessInfoChange('constitution', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          >
            <option value="">चुनें / Select</option>
            <option value="private_individual">निजी व्यक्ति / Private Individual</option>
            <option value="hindu_undivided_family">हिंदू अविभाजित परिवार / Hindu Undivided Family</option>
            <option value="partnership_firm">साझेदारी फर्म / Partnership Firm</option>
            <option value="company">कंपनी / Company</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            पता / Address
          </label>
          <textarea
            required
            value={businessInfo.address}
            onChange={e => handleBusinessInfoChange('address', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            राज्य / State
          </label>
          <input
            type="text"
            required
            value={businessInfo.state}
            onChange={e => handleBusinessInfoChange('state', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            जिला / District
          </label>
          <input
            type="text"
            required
            value={businessInfo.district}
            onChange={e => handleBusinessInfoChange('district', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep('guidelines')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          ← पीछे / Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-700 rounded-md shadow-sm hover:from-orange-700 hover:to-red-800 disabled:opacity-50"
        >
          {loading ? 'प्रोसेसिंग... / Processing...' : 'आगे बढ़ें / Next →'}
        </button>
      </div>
    </form>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document upload sections */}
        <DocumentUploadCard
          icon={<Building2 className="w-6 h-6" />}
          title="व्यवसाय पंजीकरण / Business Registration"
          description="Partnership Deed, Incorporation Certificate etc."
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(file) => handleFileUpload('business_registration', file)}
        />
        
        <DocumentUploadCard
          icon={<Users className="w-6 h-6" />}
          title="पहचान प्रमाण / Identity Proof"
          description="Aadhaar Card, PAN Card etc."
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(file) => handleFileUpload('identity_proof', file)}
        />

        {/* Add more document upload cards */}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep('business-info')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          ← पीछे / Back
        </button>
        <button
          onClick={handleSubmitApplication}
          disabled={loading || Object.keys(documents).length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-red-700 rounded-md shadow-sm hover:from-orange-700 hover:to-red-800 disabled:opacity-50"
        >
          {loading ? 'जमा हो रहा है... / Submitting...' : 'जमा करें / Submit'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {service.titleHindi}
            <span className="block text-xl text-gray-600 mt-1">{service.title}</span>
          </h1>
          
          <p className="mt-4 text-gray-600">{service.description}</p>

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-8">
            {step === 'guidelines' && renderGuidelines()}
            {step === 'business-info' && renderBusinessInfoForm()}
            {step === 'documents' && renderDocumentUpload()}
            {/* Add other step renders here */}
          </div>
        </div>
      </div>
      {aiProcessing && <AIStatusDisplay aiStatus={aiStatus} />}
    </div>
  );
};

interface DocumentUploadCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accept: string;
  onChange: (file: File) => void;
}

const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  icon,
  title,
  description,
  accept,
  onChange
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const optimizeImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    try {
      setLoading(true);
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set max dimensions
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      // Create blob URL
      const url = URL.createObjectURL(file);
      
      // Load image
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });

      // Calculate dimensions
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b!),
          'image/jpeg',
          0.8 // Compression quality
        );
      });

      // Create new optimized file
      const optimizedFile = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, "") + ".jpg",
        {
          type: 'image/jpeg',
          lastModified: Date.now(),
        }
      );

      // Cleanup
      URL.revokeObjectURL(url);
      
      return optimizedFile;
    } catch (err) {
      console.error('Image optimization failed:', err);
      return file;
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const optimizedFile = await optimizeImage(file);
      
      // Update preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(optimizedFile);

      // Call parent onChange
      onChange(optimizedFile);
    } catch (err) {
      console.error('File processing failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-orange-100 rounded-full text-orange-600">
          {icon}
        </div>
        <div className="ml-3">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <label className="block">
        <input
          type="file"
          className="sr-only"
          accept={accept}
          onChange={handleFileChange}
        />
        <div className="cursor-pointer text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          ) : preview ? (
            <img src={preview} alt="Preview" className="max-h-32 mx-auto" />
          ) : (
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
          )}
          <span className="mt-2 block text-sm text-gray-600">
            {loading ? 'Optimizing...' : 'Click to upload or drag and drop'}
          </span>
        </div>
      </label>
    </div>
  );
};

interface AIStatusDisplayProps {
  aiStatus: AIProcessingStatus[];
}

const AIStatusDisplay: React.FC<AIStatusDisplayProps> = ({ aiStatus }) => (
  <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg overflow-hidden border border-orange-200">
    <div className="bg-orange-600 text-white px-4 py-2 flex items-center">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
      <span>एआई प्रोसेसिंग / AI Processing</span>
    </div>
    <div className="max-h-48 overflow-y-auto p-4">
      {aiStatus.map((status, index) => (
        <div key={index} className="mb-2 last:mb-0 text-sm">
          {status.message}
        </div>
      ))}
    </div>
  </div>
);

export default ServiceApplication;