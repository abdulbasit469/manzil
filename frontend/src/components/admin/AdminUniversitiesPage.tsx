import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Edit, Trash2, MapPin, Globe, Users, Loader2, X, Upload, Image as ImageIcon, BookOpen, Banknote } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../services/api';
import { toast } from 'sonner';
import { universityNameLabel } from '../../utils/universityDisplay';

interface University {
  _id: string;
  name: string;
  city?: string;
  type?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  hecRanking?: number;
  establishedYear?: number;
  programCount?: number;
  image?: string;
  feeComputingEngSemester?: string;
  feeBusinessSocialSemester?: string;
  feeBsTypicalSemester?: string;
  feeMbbsPerYear?: string;
  feePublicRegularSemester?: string;
  feePublicSelfFinanceSemester?: string;
}

interface EditProgramRow {
  _id: string;
  name: string;
  degree: string;
  programGroup?: string;
  category?: string;
}

export function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    private: 0,
    totalPrograms: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [editPrograms, setEditPrograms] = useState<EditProgramRow[]>([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: '',
    degree: 'BS',
    programGroup: '',
    category: 'Other',
  });
  const [addingProgram, setAddingProgram] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
      type: 'Public',
    website: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    hecRanking: '',
    establishedYear: '',
    image: '',
    feeComputingEngSemester: '',
    feeBusinessSocialSemester: '',
    feeBsTypicalSemester: '',
    feeMbbsPerYear: '',
    feePublicRegularSemester: '',
    feePublicSelfFinanceSemester: '',
  });
  const [universityImage, setUniversityImage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/universities', {
        params: {
          page,
          limit: 10,
          search: debouncedSearch || undefined,
        },
      });
      if (response.data.success) {
        const uniList = response.data.universities || [];
        setUniversities(uniList);
        setTotal(response.data.total || response.data.pagination?.total || uniList.length);
        setTotalPages(response.data.totalPages || response.data.pagination?.pages || 1);
        
        // Don't calculate stats from current page - use backend stats instead
      }
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsResponse = await api.get('/admin/stats');
      if (statsResponse.data.success) {
        const s = statsResponse.data.stats;
        setStats((prev) => ({
          ...prev,
          total: s.universities ?? 0,
          public: s.universitiesPublic ?? 0,
          private: s.universitiesPrivate ?? 0,
          totalPrograms: s.programs ?? 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      const next = searchQuery.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchUniversities();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUniversities();
      fetchStats();
    }, 120000);
    return () => clearInterval(interval);
  }, [page, debouncedSearch]);

  const handleDelete = async (universityId: string) => {
    if (!window.confirm('Are you sure you want to delete this university?')) {
      return;
    }
    try {
      await api.delete(`/admin/universities/${universityId}`);
      toast.success('University deleted successfully');
      fetchUniversities();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting university:', error);
      toast.error(error.response?.data?.message || 'Failed to delete university');
    }
  };

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare data - convert empty strings to undefined and parse numbers
      const universityData: any = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        type: formData.type
      };

      if (formData.website.trim()) universityData.website = formData.website.trim();
      if (formData.email.trim()) universityData.email = formData.email.trim();
      if (formData.phone.trim()) universityData.phone = formData.phone.trim();
      if (formData.address.trim()) universityData.address = formData.address.trim();
      if (formData.description.trim()) universityData.description = formData.description.trim();
      if (formData.hecRanking.trim()) universityData.hecRanking = parseInt(formData.hecRanking);
      if (formData.establishedYear.trim()) universityData.establishedYear = parseInt(formData.establishedYear);

      universityData.feeComputingEngSemester = formData.feeComputingEngSemester.trim();
      universityData.feeBusinessSocialSemester = formData.feeBusinessSocialSemester.trim();
      universityData.feeBsTypicalSemester = formData.feeBsTypicalSemester.trim();
      universityData.feeMbbsPerYear = formData.feeMbbsPerYear.trim();
      universityData.feePublicRegularSemester = formData.feePublicRegularSemester.trim();
      universityData.feePublicSelfFinanceSemester = formData.feePublicSelfFinanceSemester.trim();

      const response = await api.post('/admin/universities', universityData);
      
      if (response.data.success) {
        toast.success('University added successfully');
        // Reset form
        setFormData({
          name: '',
          city: '',
          type: 'Public',
          website: '',
          email: '',
          phone: '',
          address: '',
          description: '',
          hecRanking: '',
          establishedYear: '',
          image: '',
          feeComputingEngSemester: '',
          feeBusinessSocialSemester: '',
          feeBsTypicalSemester: '',
          feeMbbsPerYear: '',
          feePublicRegularSemester: '',
          feePublicSelfFinanceSemester: '',
        });
        setUniversityImage('');
        setShowAddModal(false);
        // Refresh universities and stats
        fetchUniversities();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error adding university:', error);
      toast.error(error.response?.data?.message || 'Failed to add university');
    } finally {
      setSubmitting(false);
    }
  };

  const loadProgramsForEdit = useCallback(async (universityId: string) => {
    setProgramsLoading(true);
    try {
      const res = await api.get(`/universities/${universityId}/programs`);
      setEditPrograms(res.data?.programs || []);
    } catch {
      setEditPrograms([]);
      toast.error('Could not load programs');
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  const handleAddProgramInModal = async () => {
    if (!editingUniversity || !newProgram.name.trim()) {
      toast.error('Please enter a program name');
      return;
    }
    setAddingProgram(true);
    try {
      await api.post('/admin/programs', {
        university: editingUniversity._id,
        name: newProgram.name.trim(),
        degree: newProgram.degree.trim() || 'BS',
        duration: '4 years',
        feePerSemester: 0,
        category: newProgram.category.trim() || 'Other',
        programGroup: newProgram.programGroup.trim() || undefined,
        description: '',
        isActive: true,
      });
      toast.success('Program added');
      setNewProgram({ name: '', degree: 'BS', programGroup: '', category: 'Other' });
      await loadProgramsForEdit(editingUniversity._id);
      fetchStats();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Could not add program');
    } finally {
      setAddingProgram(false);
    }
  };

  const handleDeleteProgramInModal = async (programId: string, programName: string) => {
    if (!window.confirm(`Delete "${programName}"?`)) return;
    try {
      await api.delete(`/admin/programs/${programId}`);
      toast.success('Program deleted');
      setEditPrograms((prev) => prev.filter((p) => p._id !== programId));
      fetchStats();
    } catch {
      toast.error('Delete failed');
    }
  };

  const resetEditModal = () => {
    setShowEditModal(false);
    setEditingUniversity(null);
    setEditPrograms([]);
    setNewProgram({ name: '', degree: 'BS', programGroup: '', category: 'Other' });
    setFormData({
      name: '',
      city: '',
      type: 'Public',
      website: '',
      email: '',
      phone: '',
      address: '',
      description: '',
      hecRanking: '',
      establishedYear: '',
      image: '',
      feeComputingEngSemester: '',
      feeBusinessSocialSemester: '',
      feeBsTypicalSemester: '',
      feeMbbsPerYear: '',
      feePublicRegularSemester: '',
      feePublicSelfFinanceSemester: '',
    });
    setUniversityImage('');
  };

  const handleEditClick = (university: University) => {
    setEditingUniversity(university);
    setFormData({
      name: university.name || '',
      city: university.city || '',
      type: university.type || 'Public',
      website: university.website || '',
      email: university.email || '',
      phone: university.phone || '',
      address: university.address || '',
      description: university.description || '',
      hecRanking: university.hecRanking?.toString() || '',
      establishedYear: university.establishedYear?.toString() || '',
      image: '',
      feeComputingEngSemester: university.feeComputingEngSemester || '',
      feeBusinessSocialSemester: university.feeBusinessSocialSemester || '',
      feeBsTypicalSemester: university.feeBsTypicalSemester || '',
      feeMbbsPerYear: university.feeMbbsPerYear || '',
      feePublicRegularSemester: university.feePublicRegularSemester || '',
      feePublicSelfFinanceSemester: university.feePublicSelfFinanceSemester || '',
    });
    // Set image preview if university has an image
    if (university.image) {
      setUniversityImage(university.image);
    } else {
      setUniversityImage('');
    }
    setShowEditModal(true);
    loadProgramsForEdit(university._id);
    api
      .get(`/universities/${university._id}`)
      .then((res) => {
        const u = res.data?.university;
        if (!u) return;
        setFormData((prev) => ({
          ...prev,
          website: u.website || prev.website,
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
          description: u.description || '',
          hecRanking: u.hecRanking != null ? String(u.hecRanking) : prev.hecRanking,
          establishedYear: u.establishedYear != null ? String(u.establishedYear) : prev.establishedYear,
          feeComputingEngSemester: u.feeComputingEngSemester ?? prev.feeComputingEngSemester,
          feeBusinessSocialSemester: u.feeBusinessSocialSemester ?? prev.feeBusinessSocialSemester,
          feeBsTypicalSemester: u.feeBsTypicalSemester ?? prev.feeBsTypicalSemester,
          feeMbbsPerYear: u.feeMbbsPerYear ?? prev.feeMbbsPerYear,
          feePublicRegularSemester: u.feePublicRegularSemester ?? prev.feePublicRegularSemester,
          feePublicSelfFinanceSemester: u.feePublicSelfFinanceSemester ?? prev.feePublicSelfFinanceSemester,
        }));
        if (u.image && !university.image) {
          setUniversityImage(u.image);
        }
      })
      .catch(() => {});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type - only allow JPG and PNG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      // Reset input so same file can be selected again
      e.target.value = '';
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      // Reset input so same file can be selected again
      e.target.value = '';
      return;
    }

    // Convert to base64 for preview and upload
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setUniversityImage(base64Image);
      // Use functional update to ensure we have the latest formData
      setFormData(prev => ({ ...prev, image: base64Image }));
    };
    reader.readAsDataURL(file);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;
    
    setSubmitting(true);

    try {
      // Prepare data - convert empty strings to undefined and parse numbers
      const universityData: any = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        type: formData.type
      };

      if (formData.website.trim()) universityData.website = formData.website.trim();
      if (formData.email.trim()) universityData.email = formData.email.trim();
      if (formData.phone.trim()) universityData.phone = formData.phone.trim();
      if (formData.address.trim()) universityData.address = formData.address.trim();
      if (formData.description.trim()) universityData.description = formData.description.trim();
      if (formData.hecRanking.trim()) universityData.hecRanking = parseInt(formData.hecRanking);
      if (formData.establishedYear.trim()) universityData.establishedYear = parseInt(formData.establishedYear);

      universityData.feeComputingEngSemester = formData.feeComputingEngSemester.trim();
      universityData.feeBusinessSocialSemester = formData.feeBusinessSocialSemester.trim();
      universityData.feeBsTypicalSemester = formData.feeBsTypicalSemester.trim();
      universityData.feeMbbsPerYear = formData.feeMbbsPerYear.trim();
      universityData.feePublicRegularSemester = formData.feePublicRegularSemester.trim();
      universityData.feePublicSelfFinanceSemester = formData.feePublicSelfFinanceSemester.trim();

      // Include image if it was uploaded (base64 string)
      if (formData.image && formData.image.startsWith('data:image')) {
        universityData.image = formData.image;
      } else if (universityImage && !formData.image) {
        // If there's an existing image preview but no new image, keep the existing one
        universityData.image = universityImage;
      }

      const response = await api.put(`/admin/universities/${editingUniversity._id}`, universityData);
      
      if (response.data.success) {
        toast.success('University updated successfully');
        resetEditModal();
        fetchUniversities();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error updating university:', error);
      toast.error(error.response?.data?.message || 'Failed to update university');
    } finally {
      setSubmitting(false);
    }
  };

  // Get first letter for avatar, but display full name
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const indicativeFeeFormSection = (
    <div className="border-t border-slate-200 pt-4">
      <h4 className="text-lg font-semibold mb-1 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-purple-600" />
        Indicative fee ranges (PKR)
      </h4>
      <p className="text-xs text-slate-500 mb-3">
        Optional. Rough ranges only (e.g. Rs. 197,050 or Rs. 185,000 – 210,000). Students should always confirm fees on the official website.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            BS Computing / Engineering (per semester)
          </label>
          <input
            type="text"
            value={formData.feeComputingEngSemester}
            onChange={(e) => setFormData({ ...formData, feeComputingEngSemester: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Rs. 185,000 – 210,000"
            maxLength={500}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Business / Social Sciences (per semester)
          </label>
          <input
            type="text"
            value={formData.feeBusinessSocialSemester}
            onChange={(e) => setFormData({ ...formData, feeBusinessSocialSemester: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Rs. 160,000 – 190,000"
            maxLength={500}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Typical BS / general programs (per semester)
          </label>
          <input
            type="text"
            value={formData.feeBsTypicalSemester}
            onChange={(e) => setFormData({ ...formData, feeBsTypicalSemester: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Rs. 650,000 – 720,000"
            maxLength={500}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Medical MBBS (per year)</label>
          <input
            type="text"
            value={formData.feeMbbsPerYear}
            onChange={(e) => setFormData({ ...formData, feeMbbsPerYear: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Rs. 1,760,000 – 2,100,000"
            maxLength={500}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Public — regular seat (per semester)
          </label>
          <input
            type="text"
            value={formData.feePublicRegularSemester}
            onChange={(e) => setFormData({ ...formData, feePublicRegularSemester: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Rs. 25,000 – 40,000"
            maxLength={500}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Public — self-finance (per semester)
          </label>
          <input
            type="text"
            value={formData.feePublicSelfFinanceSemester}
            onChange={(e) => setFormData({ ...formData, feePublicSelfFinanceSemester: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Rs. 65,000 – 90,000"
            maxLength={500}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Add University Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Add New University</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUniversity} className="p-6 space-y-4">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., University of Engineering and Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Lahore"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    HEC Ranking
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hecRanking}
                    onChange={(e) => setFormData({ ...formData, hecRanking: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://www.university.edu.pk"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="info@university.edu.pk"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+92-42-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Established Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 1921"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-lg font-semibold mb-3">Additional Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Street address, City, Province"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description about the university..."
                    />
                  </div>
                </div>
              </div>

              {indicativeFeeFormSection}

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add University
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit University Modal */}
      {showEditModal && editingUniversity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold">Edit University</h3>
              <button
                type="button"
                onClick={resetEditModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUniversity} className="p-6 space-y-4">
              {/* Required Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    University Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., University of Engineering and Technology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Lahore"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    HEC Ranking
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hecRanking}
                    onChange={(e) => setFormData({ ...formData, hecRanking: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>

              {/* Programs for this university */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Programs (this university)
                </h4>
                <p className="text-sm text-slate-500 mb-3">
                  View this university&apos;s programs, add new ones, or remove them below.
                </p>

                {programsLoading ? (
                  <div className="flex items-center gap-2 py-6 text-slate-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading programs…
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 mb-4">
                    {editPrograms.length === 0 ? (
                      <p className="p-4 text-sm text-slate-500">No programs listed yet.</p>
                    ) : (
                      editPrograms.map((p) => (
                        <div
                          key={p._id}
                          className="flex items-start justify-between gap-2 px-3 py-2.5 text-sm hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs text-slate-600">
                              <span className="font-semibold text-purple-700">{p.degree}</span>
                              {p.programGroup ? ` · ${p.programGroup}` : ''}
                              {p.category ? ` · ${p.category}` : ''}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteProgramInModal(p._id, p.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Add a new program</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-600">Program name</label>
                      <input
                        className="w-full mt-0.5 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={newProgram.name}
                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                        placeholder="e.g. BS Computer Science"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Degree</label>
                      <input
                        className="w-full mt-0.5 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={newProgram.degree}
                        onChange={(e) => setNewProgram({ ...newProgram, degree: e.target.value })}
                        placeholder="BS, BBA, LLB…"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Group / faculty</label>
                      <input
                        className="w-full mt-0.5 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={newProgram.programGroup}
                        onChange={(e) => setNewProgram({ ...newProgram, programGroup: e.target.value })}
                        placeholder="Engineering, Computing…"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-600">Category</label>
                      <input
                        className="w-full mt-0.5 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        value={newProgram.category}
                        onChange={(e) => setNewProgram({ ...newProgram, category: e.target.value })}
                        placeholder="Computer Science, Engineering, Business…"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={addingProgram || !newProgram.name.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                    onClick={() => handleAddProgramInModal()}
                  >
                    {addingProgram ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add program
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://www.university.edu.pk"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="info@university.edu.pk"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="+92-42-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Established Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 1921"
                    />
                  </div>
                </div>
              </div>

              {indicativeFeeFormSection}

              {/* Additional Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-lg font-semibold mb-3">Additional Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Street address, City, Province"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description about the university..."
                    />
                  </div>

                  {/* University Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      University Picture
                    </label>
                    <div className="space-y-3">
                      {universityImage && (
                        <div className="relative w-full h-48 border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                          <img
                            key={universityImage.substring(0, 50)} // Force re-render when image changes
                            src={universityImage}
                            alt="University preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Error loading image preview');
                              (e.target as HTMLImageElement).src = '';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <Upload className="w-4 h-4 mr-2 text-slate-600" />
                          <span className="text-sm text-slate-700">
                            {universityImage ? 'Change Picture' : 'Upload Picture'}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {universityImage && (
                          <Button
                            type="button"
                            onClick={() => {
                              setUniversityImage('');
                              setFormData({ ...formData, image: '' });
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Maximum size: 10MB (JPG, PNG only)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="button"
                  onClick={resetEditModal}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="space-y-6" style={{ overflowX: 'hidden' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">University Management</h2>
          <p className="text-slate-600">Manage university listings and information</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New University
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-purple-600 mb-2">{stats.total.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Total Universities</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-blue-600 mb-2">{stats.public.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Public Universities</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-amber-600 mb-2">{stats.private.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Private Universities</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-green-600 mb-2">{stats.totalPrograms.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Total Programs</div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search universities by name, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Universities Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : universities.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <p className="text-slate-600">No universities found</p>
        </div>
      ) : (
        <div className="space-y-3" style={{ overflowX: 'hidden' }}>
          {universities.map((university, index) => {
            return (
          <motion.div
                key={university._id}
                initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {getInitial(universityNameLabel(university.name))}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-base break-words">
                            {universityNameLabel(university.name)}
                          </h3>
                          {university.type && (
                      <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                          university.type === 'Public'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {university.type}
                      </span>
                          )}
                    </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                          {university.city && (
                            <>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{university.city}</span>
                  </div>
                              {university.website && <span>•</span>}
                            </>
                          )}
                          {university.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[200px]">{university.website}</span>
                </div>
                          )}
                  </div>
                  </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button 
                          onClick={() => handleEditClick(university)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg text-sm px-3 py-1.5"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleDelete(university._id)}
                          className="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm px-3 py-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Delete
                        </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
            );
          })}
      </div>
      )}

      {/* Pagination */}
      {!loading && universities.length > 0 && (
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
            Showing <span className="font-medium">{(page - 1) * 10 + 1}-{Math.min(page * 10, total)}</span> of <span className="font-medium">{total.toLocaleString()}</span> universities
        </div>
        <div className="flex gap-2">
            <Button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Previous
          </Button>
            <Button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Next
          </Button>
        </div>
      </div>
      )}
    </div>
    </>
  );
}
