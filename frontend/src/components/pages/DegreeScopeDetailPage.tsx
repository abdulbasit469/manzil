import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Briefcase, DollarSign, TrendingUp, GraduationCap, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { universityNameLabel, stripUnknownUniversityText } from '../../utils/universityDisplay';

interface DegreeScopeDetail {
  _id: string;
  degreeName: string;
  field: string;
  scope: string;
  jobRoles: string[];
  salaryEntry?: string;
  salaryMid?: string;
  trends?: string;
}

interface Program {
  _id: string;
  name: string;
  degree: string;
  duration?: string;
  feePerSemester?: number;
  university?: { _id: string; name: string; city?: string; type?: string };
}

interface DegreeScopeDetailPageProps {
  degreeScopeId: string | null;
  onBack: () => void;
  onPageChange?: (page: string, postId?: string) => void;
}

export function DegreeScopeDetailPage({ degreeScopeId, onBack, onPageChange }: DegreeScopeDetailPageProps) {
  const [detail, setDetail] = useState<DegreeScopeDetail | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    if (!degreeScopeId) return;
    setLoadingDetail(true);
    api.get(`/degree-scope/${degreeScopeId}`)
      .then((res) => setDetail(res.data?.data || null))
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [degreeScopeId]);

  useEffect(() => {
    if (!degreeScopeId) return;
    setLoadingPrograms(true);
    api.get(`/degree-scope/${degreeScopeId}/programs`, { params: { limit: 15 } })
      .then((res) => setPrograms(res.data?.programs || []))
      .catch(() => setPrograms([]))
      .finally(() => setLoadingPrograms(false));
  }, [degreeScopeId]);

  if (!degreeScopeId) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 p-8">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Degree & Career Scope
        </Button>
        <p className="text-slate-600">No degree selected.</p>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 p-8">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-slate-600">Degree scope not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Degree & Career Scope
          </Button>
          <h1 className="text-3xl font-bold">{detail.degreeName}</h1>
          <p className="text-blue-100">{detail.field}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
            <Briefcase className="w-5 h-5 text-amber-600" />
            Scope & Overview
          </h2>
          <p className="text-slate-600 whitespace-pre-line">{detail.scope}</p>
        </Card>

        {detail.jobRoles && detail.jobRoles.length > 0 && (
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              Common Job Roles
            </h2>
            <ul className="flex flex-wrap gap-2">
              {detail.jobRoles.map((role, i) => (
                <li
                  key={i}
                  className="px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700"
                >
                  {role}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {(detail.salaryEntry || detail.salaryMid) && (
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Salary Expectations (Pakistan)
            </h2>
            <div className="space-y-2 text-slate-600">
              {detail.salaryEntry && (
                <p><span className="font-medium text-slate-700">Entry level:</span> {detail.salaryEntry}</p>
              )}
              {detail.salaryMid && (
                <p><span className="font-medium text-slate-700">Mid career:</span> {detail.salaryMid}</p>
              )}
            </div>
          </Card>
        )}

        {detail.trends && (
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Industry Trends & Outlook
            </h2>
            <p className="text-slate-600 whitespace-pre-line">{detail.trends}</p>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            Universities Offering This Degree
          </h2>
          {loadingPrograms ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : programs.length === 0 ? (
            <p className="text-slate-600">
              No programs found in the database for this degree. You can explore all universities and programs from the Universities section.
            </p>
          ) : (
            <ul className="space-y-3">
              {programs.map((prog) => (
                <li
                  key={prog._id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-800">{prog.name} ({prog.degree})</p>
                      <p className="text-sm text-slate-600">
                        {universityNameLabel(prog.university?.name)}
                        {stripUnknownUniversityText(prog.university?.city)
                          ? ` • ${stripUnknownUniversityText(prog.university?.city)}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.('universities')}
                  >
                    View
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            className="mt-4 w-full bg-[#1e3a5f] hover:bg-[#0f1f3a]"
            onClick={() => onPageChange?.('universities')}
          >
            Explore all universities & programs
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
