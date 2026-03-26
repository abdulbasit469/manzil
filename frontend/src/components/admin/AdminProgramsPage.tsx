import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Trash2, Edit, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../services/api';
import { toast } from 'sonner';

interface UniRef {
  _id: string;
  name: string;
  city?: string;
}

interface ProgramRow {
  _id: string;
  name: string;
  degree: string;
  duration?: string;
  feePerSemester?: number;
  category?: string;
  programGroup?: string;
  eligibility?: string;
  description?: string;
  university?: UniRef;
}

export function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;
  const [editing, setEditing] = useState<ProgramRow | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/programs', {
        params: {
          page,
          limit,
          search: searchQuery.trim() || undefined,
        },
      });
      if (response.data.success) {
        setPrograms(response.data.programs || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (e: unknown) {
      console.error(e);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchPrograms();
  }, [page, searchQuery]);

  const handleDelete = async (p: ProgramRow) => {
    if (!window.confirm(`Delete program "${p.name}"?`)) return;
    try {
      await api.delete(`/admin/programs/${p._id}`);
      toast.success('Program deleted');
      fetchPrograms();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEdit = (p: ProgramRow) => {
    setEditing({ ...p });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/admin/programs/${editing._id}`, {
        name: editing.name,
        degree: editing.degree,
        duration: editing.duration || '4 years',
        feePerSemester: editing.feePerSemester ?? 0,
        category: editing.category,
        programGroup: editing.programGroup,
        eligibility: editing.eligibility,
        description: editing.description,
      });
      toast.success('Program updated');
      setEditing(null);
      fetchPrograms();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-600" />
            Programs
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            View, edit, or delete programs linked to universities. Use bulk import on the server for large updates.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search program name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : programs.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No programs found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="py-2 pr-3">Program</th>
                    <th className="py-2 pr-3">Degree</th>
                    <th className="py-2 pr-3">Group</th>
                    <th className="py-2 pr-3">University</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/80">
                      <td className="py-3 pr-3 font-medium text-slate-900 max-w-xs">{p.name}</td>
                      <td className="py-3 pr-3 text-slate-700">{p.degree}</td>
                      <td className="py-3 pr-3 text-slate-600 max-w-[140px] truncate">{p.programGroup || '—'}</td>
                      <td className="py-3 pr-3 text-slate-700 max-w-[200px]">
                        <span className="flex items-start gap-1">
                          <GraduationCap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{p.university?.name || '—'}</span>
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{p.category || '—'}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <Button type="button" variant="outline" size="sm" className="mr-2" onClick={() => openEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(p)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>
                Total: {total} — Page {page} of {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((x) => Math.max(1, x - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit program</h3>
            <form onSubmit={saveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Degree</label>
                <input
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2"
                  value={editing.degree}
                  onChange={(e) => setEditing({ ...editing, degree: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Program group (faculty)</label>
                <input
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2"
                  value={editing.programGroup || ''}
                  onChange={(e) => setEditing({ ...editing, programGroup: e.target.value })}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Category</label>
                <input
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2"
                  value={editing.category || ''}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Duration</label>
                <input
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2"
                  value={editing.duration || ''}
                  onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Fee per semester (PKR)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2"
                  value={editing.feePerSemester ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, feePerSemester: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Eligibility</label>
                <textarea
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[60px]"
                  value={editing.eligibility || ''}
                  onChange={(e) => setEditing({ ...editing, eligibility: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Description</label>
                <textarea
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[80px]"
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
