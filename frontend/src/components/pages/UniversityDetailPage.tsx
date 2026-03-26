import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Building2,
  Award,
  Calendar,
  Loader2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Banknote,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getUniversityImage } from '../../utils/universityImage';
import { universityNameLabel, stripUnknownUniversityText } from '../../utils/universityDisplay';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface University {
  _id: string;
  name: string;
  city: string;
  type: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  facilities?: string[];
  hecRanking?: number;
  establishedYear?: number;
  image?: string;
  logo?: string;
  programCount?: number;
  scrapedSummary?: string;
  scrapedHighlights?: string[];
  scrapedAt?: string;
  scrapedSourceUrl?: string;
  feeComputingEngSemester?: string;
  feeBusinessSocialSemester?: string;
  feeBsTypicalSemester?: string;
  feeMbbsPerYear?: string;
  feePublicRegularSemester?: string;
  feePublicSelfFinanceSemester?: string;
}

interface Program {
  _id: string;
  name: string;
  degree: string;
  duration?: string;
  feePerSemester?: number;
  totalFee?: number;
  eligibility?: string;
  description?: string;
  careerScope?: string;
  category?: string;
  programGroup?: string;
}

interface UniversityDetailPageProps {
  universityId: string | null;
  onBack: () => void;
}

export function UniversityDetailPage({ universityId, onBack }: UniversityDetailPageProps) {
  const { isAuthenticated } = useAuth();
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingUni, setLoadingUni] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!universityId) return;
    setLoadingUni(true);
    api
      .get(`/universities/${universityId}`)
      .then((res) => setUniversity(res.data?.university || null))
      .catch(() => {
        setUniversity(null);
        toast.error('Could not load university.');
      })
      .finally(() => setLoadingUni(false));
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;
    setLoadingPrograms(true);
    api
      .get(`/universities/${universityId}/programs`)
      .then((res) => setPrograms(res.data?.programs || []))
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));
  }, [universityId]);

  useEffect(() => {
    if (!isAuthenticated || !universityId) return;
    api
      .get(`/saved-universities/check/${universityId}`)
      .then((res) => setSaved(!!res.data?.isSaved))
      .catch(() => setSaved(false));
  }, [isAuthenticated, universityId]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save universities.');
      return;
    }
    if (!universityId) return;
    setSaving(true);
    try {
      if (saved) {
        await api.delete(`/saved-universities/${universityId}`);
        setSaved(false);
        toast.success('Removed from saved');
      } else {
        await api.post('/saved-universities', { universityId });
        setSaved(true);
        toast.success('Saved to your list');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Could not update saved list');
    } finally {
      setSaving(false);
    }
  };

  const openOfficialSite = () => {
    if (!university?.website?.trim()) {
      toast.info('Official website link is not set for this university.');
      return;
    }
    let url = university.website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!universityId) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Universities
        </Button>
        <p className="text-slate-600">No university selected.</p>
      </div>
    );
  }

  if (loadingUni) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!university) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Universities
        </Button>
        <p className="text-slate-600">University not found.</p>
      </div>
    );
  }

  const hero = getUniversityImage(university);
  const scrapedDate = university.scrapedAt
    ? new Date(university.scrapedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const indicativeFeeRows = [
    { label: 'BS Computing / Engineering (per semester)', value: university.feeComputingEngSemester },
    { label: 'Business / Social Sciences (per semester)', value: university.feeBusinessSocialSemester },
    { label: 'Typical BS / general programs (per semester)', value: university.feeBsTypicalSemester },
    { label: 'Medical MBBS (per year)', value: university.feeMbbsPerYear },
    { label: 'Public — regular seat (per semester)', value: university.feePublicRegularSemester },
    { label: 'Public — self-finance (per semester)', value: university.feePublicSelfFinanceSemester },
  ].filter((row) => row.value?.trim());

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-12">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Universities
        </Button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative h-52 md:h-64 rounded-xl overflow-hidden mb-6 shadow-lg">
            <img
              src={hero}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <span className="inline-block text-xs font-semibold bg-white/20 backdrop-blur text-white px-2.5 py-1 rounded-md mb-2">
                {university.type || 'University'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
                {universityNameLabel(university.name)}
              </h1>
              {stripUnknownUniversityText(university.city) && (
                <p className="text-white/90 flex items-center gap-2 mt-1 text-sm md:text-base">
                  <MapPin className="w-4 h-4" />
                  {stripUnknownUniversityText(university.city)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              onClick={openOfficialSite}
              variant="outline"
              className="border-slate-300"
              disabled={!university.website?.trim()}
            >
              <Globe className="w-4 h-4 mr-2" />
              Official website
              <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
            </Button>
            <Button
              onClick={toggleSave}
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? 'Saved ✓' : 'Save university'}
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {university.hecRanking != null && (
              <Card className="p-4 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">HEC ranking</p>
                  <p className="text-lg font-semibold text-slate-800">#{university.hecRanking}</p>
                </div>
              </Card>
            )}
            {university.establishedYear != null && (
              <Card className="p-4 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Established</p>
                  <p className="text-lg font-semibold text-slate-800">{university.establishedYear}</p>
                </div>
              </Card>
            )}
            <Card className="p-4 flex items-start gap-3 sm:col-span-2">
              <GraduationCap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Programs in Manzil</p>
                <p className="text-lg font-semibold text-slate-800">
                  {loadingPrograms ? 'Loading…' : `${programs.length} program${programs.length !== 1 ? 's' : ''} listed`}
                </p>
              </div>
            </Card>
          </div>

          {indicativeFeeRows.length > 0 && (
            <Card className="p-5 mb-6 border-amber-100 bg-white">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <Banknote className="w-5 h-5 text-amber-600" />
                Indicative fee ranges (PKR)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Approximate ranges for planning only. Programs and quotas differ — always confirm current fees on the
                official website.
              </p>
              <dl className="space-y-3 text-sm">
                {indicativeFeeRows.map((row) => (
                  <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3 sm:items-baseline border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                    <dt className="text-slate-500 sm:w-[min(100%,14rem)] shrink-0">{row.label}</dt>
                    <dd className="font-medium text-slate-800">{row.value?.trim()}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          {(university.email || university.phone || university.address) && (
            <Card className="p-5 mb-6">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
                <Building2 className="w-5 h-5 text-amber-600" />
                Contact
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                {university.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${university.email}`} className="text-blue-600 hover:underline">
                      {university.email}
                    </a>
                  </li>
                )}
                {university.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{university.phone}</span>
                  </li>
                )}
                {university.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{university.address}</span>
                  </li>
                )}
              </ul>
            </Card>
          )}

          {university.description?.trim() && (
            <Card className="p-5 mb-6">
              <h2 className="font-semibold text-slate-800 mb-2">About</h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{university.description}</p>
            </Card>
          )}

          {(university.scrapedSummary || (university.scrapedHighlights && university.scrapedHighlights.length > 0)) && (
            <Card className="p-5 mb-6 border-amber-200/80 bg-amber-50/40">
              <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                From official website
                {scrapedDate && (
                  <span className="text-xs font-normal text-slate-500 ml-1">(snapshot {scrapedDate})</span>
                )}
              </h2>
              {university.scrapedSummary && (
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                  {university.scrapedSummary}
                </p>
              )}
              {university.scrapedHighlights && university.scrapedHighlights.length > 0 && (
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {university.scrapedHighlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-500 mt-3">
                This text was captured automatically for your convenience. Always confirm admissions, fees, and deadlines
                on the university&apos;s official site.
              </p>
            </Card>
          )}

          {university.facilities && university.facilities.length > 0 && (
            <Card className="p-5 mb-6">
              <h2 className="font-semibold text-slate-800 mb-3">Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {university.facilities.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5 mb-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              Programs offered (Manzil database)
            </h2>
            {loadingPrograms ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : programs.length === 0 ? (
              <p className="text-slate-600 text-sm">
                No programs are listed yet for this university in Manzil. Ask your admin to add programs, or check the
                official website for the latest offerings.
              </p>
            ) : (
              <ul className="space-y-3">
                {programs.map((p) => (
                  <li
                    key={p._id}
                    className="border border-slate-200 rounded-lg p-4 bg-white hover:border-amber-300 transition-colors"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        {p.programGroup && (
                          <p className="text-xs text-slate-500 mt-0.5">{p.programGroup}</p>
                        )}
                      </div>
                      <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded shrink-0">
                        {p.degree}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                      {p.duration && <span>Duration: {p.duration}</span>}
                      {p.feePerSemester != null && (
                        <span>Fee / semester: PKR {p.feePerSemester.toLocaleString()}</span>
                      )}
                      {p.category && <span>{p.category}</span>}
                    </div>
                    {p.eligibility && (
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Eligibility: </span>
                        {p.eligibility}
                      </p>
                    )}
                    {p.description && (
                      <p className="mt-2 text-sm text-slate-700 line-clamp-3">{p.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
