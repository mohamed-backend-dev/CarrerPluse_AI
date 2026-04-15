import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Key, 
  Save, 
  ArrowRight, 
  Zap, 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronLeft,
  Bell,
  Search,
  Globe,
  Moon,
  Sun,
  Monitor,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { useUserPreferences, Language } from '../context/UserPreferencesContext';
import { supabase } from '../lib/supabaseClient';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api' | 'preferences'>('profile');
  const { theme, setTheme } = useTheme();
  const { preferences, updatePreferences, loading: prefsLoading } = useUserPreferences();
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-50 transition-colors duration-200" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <Zap className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-xl tracking-tight dark:text-white">CareerPulse</span>
        </div>
        
        <nav className="flex-grow px-4 space-y-1">
          <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100">
            <LayoutDashboard className="w-5 h-5" />
            نظرة عامة
          </Link>
          <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100">
            <SettingsIcon className="w-5 h-5" />
            لوحة التحكم
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Link to="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <SettingsIcon className="w-5 h-5" />
            الإعدادات
            <ChevronLeft className="w-4 h-4 mr-auto" />
          </Link>
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium mt-1">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">الإعدادات</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
              {user?.user_metadata?.full_name?.split(' ').map((n: any) => n[0]).join('').toUpperCase().slice(0, 2) || 'JD'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-8 mb-8 border-b border-slate-200 dark:border-slate-800">
              <TabButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={<User className="w-4 h-4" />} 
                label="الملف الشخصي" 
              />
              <TabButton 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')} 
                icon={<Lock className="w-4 h-4" />} 
                label="الأمان" 
              />
              <TabButton 
                active={activeTab === 'api'} 
                onClick={() => setActiveTab('api')} 
                icon={<Key className="w-4 h-4" />} 
                label="مفاتيح API" 
              />
              <TabButton 
                active={activeTab === 'preferences'} 
                onClick={() => setActiveTab('preferences')} 
                icon={<SettingsIcon className="w-4 h-4" />} 
                label="التفضيلات" 
              />
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {activeTab === 'profile' && (
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold border border-indigo-200 dark:border-indigo-800">
                      {user?.user_metadata?.full_name?.split(' ').map((n: any) => n[0]).join('').toUpperCase().slice(0, 2) || 'JD'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">صورة الملف الشخصي</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">تغيير صورتك التي تظهر في لوحة التحكم.</p>
                      <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">تحميل صورة جديدة</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">الاسم الكامل</label>
                      <input 
                        type="text" 
                        defaultValue={user?.user_metadata?.full_name || ""} 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">البريد الإلكتروني</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email || ""} 
                        disabled
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-slate-400 opacity-70"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> حفظ التغييرات
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">تغيير كلمة المرور</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">تأكد من استخدام كلمة مرور قوية وفريدة.</p>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">كلمة المرور الحالية</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">كلمة المرور الجديدة</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">تأكيد كلمة المرور الجديدة</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Lock className="w-4 h-4" /> تحديث كلمة المرور
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">إعدادات مفاتيح API</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">قم بتكوين مفاتيح API الخاصة بك للوصول إلى ميزات متقدمة.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-100">تنبيه أمان</p>
                        <p className="text-xs text-amber-800 dark:text-amber-300">لا تشارك مفاتيح API الخاصة بك مع أي شخص. سيتم تخزينها بشكل مشفر.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gemini API Key</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          defaultValue="sk-••••••••••••••••••••••••" 
                          className="flex-grow p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                        />
                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">إظهار</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Stripe Public Key (للمدفوعات)</label>
                      <input 
                        type="text" 
                        placeholder="pk_test_••••••••" 
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> حفظ الإعدادات
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'preferences' && (
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">تفضيلات المستخدم</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">قم بتخصيص تجربتك في CareerPulse.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Theme Preference */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Moon className="w-4 h-4" /> المظهر (Theme)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => setTheme('light')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            theme === 'light' ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <Sun className="w-5 h-5" />
                          <span className="text-xs font-bold">فاتح</span>
                        </button>
                        <button 
                          onClick={() => setTheme('dark')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            theme === 'dark' ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <Moon className="w-5 h-5" />
                          <span className="text-xs font-bold">داكن</span>
                        </button>
                        <button 
                          onClick={() => setTheme('system')}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                            theme === 'system' ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                        >
                          <Monitor className="w-5 h-5" />
                          <span className="text-xs font-bold">تلقائي</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Language Preference */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> لغة محتوى الذكاء الاصطناعي
                      </label>
                      <select 
                        value={preferences.aiLanguage}
                        onChange={(e) => updatePreferences({ aiLanguage: e.target.value as Language })}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="es">Español</option>
                      </select>
                      <p className="text-xs text-slate-500 dark:text-slate-400">سيتم توليد السير الذاتية وخطابات التغطية بهذه اللغة.</p>
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">إشعارات البريد الإلكتروني</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">تلقي تحديثات حول تحليلاتك عبر البريد.</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferences.emailNotifications}
                          onChange={(e) => updatePreferences({ emailNotifications: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                      disabled={saving}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {saving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2",
        active 
          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
