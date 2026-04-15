import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Zap, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronLeft,
  Search,
  Bell,
  User,
  Plus,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Download,
  TrendingUp,
  Briefcase,
  Menu,
  X,
  Globe,
  MapPin,
  Building2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { careerService } from '../services/careerService';
import { cn } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const { preferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<'overview' | 'matcher' | 'cover-letter' | 'interview' | 'job-search'>('overview');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ scans: 0, avgMatch: 0, letters: 0 });

  // Job Search states
  const [jobQuery, setJobQuery] = useState('');
  const [jobLevel, setJobLevel] = useState('Entry');
  const [jobLocation, setJobLocation] = useState('');
  const [jobCountry, setJobCountry] = useState('Egypt');
  const [jobResults, setJobResults] = useState<any[]>([]);
  const [searchingJobs, setSearchingJobs] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  interface Activity {
    id: string;
    title: string;
    status: string;
    created_at: string;
    type: string;
  }

  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'تحليل جديد جاهز', message: 'تم الانتهاء من تحليل سيرتك الذاتية لمهندس برمجيات.', time: 'منذ 5 دقائق' },
    { id: 2, title: 'تحديث النظام', message: 'تم إضافة ميزات جديدة لنموذج الذكاء الاصطناعي.', time: 'منذ ساعة' },
  ];

  const getInitials = (fullName: string) => {
    if (!fullName) return 'JD';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'مستخدم';
  const initials = getInitials(user?.user_metadata?.full_name || displayName);

  // Form states
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch stats and activities in parallel
      const [scansRes, activitiesRes] = await Promise.all([
        supabase.from('scans').select('*', { count: 'exact' }).eq('user_id', userId),
        supabase.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ]);

      if (scansRes.data) {
        const scans = scansRes.data;
        const totalScans = scansRes.count || 0;
        const matches = scans.filter(s => s.type === 'matcher');
        const letters = scans.filter(s => s.type === 'cover-letter').length;
        const avgMatch = matches.length > 0 
          ? Math.round(matches.reduce((acc, curr) => acc + (curr.score || 0), 0) / matches.length) 
          : 0;
        
        setStats({ scans: totalScans, avgMatch, letters });
      }

      if (activitiesRes.data) {
        setActivities(activitiesRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setFetching(false);
      return;
    }
    
    const initDashboard = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUser(user);
        await fetchDashboardData(user.id);
      } catch (err) {
        console.error('Error initializing dashboard:', err);
      } finally {
        setFetching(false);
      }
    };

    initDashboard();
  }, [navigate]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    // Subscribe to real-time changes for scans, activities, and cover_letters
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchDashboardData(user.id)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchDashboardData(user.id)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cover_letters',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchDashboardData(user.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const saveResult = async (type: string, analysisResult: any) => {
    if (!user) return;
    try {
      const timestamp = new Date().toISOString();

      // 1. Save to resumes table (historical record)
      const { error: resumeError } = await supabase.from('resumes').insert({
        user_id: user.id,
        resume_text: resume,
        job_description: jobDescription,
        job_title: jobTitle,
        analysis_result: analysisResult,
        type: type,
        created_at: timestamp
      });
      if (resumeError) throw resumeError;

      // 2. Save to scans table for stats (as requested)
      const { error: scanError } = await supabase.from('scans').insert({
        user_id: user.id,
        type: type,
        score: type === 'matcher' ? analysisResult.score : null,
        created_at: timestamp
      });
      if (scanError) throw scanError;

      // 3. Save to cover_letters table specifically if it's a cover letter
      if (type === 'cover-letter') {
        const { error: clError } = await supabase.from('cover_letters').insert({
          user_id: user.id,
          job_title: jobTitle,
          content: typeof analysisResult === 'string' ? analysisResult : (analysisResult.text || JSON.stringify(analysisResult)),
          created_at: timestamp
        });
        if (clError) throw clError;
      }

      // 4. Save to activities table for recent activity feed
      const activityTitle = type === 'matcher' ? `تحليل مطابقة: ${jobTitle || 'وظيفة جديدة'}` : 
                           type === 'cover-letter' ? `إنشاء خطاب تغطية: ${jobTitle || 'وظيفة جديدة'}` :
                           `تحضير مقابلة: ${jobTitle || 'وظيفة جديدة'}`;
      
      const activityStatus = type === 'matcher' ? `مطابقة ${analysisResult.score}%` : 'تم التوليد';

      const { error: activityError } = await supabase.from('activities').insert({
        user_id: user.id,
        title: activityTitle,
        status: activityStatus,
        type: type,
        created_at: timestamp
      });
      if (activityError) throw activityError;

      // Refresh dashboard data immediately to update counters
      await fetchDashboardData(user.id);
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleMatch = async () => {
    if (!resume || !jobDescription) return;
    setLoading(true);
    setError(null);
    try {
      const data = await careerService.matchResume(resume, jobDescription, preferences.aiLanguage);
      setResult(data);
      await saveResult('matcher', data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تحليل السيرة الذاتية. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!resume || !jobDescription) return;
    setLoading(true);
    setError(null);
    try {
      const data = await careerService.generateCoverLetter(resume, jobDescription, preferences.aiLanguage);
      setResult(data);
      await saveResult('cover-letter', { text: data });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إنشاء خطاب التغطية. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const handleInterview = async () => {
    if (!jobTitle || !jobDescription) return;
    setLoading(true);
    setError(null);
    try {
      const data = await careerService.generateInterviewQuestions(jobTitle, jobDescription, preferences.aiLanguage);
      setResult(data);
      await saveResult('interview', data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء توليد الأسئلة. يرجى التحقق من اتصالك بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleJobSearch = async () => {
    if (!jobQuery) return;
    setSearchingJobs(true);
    try {
      const jobs = await careerService.searchJobs(jobQuery, jobLevel, jobLocation, jobCountry, preferences.aiLanguage);
      setJobResults(jobs);
    } catch (err) {
      console.error('Job search error:', err);
    } finally {
      setSearchingJobs(false);
    }
  };

  const handleTailorResume = async (jobDesc: string) => {
    if (!resume) {
      setError('يرجى لصق سيرتك الذاتية أولاً في تبويب "مطابق السيرة الذاتية"');
      return;
    }
    setLoading(true);
    setActiveTab('matcher');
    try {
      const tailored = await careerService.tailorResume(resume, jobDesc, preferences.aiLanguage);
      setResult({ ...result, tailoredResume: tailored });
    } catch (err) {
      console.error('Tailor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple toast or feedback could be added here
  };

  const handleDownloadPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: preferences.theme === 'dark' ? '#0f172a' : '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-50 transition-colors duration-200" dir="rtl">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
            {initials}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-sm dark:text-white">التنبيهات</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-lg tracking-tight">CareerPulse</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Backdrop Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Sidebar / Drawer */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600 w-6 h-6" />
            <span className="font-bold text-xl tracking-tight dark:text-white">JOBhunter</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-grow px-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="نظرة عامة" 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setResult(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<BarChart3 className="w-5 h-5" />} 
            label="مطابق السيرة الذاتية" 
            active={activeTab === 'matcher'} 
            onClick={() => { setActiveTab('matcher'); setResult(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<FileText className="w-5 h-5" />} 
            label="خطاب التغطية" 
            active={activeTab === 'cover-letter'} 
            onClick={() => { setActiveTab('cover-letter'); setResult(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Globe className="w-5 h-5" />} 
            label="البحث عن وظائف" 
            active={activeTab === 'job-search'} 
            onClick={() => { setActiveTab('job-search'); setResult(null); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="التحضير للمقابلة" 
            active={activeTab === 'interview'} 
            onClick={() => { setActiveTab('interview'); setResult(null); setIsSidebarOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">خطة برو</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">فحص ومميزات غير محدودة.</p>
            <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              ترقية الآن
            </button>
          </div>
          <Link to="/settings" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100">
            <SettingsIcon className="w-5 h-5" />
            الإعدادات
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium mt-1"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden pt-16 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 items-center justify-between">
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearch) {
                  navigate(`/search?q=${globalSearch}`);
                }
              }}
              placeholder="ابحث في تاريخك..." 
              className="bg-transparent border-none outline-none text-sm w-full dark:text-slate-100" 
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-sm dark:text-white">التنبيهات</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                          <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 text-center border-t border-slate-100 dark:border-slate-800">
                      <button className="text-xs font-bold text-indigo-600 hover:underline">عرض الكل</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8">
          {fetching ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-slate-500 font-medium">جاري تحميل بياناتك...</p>
            </div>
          ) : (
            <>
              {!isSupabaseConfigured && (
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">تنبيه: لم يتم إعداد Supabase</p>
                    <p className="text-xs opacity-90">يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في الإعدادات لتفعيل حفظ البيانات والمصادقة.</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">حدث خطأ</p>
                    <p className="text-xs opacity-90">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="mr-auto text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مرحباً بعودتك، {displayName}</h1>
                        <p className="text-slate-500 dark:text-slate-400">إليك ما يحدث في رحلة بحثك عن عمل.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('matcher')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> تحليل جديد
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatCard title="إجمالي الفحوصات" value={stats.scans.toString()} change="محدث الآن" icon={<BarChart3 className="text-indigo-600" />} />
                      <StatCard title="متوسط درجة المطابقة" value={`${stats.avgMatch}%`} change="بناءً على تحليلاتك" icon={<Zap className="text-amber-600" />} />
                      <StatCard title="الخطابات المولدة" value={stats.letters.toString()} change="جاهزة للإرسال" icon={<FileText className="text-emerald-600" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">النشاط الأخير</h3>
                        <div className="space-y-4">
                          {activities.length > 0 ? (
                            activities.map((activity, idx) => (
                              <ActivityItem 
                                key={activity.id || idx}
                                title={activity.title} 
                                status={activity.status} 
                                date={new Date(activity.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })} 
                              />
                            ))
                          ) : (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                              <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p>لا يوجد نشاط أخير بعد.</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                          <TrendingUp className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">رؤى مهنية</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">زادت قوة سيرتك الذاتية بنسبة 15% منذ آخر تحديث لك. استمر في ذلك!</p>
                        <button className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline">عرض التقرير المفصل</button>
                      </div>
                    </div>
                  </motion.div>
                )}

            {activeTab === 'matcher' && (
              <motion.div 
                key="matcher"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مطابقة السيرة الذاتية والوصف الوظيفي</h1>
                  <p className="text-slate-500 dark:text-slate-400">اكتشف مدى ملاءمتك للدور واحصل على نصائح للتحسين.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">سيرتك الذاتية</label>
                    <textarea 
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="الصق نص سيرتك الذاتية هنا..."
                      className="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">الوصف الوظيفي</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="الصق الوصف الوظيفي هنا..."
                      className="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={handleMatch}
                    disabled={loading || !resume || !jobDescription}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    تحليل المطابقة
                  </button>
                </div>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4",
                          result.score >= 80 ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                          result.score >= 60 ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" : 
                          "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {result.score}%
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">درجة المطابقة</h3>
                          <p className="text-slate-500 dark:text-slate-400">{result.score >= 80 ? 'مطابقة ممتازة!' : result.score >= 60 ? 'مطابقة جيدة، ولكن يمكن أن تكون أفضل.' : 'مطابقة منخفضة. مطلوب تحديثات كبيرة.'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownloadPDF('matcher-result', `CV-Analysis-${jobTitle || 'result'}`)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div id="matcher-result" className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-white">الملخص</h4>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.summary}</p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-white">التحسينات الرئيسية</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {result.improvements.map((imp: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-700 dark:text-slate-300">{imp}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {result.tailoredResume && (
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            السيرة الذاتية المحسنة
                          </h4>
                          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              {result.tailoredResume}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'cover-letter' && (
              <motion.div 
                key="cover-letter"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مولد خطابات التغطية بالذكاء الاصطناعي</h1>
                  <p className="text-slate-500 dark:text-slate-400">قم بتوليد خطاب تغطية مخصص يبرز أفضل صفاتك.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">سيرتك الذاتية</label>
                    <textarea 
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="الصق نص سيرتك الذاتية هنا..."
                      className="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">الوصف الوظيفي</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="الصق الوصف الوظيفي هنا..."
                      className="w-full h-64 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={handleCoverLetter}
                    disabled={loading || !resume || !jobDescription}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    توليد الخطاب
                  </button>
                </div>

                {result && typeof result === 'string' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">خطاب التغطية المولد</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDownloadPDF('cl-result', `Cover-Letter-${jobTitle || 'result'}`)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleCopy(result)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div id="cl-result" className="prose prose-slate dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                        {result}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'interview' && (
              <motion.div 
                key="interview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">التحضير للمقابلة</h1>
                  <p className="text-slate-500 dark:text-slate-400">احصل على 5 أسئلة مخصصة بناءً على الوظيفة التي تتقدم لها.</p>
                </div>

                <div className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">المسمى الوظيفي المستهدف</label>
                    <input 
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="مثلاً: مهندس واجهات أمامية أول"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">الوصف الوظيفي (اختياري ولكن يفضل)</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="الصق الوصف الوظيفي هنا للحصول على أسئلة أفضل..."
                      className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={handleInterview}
                      disabled={loading || !jobTitle}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                      توليد الأسئلة
                    </button>
                  </div>
                </div>

                {result && Array.isArray(result) && (
                  <div className="space-y-6">
                    {result.map((q, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{q.question}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">لماذا نسأل هذا</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{q.why}</p>
                          </div>
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">نصيحة الخبراء</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{q.tip}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'job-search' && (
              <motion.div 
                key="job-search"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">محرك البحث عن وظائف بالذكاء الاصطناعي</h1>
                  <p className="text-slate-500 dark:text-slate-400">ابحث عن فرصتك التالية في أي مكان في العالم.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">المسمى الوظيفي</label>
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          value={jobQuery}
                          onChange={(e) => setJobQuery(e.target.value)}
                          placeholder="مثلاً: مطور React"
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">المستوى</label>
                      <select 
                        value={jobLevel}
                        onChange={(e) => setJobLevel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option>Entry</option>
                        <option>Mid-level</option>
                        <option>Senior</option>
                        <option>Lead</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">الموقع / الدولة</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={jobLocation}
                          onChange={(e) => setJobLocation(e.target.value)}
                          placeholder="المدينة"
                          className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input 
                          type="text" 
                          value={jobCountry}
                          onChange={(e) => setJobCountry(e.target.value)}
                          placeholder="الدولة"
                          className="w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={handleJobSearch}
                        disabled={searchingJobs || !jobQuery}
                        className="w-full bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {searchingJobs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        بحث
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobResults.map((job, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                          <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{job.company} • {job.location}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <a 
                          href={job.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                          المصدر <ExternalLink className="w-3 h-3" />
                        </a>
                        <button 
                          onClick={() => handleTailorResume(job.description)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                        >
                          <Sparkles className="w-3 h-3" /> تفصيل السيرة
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
        active 
          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      {icon}
      {label}
      {active && <ChevronLeft className="w-4 h-4 mr-auto" />}
    </button>
  );
}

function StatCard({ title, value, change, icon }: { title: string, value: string, change: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          {icon}
        </div>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">{change}</span>
      </div>
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  status: string;
  date: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ title, status, date }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{date}</p>
        </div>
      </div>
      <span className={cn(
        "text-xs font-bold px-2 py-1 rounded-full",
        status.includes('90') ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" : "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
      )}>
        {status}
      </span>
    </div>
  );
}
