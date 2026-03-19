import React, { useState } from 'react';
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
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api'>('profile');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <Zap className="text-indigo-600 w-6 h-6" />
          <span className="font-bold text-xl tracking-tight">CareerPulse</span>
        </div>
        
        <nav className="flex-grow px-4 space-y-1">
          <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <LayoutDashboard className="w-5 h-5" />
            نظرة عامة
          </Link>
          <Link to="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <SettingsIcon className="w-5 h-5" />
            لوحة التحكم
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium bg-indigo-50 text-indigo-600">
            <SettingsIcon className="w-5 h-5" />
            الإعدادات
            <ChevronLeft className="w-4 h-4 mr-auto" />
          </Link>
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium mt-1">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">الإعدادات</h1>
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
        <div className="flex-grow overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-8 mb-8 border-b border-slate-200">
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
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {activeTab === 'profile' && (
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border border-indigo-200">
                      JD
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">صورة الملف الشخصي</h3>
                      <p className="text-sm text-slate-500 mb-3">تغيير صورتك التي تظهر في لوحة التحكم.</p>
                      <button className="text-sm font-bold text-indigo-600 hover:underline">تحميل صورة جديدة</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">الاسم الكامل</label>
                      <input 
                        type="text" 
                        defaultValue="جون دو" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">البريد الإلكتروني</label>
                      <input 
                        type="email" 
                        defaultValue="john@example.com" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> حفظ التغييرات
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">تغيير كلمة المرور</h3>
                    <p className="text-sm text-slate-500">تأكد من استخدام كلمة مرور قوية وفريدة.</p>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">كلمة المرور الحالية</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">كلمة المرور الجديدة</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">تأكيد كلمة المرور الجديدة</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Lock className="w-4 h-4" /> تحديث كلمة المرور
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">إعدادات مفاتيح API</h3>
                    <p className="text-sm text-slate-500">قم بتكوين مفاتيح API الخاصة بك للوصول إلى ميزات متقدمة.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">تنبيه أمان</p>
                        <p className="text-xs text-amber-800">لا تشارك مفاتيح API الخاصة بك مع أي شخص. سيتم تخزينها بشكل مشفر.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Gemini API Key</label>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          defaultValue="sk-••••••••••••••••••••••••" 
                          className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                        />
                        <button className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">إظهار</button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Stripe Public Key (للمدفوعات)</label>
                      <input 
                        type="text" 
                        placeholder="pk_test_••••••••" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> حفظ الإعدادات
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
        active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
