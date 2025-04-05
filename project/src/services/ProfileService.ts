import { supabase } from '../lib/supabase';
import { checkAuth } from '../utils/auth';

// Update the UserProfile interface to match the database schema
export interface UserProfile {
  id: string;
  user_id: string;
  name: {
    first: string;
    last: string;
  };
  identity_info: {
    dob: string;
    pan: string;
    gender: string;
    aadhaar: string;
  };
  contact_info: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    };
  };
  professional_info: {
    currentOccupation: string;
    designation: string;
    organization: string;
    experience: string;
  };
  education: {
    highestQualification: string;
    university: string;
    yearOfCompletion: string;
  };
  preferences: {
    language: string;
    notifications: boolean;
    accessibility: {
      textSize: string;
      highContrast: boolean;
      screenReader: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export class ProfileService {
  private static instance: ProfileService;

  private constructor() {}

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  // Update the createProfile method to match database defaults
  async createProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
        await checkAuth();

        // Ensure JSONB fields are properly structured
        const payload = {
            user_id: userId,
            // Use JSON.stringify/parse to ensure valid JSONB
            name: JSON.parse(JSON.stringify(data.name)) || {
                first: '',
                last: ''
            },
            identity_info: JSON.parse(JSON.stringify(data.identity_info)) || {
                dob: '',
                pan: '',
                gender: '',
                aadhaar: ''
            },
            contact_info: JSON.parse(JSON.stringify(data.contact_info)) || {
                email: '',
                phone: '',
                address: {
                    street: '',
                    city: '',
                    district: '',
                    state: '',
                    pincode: ''
                }
            },
            professional_info: JSON.parse(JSON.stringify(data.professional_info)) || {
                currentOccupation: '',
                designation: '',
                organization: '',
                experience: ''
            },
            education: JSON.parse(JSON.stringify(data.education)) || {
                highestQualification: '',
                university: '',
                yearOfCompletion: ''
            },
            preferences: JSON.parse(JSON.stringify(data.preferences)) || {
                language: 'hi',
                notifications: true,
                accessibility: {
                    textSize: 'medium',
                    highContrast: false,
                    screenReader: false
                }
            }
        };

        // First verify if table exists and is accessible
        const { error: tableError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        if (tableError) {
            console.error('Table verification error:', tableError);
            throw new Error(`Table access error: ${tableError.message}`);
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Profile creation error:', error);
            throw error;
        }

        return profile;
    } catch (err) {
        console.error('Profile creation failed:', err);
        throw err;
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    // Check authentication before operation
    const user = await checkAuth();
    if (user.id !== userId) {
      throw new Error('Unauthorized: User ID mismatch');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Unauthorized: No permission to read profile');
      }
      throw error;
    }
    return data;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    // Check authentication before operation
    const user = await checkAuth();
    if (user.id !== userId) {
      throw new Error('Unauthorized: User ID mismatch');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Unauthorized: No permission to update profile');
      }
      throw error;
    }
    return data;
  }
}