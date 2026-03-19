import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { careerService } from '../services/careerService';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'matcher' | 'cover-letter' | 'interview'>('overview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const handleMatch = async () => {
    if (!resume || !jobDescription) return;
    setLoading(true);
    try {
      const data = await careerService.matchResume(resume, jobDescription);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetter = async () => {
    if (!resume || !jobDescription) return;
    setLoading(true);
    try {
      const data = await careerService.generateCoverLetter(resume, jobDescription);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterview = async () => {
    if (!jobTitle || !jobDescription) return;
    setLoading(true);
    try {
      const data = await careerService.generateInterviewQuestions(jobTitle, jobDescription);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
            JD
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-lg tracking-tight">CareerPulse</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
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
        "fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600 w-6 h-6" />
            <span className="font-bold text-xl tracking-tight">CareerPulse</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
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
            icon={<MessageSquare className="w-5 h-5" />} 
            label="التحضير للمقابلة" 
            active={activeTab === 'interview'} 
            onClick={() => { setActiveTab('interview'); setResult(null); setIsSidebarOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">خطة برو</p>
            <p className="text-sm text-slate-600 mb-3">فحص ومميزات غير محدودة.</p>
            <button className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              ترقية الآن
            </button>
          </div>
          <Link to="/settings" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <SettingsIcon className="w-5 h-5" />
            الإعدادات
          </Link>
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium mt-1">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden pt-16 md:pt-0">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between">
          <div className="flex items-center gap-4 bg-slate-100 px-3 py-1.5 rounded-lg w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="ابحث في طلباتك..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-200">
              JD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8">
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
                    <h1 className="text-2xl font-bold text-slate-900">مرحباً بعودتك، جون</h1>
                    <p className="text-slate-500">إليك ما يحدث في رحلة بحثك عن عمل.</p>
                  </div>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                    <Plus className="w-4 h-4" /> تحليل جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard title="إجمالي الفحوصات" value="12" change="+3 هذا الأسبوع" icon={<BarChart3 className="text-indigo-600" />} />
                  <StatCard title="متوسط درجة المطابقة" value="78%" change="+5% تحسن" icon={<Zap className="text-amber-600" />} />
                  <StatCard title="الخطابات المولدة" value="8" change="جاهزة للإرسال" icon={<FileText className="text-emerald-600" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">النشاط الأخير</h3>
                    <div className="space-y-4">
                      <ActivityItem title="مهندس برمجيات في جوجل" status="92% مطابقة" date="منذ ساعتين" />
                      <ActivityItem title="مدير منتج في ميتا" status="65% مطابقة" date="أمس" />
                      <ActivityItem title="مطور واجهات في فيرسيل" status="88% مطابقة" date="منذ يومين" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <TrendingUp className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">رؤى مهنية</h3>
                    <p className="text-sm text-slate-500 mb-4">زادت قوة سيرتك الذاتية بنسبة 15% منذ آخر تحديث لك. استمر في ذلك!</p>
                    <button className="text-indigo-600 font-semibold text-sm hover:underline">عرض التقرير المفصل</button>
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
                  <h1 className="text-2xl font-bold text-slate-900">مطابقة السيرة الذاتية والوصف الوظيفي</h1>
                  <p className="text-slate-500">اكتشف مدى ملاءمتك للدور واحصل على نصائح للتحسين.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">سيرتك الذاتية</label>
                    <textarea 
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="الصق نص سيرتك الذاتية هنا..."
                      className="w-full h-64 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">الوصف الوظيفي</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="الصق الوصف الوظيفي هنا..."
                      className="w-full h-64 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
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
                    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4",
                          result.score >= 80 ? "border-emerald-500 text-emerald-600 bg-emerald-50" : 
                          result.score >= 60 ? "border-amber-500 text-amber-600 bg-amber-50" : 
                          "border-red-500 text-red-600 bg-red-50"
                        )}>
                          {result.score}%
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">درجة المطابقة</h3>
                          <p className="text-slate-500">{result.score >= 80 ? 'مطابقة ممتازة!' : result.score >= 60 ? 'مطابقة جيدة، ولكن يمكن أن تكون أفضل.' : 'مطابقة منخفضة. مطلوب تحديثات كبيرة.'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Download className="w-5 h-5" /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-5 h-5" /></button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900">الملخص</h4>
                      <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900">التحسينات الرئيسية</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {result.improvements.map((imp: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-700">{imp}</span>
                          </div>
                        ))}
                      </div>
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
                  <h1 className="text-2xl font-bold text-slate-900">مولد خطابات التغطية بالذكاء الاصطناعي</h1>
                  <p className="text-slate-500">قم بتوليد خطاب تغطية مخصص يبرز أفضل صفاتك.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">سيرتك الذاتية</label>
                    <textarea 
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="الصق نص سيرتك الذاتية هنا..."
                      className="w-full h-64 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">الوصف الوظيفي</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="الصق الوصف الوظيفي هنا..."
                      className="w-full h-64 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
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
                    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="text-xl font-bold text-slate-900">خطاب التغطية المولد</h3>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Download className="w-5 h-5" /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Copy className="w-5 h-5" /></button>
                      </div>
                    </div>
                    <div className="prose prose-slate max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm">
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
                  <h1 className="text-2xl font-bold text-slate-900">التحضير للمقابلة</h1>
                  <p className="text-slate-500">احصل على 5 أسئلة مخصصة بناءً على الوظيفة التي تتقدم لها.</p>
                </div>

                <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">المسمى الوظيفي المستهدف</label>
                    <input 
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="مثلاً: مهندس واجهات أمامية أول"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">الوصف الوظيفي (اختياري ولكن يفضل)</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="الصق الوصف الوظيفي هنا للحصول على أسئلة أفضل..."
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
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
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <h4 className="font-bold text-slate-900">{q.question}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-indigo-600 uppercase mb-2">لماذا نسأل هذا</p>
                            <p className="text-sm text-slate-600">{q.why}</p>
                          </div>
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-600 uppercase mb-2">نصيحة الخبراء</p>
                            <p className="text-sm text-slate-600">{q.tip}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
        active ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{change}</span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ActivityItem({ title, status, date }: { title: string, status: string, date: string }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500">{date}</p>
        </div>
      </div>
      <span className={cn(
        "text-xs font-bold px-2 py-1 rounded-full",
        status.includes('90') ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
      )}>
        {status}
      </span>
    </div>
  );
}
