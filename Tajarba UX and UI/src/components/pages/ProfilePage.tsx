import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Save } from 'lucide-react';
import { useState } from 'react';

interface ProfilePageProps {
  onPageChange: (page: string) => void;
}

export function ProfilePage({ onPageChange }: ProfilePageProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState('Taha Iqbal');
  const [email, setEmail] = useState('taha.iqbal@example.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [city, setCity] = useState('Lahore');
  const [fatherName, setFatherName] = useState('Muhammad Iqbal');
  const [dateOfBirth, setDateOfBirth] = useState('2005-01-15');
  const [gender, setGender] = useState('Male');
  
  // Matriculation
  const [matricMajor, setMatricMajor] = useState('Science');
  const [matricTotal, setMatricTotal] = useState('1100');
  const [matricObtained, setMatricObtained] = useState('950');
  
  // Intermediate
  const [interType, setInterType] = useState('FSC Pre-Engineering');
  const [interTotal, setInterTotal] = useState('1100');
  const [interObtained, setInterObtained] = useState('890');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    alert('Profile saved successfully!');
    onPageChange('dashboard');
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2">My Profile</h1>
            <p className="text-blue-100">
              Manage your personal information and preferences
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
              {/* Profile Picture */}
              <div>
                <h2 className="mb-4">Profile Information</h2>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-4xl overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>TI</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <p className="text-sm text-slate-600 mb-2">Max size: 5MB (JPG, PNG, GIF)</p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Phone <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
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
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Matric Total Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={matricTotal}
                        onChange={(e) => setMatricTotal(e.target.value)}
                        placeholder="Enter total marks for Matric"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Matric Obtained Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={matricObtained}
                        onChange={(e) => setMatricObtained(e.target.value)}
                        placeholder="Enter obtained marks for Matric"
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
                        <option value="FSC Pre-Engineering">FSC Pre-Engineering</option>
                        <option value="FSC Pre-Medical">FSC Pre-Medical</option>
                        <option value="ICS">ICS</option>
                        <option value="ICOM">ICOM</option>
                        <option value="A-Levels">A-Levels</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Intermediate Total Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={interTotal}
                        onChange={(e) => setInterTotal(e.target.value)}
                        placeholder="Enter total marks for Intermediate"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">
                        Intermediate Obtained Marks <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={interObtained}
                        onChange={(e) => setInterObtained(e.target.value)}
                        placeholder="Enter obtained marks for Intermediate"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-[#1e3a5f] to-amber-500 text-white hover:shadow-lg transition-all px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}