import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';
import { Loader } from 'lucide-react';
import { ProfileService } from '../../services/ProfileService';

const ProfileSetup = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: {
      first: '',
      last: ''
    },
    identityInfo: {
      aadhaar: '',
      pan: '',
      dob: '',
      gender: ''
    },
    contactInfo: {
      email: user?.email || '',
      phone: '',
      address: {
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
      }
    },
    professionalInfo: {
      currentOccupation: '',
      designation: '',
      organization: '',
      experience: ''
    },
    education: {
      highestQualification: '',
      university: '',
      yearOfCompletion: ''
    },
    preferences: {
      language: 'hi' as 'hi' | 'en',
      notifications: true,
      accessibility: {
        screenReader: false,
        highContrast: false,
        textSize: 'medium' as 'small' | 'medium' | 'large'
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        navigate('/login', { replace: true });
        return;
    }

    setLoading(true);
    setError('');

    try {
        const profileService = ProfileService.getInstance();
        
        // Transform form data to match database JSONB schema exactly
        const profileData = {
            user_id: user.id,
            // JSONB fields must match exactly
            name: {
                first: formData.name.first,
                last: formData.name.last
            },
            identity_info: {
                dob: formData.identityInfo.dob,
                pan: formData.identityInfo.pan,
                gender: formData.identityInfo.gender,
                aadhaar: formData.identityInfo.aadhaar
            },
            contact_info: {
                email: user.email || formData.contactInfo.email,
                phone: formData.contactInfo.phone,
                address: {
                    street: formData.contactInfo.address.street,
                    city: formData.contactInfo.address.city,
                    district: formData.contactInfo.address.district || '',
                    state: formData.contactInfo.address.state || '',
                    pincode: formData.contactInfo.address.pincode
                }
            },
            professional_info: {
                currentOccupation: formData.professionalInfo.currentOccupation,
                designation: formData.professionalInfo.designation,
                organization: formData.professionalInfo.organization || '',
                experience: formData.professionalInfo.experience || ''
            },
            education: {
                highestQualification: formData.education.highestQualification,
                university: formData.education.university,
                yearOfCompletion: formData.education.yearOfCompletion || ''
            },
            preferences: {
                language: formData.preferences.language,
                notifications: formData.preferences.notifications,
                accessibility: {
                    textSize: formData.preferences.accessibility.textSize,
                    highContrast: formData.preferences.accessibility.highContrast,
                    screenReader: formData.preferences.accessibility.screenReader
                }
            }
        };

        console.log('Submitting profile data:', profileData);
        
        await profileService.createProfile(user.id, profileData);
        navigate('/dashboard', { replace: true });
    } catch (err: any) {
        console.error('Profile creation error:', err);
        setError(err?.message || 'An unknown error occurred');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900">
            प्रोफ़ाइल सेटअप / Profile Setup
          </h1>

          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">व्यक्तिगत जानकारी / Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    पहला नाम / First Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name.first}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, first: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    उपनाम / Last Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name.last}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: { ...prev.name, last: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                {/* Identity Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    आधार नंबर / Aadhaar Number*
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{12}"
                    value={formData.identityInfo.aadhaar}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      identityInfo: { ...prev.identityInfo, aadhaar: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    पैन नंबर / PAN Number*
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    value={formData.identityInfo.pan}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      identityInfo: { ...prev.identityInfo, pan: e.target.value.toUpperCase() }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    जन्म तिथि / Date of Birth*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.identityInfo.dob}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      identityInfo: { ...prev.identityInfo, dob: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    लिंग / Gender*
                  </label>
                  <select
                    required
                    value={formData.identityInfo.gender}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      identityInfo: { ...prev.identityInfo, gender: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  >
                    <option value="">चुनें / Select</option>
                    <option value="male">पुरुष / Male</option>
                    <option value="female">महिला / Female</option>
                    <option value="other">अन्य / Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">संपर्क जानकारी / Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    मोबाइल नंबर / Mobile Number*
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    पता / Address*
                  </label>
                  <textarea
                    required
                    value={formData.contactInfo.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        address: { ...prev.contactInfo.address, street: e.target.value }
                      }
                    }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    शहर / City*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactInfo.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        address: { ...prev.contactInfo.address, city: e.target.value }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    पिन कोड / PIN Code*
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={formData.contactInfo.address.pincode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        address: { ...prev.contactInfo.address, pincode: e.target.value }
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </section>

            {/* Professional Information */}
            <section>
              <h2 className="text-xl font-semibold mb-4">पेशेवर जानकारी / Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    वर्तमान व्यवसाय / Current Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.professionalInfo.currentOccupation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      professionalInfo: { ...prev.professionalInfo, currentOccupation: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    पद / Designation
                  </label>
                  <input
                    type="text"
                    value={formData.professionalInfo.designation}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      professionalInfo: { ...prev.professionalInfo, designation: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-xl font-semibold mb-4">शिक्षा / Education</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    उच्चतम योग्यता / Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.education.highestQualification}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      education: { ...prev.education, highestQualification: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    विश्वविद्यालय/बोर्ड / University/Board
                  </label>
                  <input
                    type="text"
                    value={formData.education.university}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      education: { ...prev.education, university: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-orange-600 to-red-700 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-700 hover:to-red-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  सबमिट हो रहा है... / Submitting...
                </>
              ) : (
                'प्रोफ़ाइल सेट करें / Set Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;