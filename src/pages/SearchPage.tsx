import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  FileText, 
  Zap, 
  ChevronLeft, 
  Loader2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { cn } from '../lib/utils';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ scans: any[], coverLetters: any[] }>({ scans: [], coverLetters: [] });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      try {
        const [scansRes, clRes] = await Promise.all([
          supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .or(`job_title.ilike.%${query}%,job_description.ilike.%${query}%`)
            .order('created_at', { ascending: false }),
          supabase
            .from('cover_letters')
            .select('*')
            .eq('user_id', user.id)
            .or(`job_title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false })
        ]);

        setResults({
          scans: scansRes.data || [],
          coverLetters: clRes.data || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold">نتائج البحث عن: "{query}"</h1>
          </div>
          <div className="relative w-64 md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              defaultValue={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${e.currentTarget.value}`);
                }
              }}
              placeholder="ابحث في تاريخك..."
              className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-500">جاري البحث في سجلاتك...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scans Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                تحليلات السيرة الذاتية ({results.scans.length})
              </h2>
              <div className="space-y-4">
                {results.scans.length > 0 ? (
                  results.scans.map((scan) => (
                    <motion.div 
                      key={scan.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{scan.job_title || 'تحليل غير معنون'}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(scan.created_at).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                          {scan.type === 'matcher' ? 'مطابقة' : 'مقابلة'}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {scan.job_description}
                      </p>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline"
                      >
                        عرض التفاصيل <ChevronLeft className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">لا توجد تحليلات مطابقة.</p>
                )}
              </div>
            </div>

            {/* Cover Letters Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                خطابات التغطية ({results.coverLetters.length})
              </h2>
              <div className="space-y-4">
                {results.coverLetters.length > 0 ? (
                  results.coverLetters.map((cl) => (
                    <motion.div 
                      key={cl.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{cl.job_title || 'خطاب غير معنون'}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(cl.created_at).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                        <FileText className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                        {cl.content}
                      </p>
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline"
                      >
                        عرض الخطاب <ChevronLeft className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">لا توجد خطابات مطابقة.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
