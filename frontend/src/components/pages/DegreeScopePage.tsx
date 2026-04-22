import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { TrendingUp, ArrowRight, Briefcase, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

const FIELDS = ['All', 'Medical', 'Engineering', 'Computer Science', 'Business', 'Arts', 'Social Sciences', 'Other'];

interface DegreeScopeItem {
  _id: string;
  degreeName: string;
  field: string;
  scope: string;
  jobRoles: string[];
  salaryEntry?: string;
  salaryMid?: string;
  trends?: string;
}

interface DegreeScopePageProps {
  onPageChange?: (page: string, postId?: string) => void;
}

export function DegreeScopePage({ onPageChange }: DegreeScopePageProps) {
  const [list, setList] = useState<DegreeScopeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldFilter, setFieldFilter] = useState('All');
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const fetchList = () => {
    const params = fieldFilter === 'All' ? {} : { field: fieldFilter };
    return api.get('/degree-scope', { params })
      .then((res) =>
        setList(
          (res.data?.data || []).filter(
            (item: DegreeScopeItem) => item.degreeName.trim().toUpperCase() !== 'MBA'
          )
        )
      )
      .catch(() => setList([]));
  };

  useEffect(() => {
    setLoading(true);
    fetchList().finally(() => setLoading(false));
  }, [fieldFilter]);

  const handleLoadSampleData = async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      await api.post('/degree-scope/seed');
      setLoading(true);
      await fetchList();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Backend not reachable. Is the server running on port 5000?';
      setSeedError(String(msg));
    } finally {
      setSeeding(false);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2 flex items-center gap-2">
              <TrendingUp className="w-10 h-10" />
              Degree & Career Scope
            </h1>
            <p className="text-blue-100">
              Explore job market scope, salary expectations, and industry trends for different degrees in Pakistan.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {FIELDS.map((f) => (
            <button
              key={f}
              onClick={() => setFieldFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                fieldFilter === f
                  ? 'bg-[#1e3a5f] text-white shadow'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#1e3a5f] hover:text-[#1e3a5f]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
          </div>
        ) : list.length === 0 ? (
          <Card className="p-12 text-center text-slate-600">
            <p className="mb-4">No degree scope entries found. Load sample data to see degrees and career scope.</p>
            <Button
              onClick={handleLoadSampleData}
              disabled={seeding}
              className="bg-[#1e3a5f] hover:bg-[#0f1f3a]"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Loading…
                </>
              ) : (
                'Load sample data'
              )}
            </Button>
            {seedError && (
              <p className="mt-4 text-sm text-red-600">{seedError}</p>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 h-full flex flex-col hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{item.degreeName}</h3>
                      <p className="text-xs text-slate-500">{item.field}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3 flex-1 mb-4">{item.scope}</p>
                  <Button
                    onClick={() => onPageChange?.('degree-scope-detail', item._id)}
                    className="w-full bg-[#1e3a5f] hover:bg-[#0f1f3a]"
                  >
                    View scope & programs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
