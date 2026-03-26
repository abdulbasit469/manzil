import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Save, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface ProfilePageProps {
  onPageChange: (page: string) => void;
}

const INTEREST_OPTIONS = [
  'Engineering',
  'Medicine / MBBS',
  'Computer Science',
  'Business & Finance',
  'Law',
  'Arts & Media',
  'Social sciences',
  'Teaching',
  'Research',
  'Entrepreneurship',
];

export function ProfilePage({ onPageChange }: ProfilePageProps) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileGaps, setProfileGaps] = useState<{ field: string; label: string }[]>([]);
  const [firstYearMarks, setFirstYearMarks] = useState('');
  const [secondYearMarks, setSecondYearMarks] = useState('');
  const [secondYearResultAvailable, setSecondYearResultAvailable] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Matriculation
  const [matricMajor, setMatricMajor] = useState('');
  const [matricTotal, setMatricTotal] = useState('1100');
  const [matricObtained, setMatricObtained] = useState('');
  
  // Intermediate
  const [interType, setInterType] = useState('');
  const [interTotal, setInterTotal] = useState('1100');
  const [interObtained, setInterObtained] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const profile = response.data.profile;
      setProfileCompletion(response.data.profileCompletion ?? 0);
      setProfileGaps(response.data.profileGaps || []);
      
      // Set all profile data from database
      setFullName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setFatherName(profile.fatherName || '');
      setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '');
      setGender(profile.gender || '');
      
      // Matriculation
      setMatricMajor(profile.matricMajors || '');
      setMatricTotal('1100'); // Total is always 1100
      setMatricObtained(profile.matricMarks?.toString() || '');
      
      // Intermediate
      setInterType(profile.intermediateType || '');
      setInterTotal('1100'); // Total is always 1100
      setInterObtained(profile.intermediateMarks?.toString() || '');
      setFirstYearMarks(profile.firstYearMarks != null ? String(profile.firstYearMarks) : '');
      setSecondYearMarks(profile.secondYearMarks != null ? String(profile.secondYearMarks) : '');
      setSecondYearResultAvailable(Boolean(profile.secondYearResultAvailable));
      setInterests(Array.isArray(profile.interests) ? profile.interests : []);
      
      // Profile picture
      if (profile.profilePicture) {
        setProfileImage(profile.profilePicture);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type - only allow JPG and PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const fileType = file.type.toLowerCase();
    
    if (!allowedTypes.includes(fileType)) {
      toast.error('Only JPG and PNG files are allowed');
      // Reset the input
      e.target.value = '';
      return;
    }

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should not exceed 5MB');
      // Reset the input
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setProfileImage(base64Image);
      // Auto-save profile picture immediately
      saveProfilePicture(base64Image);
    };
    reader.readAsDataURL(file);
  };

  const saveProfilePicture = async (imageData: string) => {
    try {
      await api.put('/profile', { profilePicture: imageData });
      toast.success('Profile picture updated');
      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }
      // Refresh TopNavbar by triggering a re-fetch
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error: any) {
      console.error('Error saving profile picture:', error);
      toast.error('Failed to save profile picture');
    }
  };

  // Handler to allow only whole numbers (no decimals)
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Remove any non-digit characters (including decimal points, commas, etc.)
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const profileData: Record<string, unknown> = {
        name: fullName,
        phone: phone,
        city: city,
        fatherName: fatherName,
        gender: gender,
        dateOfBirth: dateOfBirth,
        matricMajors: matricMajor,
        matricMarks: matricObtained ? parseInt(matricObtained, 10) : undefined,
        intermediateType: interType,
        firstYearMarks: firstYearMarks ? parseInt(firstYearMarks, 10) : undefined,
        secondYearMarks: secondYearMarks ? parseInt(secondYearMarks, 10) : undefined,
        secondYearResultAvailable,
        intermediateMarks: interObtained ? parseInt(interObtained, 10) : undefined,
        interests,
      };

      // Include profile picture if it was updated
      if (profileImage && profileImage.startsWith('data:image')) {
        profileData.profilePicture = profileImage;
      }

      const response = await api.put('/profile', profileData);
      if (response.data?.profileCompletion != null) {
        setProfileCompletion(response.data.profileCompletion);
      }
      if (Array.isArray(response.data?.profileGaps)) {
        setProfileGaps(response.data.profileGaps);
      }
      
      toast.success('Profile saved successfully!');
      
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
      
      // Trigger profile update event for TopNavbar
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Navigate back to dashboard
      onPageChange('dashboard');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Get initials for fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2">My Profile</h1>
            <p className="text-blue-100">
              Academic background, preferences, and progress — aligned with your FYP student profile module
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="space-y-8">
              {/* Profile completion */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {profileCompletion >= 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-semibold text-slate-800">Profile completion</span>
                  </div>
                  <span className="text-lg font-bold text-[#1e3a5f]">{profileCompletion}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#1e3a5f] transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileGaps.length > 0 && (
                  <p className="text-xs text-slate-600 mt-2">
                    Still needed: {profileGaps.map((g) => g.label).join(', ')}
                  </p>
                )}
              </div>

              {/* Profile Picture */}
              <div>
                <h2 className="mb-4">Profile Information</h2>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div 
                      className={`w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-4xl overflow-hidden ${profileImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                      onClick={() => {
                        if (profileImage) {
                          setShowImageModal(true);
                        }
                      }}
                    >
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>{getInitials(fullName)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="text-sm text-slate-600 mb-2">Maximum size: 5MB (JPG, PNG only)</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all">
                        <Upload className="w-4 h-4" />
                        Choose Image
                      </span>
                    </label>
                  </div>
                </div>

                {/* Image Modal */}
                {showImageModal && profileImage && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowImageModal(false)}
                  >
                    <div className="relative max-w-4xl max-h-[90vh]">
                      <button
                        onClick={() => setShowImageModal(false)}
                        className="absolute -top-10 right-0 text-white hover:text-amber-400 transition-colors"
                      >
                        <X className="w-8 h-8" />
                      </button>
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Phone <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handleNumberInput(e.target.value, setPhone)}
                      placeholder="Enter your phone number"
                      inputMode="numeric"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      City <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter your city"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Father&apos;s Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Enter your father's name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Date of Birth <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-600 mb-2">
                      Gender <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="">Select your gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preferences (proposal: manage preferences) */}
              <div>
                <h3 className="mb-2">Career interests & preferences</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Select areas you want to explore — helps Manzil tailor guidance (optional but recommended).
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        interests.includes(tag)
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="mb-4">Education</h3>
                
                {/* Matriculation */}
                <div className="mb-6">
                  <h4 className="text-sm mb-3">Matriculation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Majors in Matric <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={matricMajor}
                        onChange={(e) => setMatricMajor(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="">Select your major in Matric</option>
                        <option value="Science">Science</option>
                        <option value="Arts">Arts</option>
                        <option value="Commerce">Commerce</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Matric Total Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={matricTotal}
                        onChange={(e) => handleNumberInput(e.target.value, setMatricTotal)}
                        placeholder="Enter total marks"
                        inputMode="numeric"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Matric Obtained Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={matricObtained}
                        onChange={(e) => handleNumberInput(e.target.value, setMatricObtained)}
                        placeholder="Enter obtained marks"
                        inputMode="numeric"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Intermediate */}
                <div>
                  <h4 className="text-sm mb-3">Intermediate</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Intermediate Type <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={interType}
                        onChange={(e) => setInterType(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      >
                        <option value="">Select your intermediate type</option>
                        <option value="FSc Pre-Engineering">FSc Pre-Engineering</option>
                        <option value="FSc Pre-Medical">FSc Pre-Medical</option>
                        <option value="ICS">ICS</option>
                        <option value="ICOM">ICOM</option>
                        <option value="FA">FA</option>
                        <option value="A-Levels">A-Levels</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Part-I / First year marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstYearMarks}
                        onChange={(e) => handleNumberInput(e.target.value, setFirstYearMarks)}
                        placeholder="e.g. 520 (out of 550)"
                        inputMode="numeric"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Intermediate Total Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={interTotal}
                        onChange={(e) => handleNumberInput(e.target.value, setInterTotal)}
                        placeholder="Enter total marks"
                        inputMode="numeric"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Intermediate Obtained Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={interObtained}
                        onChange={(e) => handleNumberInput(e.target.value, setInterObtained)}
                        placeholder="Enter obtained marks"
                        inputMode="numeric"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:items-end">
                    <div className="flex-1">
                      <label className="block text-sm text-slate-600 mb-2">
                        Part-II / Second year marks (optional)
                      </label>
                      <input
                        type="text"
                        value={secondYearMarks}
                        onChange={(e) => handleNumberInput(e.target.value, setSecondYearMarks)}
                        placeholder="If result is out"
                        inputMode="numeric"
                        disabled={!secondYearResultAvailable}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={secondYearResultAvailable}
                        onChange={(e) => {
                          setSecondYearResultAvailable(e.target.checked);
                          if (!e.target.checked) setSecondYearMarks('');
                        }}
                        className="rounded border-slate-300"
                      />
                      Second year result available
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg transition-all px-8"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}