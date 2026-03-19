import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  ArrowLeft,
  Zap,
  Shield,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans" dir="rtl">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">CareerPulse AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">المميزات</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">الأسعار</a>
          <Link to="/login" className="hover:text-indigo-600 transition-colors">تسجيل الدخول</Link>
          <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-all">
            ابدأ الآن
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
            تطوير مهني مدعوم بالذكاء الاصطناعي
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            الحصول على وظيفة أحلامك <br />
            <span className="text-indigo-600">أصبح الآن أكثر ذكاءً.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            قم بتحسين سيرتك الذاتية، وتوليد خطابات تغطية مخصصة، واجتياز المقابلات باستخدام المساعد المهني الأكثر تقدماً في العالم.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2">
              عزز مسيرتي المهنية <ArrowLeft className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all">
              شاهد العرض التجريبي
            </button>
          </div>
        </motion.div>

        {/* Hero Image / UI Preview Placeholder */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full -z-10" />
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 md:p-8 max-w-5xl mx-auto overflow-hidden">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
               <div className="w-3 h-3 rounded-full bg-red-400" />
               <div className="w-3 h-3 rounded-full bg-amber-400" />
               <div className="w-3 h-3 rounded-full bg-emerald-400" />
               <div className="mr-4 h-6 w-48 bg-slate-100 rounded-md" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="col-span-2 space-y-4">
                 <div className="h-40 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm italic">
                   تحليل السيرة الذاتية قيد التنفيذ...
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 bg-indigo-50/50 rounded-xl border border-indigo-100" />
                   <div className="h-24 bg-emerald-50/50 rounded-xl border border-emerald-100" />
                 </div>
               </div>
               <div className="space-y-4">
                 <div className="h-full bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="w-full h-4 bg-slate-200 rounded mb-4" />
                    <div className="w-3/4 h-4 bg-slate-200 rounded mb-4" />
                    <div className="w-1/2 h-4 bg-slate-200 rounded" />
                 </div>
               </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">كل ما تحتاجه للنجاح</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">تم تصميم أدواتنا من قبل خبراء التوظيف لمنحك ميزة تنافسية في سوق العمل اليوم.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileText className="w-6 h-6 text-indigo-600" />}
              title="مطابق السيرة الذاتية"
              description="ارفع سيرتك الذاتية والوصف الوظيفي لترى مدى مطابقتك. احصل على ملاحظات قابلة للتنفيذ لتجاوز أنظمة تتبع المتقدمين (ATS)."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-indigo-600" />}
              title="مولد خطابات التغطية"
              description="توقف عن كتابة خطابات عامة. يقوم ذكاؤنا الاصطناعي بصياغة خطابات تغطية مخصصة وعالية التحويل لكل طلب وظيفة."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-indigo-600" />}
              title="التحضير للمقابلات"
              description="احصل على 5 أسئلة مقابلة مخصصة بناءً على المسمى الوظيفي والوصف، مع نصائح حول كيفية الإجابة عليها."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">أسعار بسيطة وشفافة</h2>
            <p className="text-slate-600">اختر الخطة المناسبة لمرحلتك المهنية.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              title="مجاني"
              price="0"
              features={["3 عمليات فحص للسيرة الذاتية", "1 خطاب تغطية", "نصائح أساسية للمقابلات"]}
              buttonText="ابدأ مجاناً"
              link="/dashboard"
            />
            <PricingCard 
              title="برو"
              price="19"
              features={["عمليات فحص غير محدودة", "خطابات تغطية غير محدودة", "تحضير كامل للمقابلات", "دعم ذو أولوية"]}
              highlighted={true}
              buttonText="احصل على برو"
              link="/dashboard"
            />
            <PricingCard 
              title="فريق"
              price="99"
              features={["حتى 10 مستخدمين", "لوحة تحكم للفريق", "وصول للواجهة البرمجية", "مدير حساب مخصص"]}
              buttonText="اتصل بالمبيعات"
              link="/dashboard"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-400 w-6 h-6" />
            <span className="font-bold text-xl">CareerPulse AI</span>
          </div>
          <div className="flex gap-8 text-slate-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-white transition-colors">شروط الخدمة</a>
            <a href="#" className="hover:text-white transition-colors">اتصل بنا</a>
          </div>
          <p className="text-slate-500 text-sm">© 2026 CareerPulse AI. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
      <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, features, highlighted = false, buttonText, link }: { title: string, price: string, features: string[], highlighted?: boolean, buttonText: string, link: string }) {
  return (
    <div className={cn(
      "p-8 rounded-2xl border flex flex-col",
      highlighted ? "bg-slate-900 border-slate-800 text-white shadow-2xl scale-105 z-10" : "bg-white border-slate-200 text-slate-900"
    )}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className={highlighted ? "text-slate-400" : "text-slate-500"}>/شهرياً</span>
      </div>
      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle className={cn("w-4 h-4", highlighted ? "text-indigo-400" : "text-indigo-600")} />
            <span className={highlighted ? "text-slate-300" : "text-slate-600"}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to={link} className={cn(
        "w-full py-3 rounded-xl font-semibold text-center transition-all",
        highlighted ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
      )}>
        {buttonText}
      </Link>
    </div>
  );
}
