import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const getLanguageName = (lang: string) => {
  const names: Record<string, string> = {
    ar: 'العربية',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español'
  };
  return names[lang] || 'العربية';
};

export const careerService = {
  async matchResume(resume: string, jobDescription: string, language: string = 'ar') {
    const langName = getLanguageName(language);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قارن بين السيرة الذاتية والوصف الوظيفي التاليين باللغة ${langName}.
      قدم درجة مطابقة (0-100)، وملخصاً موجزاً للمطابقة، و3 مجالات رئيسية للتحسين.
      
      السيرة الذاتية: ${resume}
      الوصف الوظيفي: ${jobDescription}
      
      نسق الاستجابة كـ JSON بالمفاتيح التالية: score (رقم)، summary (نص)، improvements (مصفوفة نصوص).`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async generateCoverLetter(resume: string, jobDescription: string, language: string = 'ar') {
    const langName = getLanguageName(language);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `اكتب خطاب تغطية (Cover Letter) احترافي وعالي التأثير باللغة ${langName} بناءً على السيرة الذاتية والوصف الوظيفي التاليين.
      
      السيرة الذاتية: ${resume}
      الوصف الوظيفي: ${jobDescription}
      
      يجب أن يكون الخطاب مقنعاً، يبرز المهارات ذات الصلة، وجاهزاً للإرسال.`,
    });
    return response.text;
  },

  async generateInterviewQuestions(jobTitle: string, jobDescription: string, language: string = 'ar') {
    const langName = getLanguageName(language);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بتوليد 5 أسئلة مقابلة محددة وصعبة لمنصب ${jobTitle} باللغة ${langName} بناءً على هذا الوصف الوظيفي: ${jobDescription}.
      لكل سؤال، قدم فقرة "لماذا نسأل هذا" و "نصيحة للإجابة".
      
      نسق الاستجابة كـ JSON مع مصفوفة من الكائنات، كل منها يحتوي على: question، why، tip.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  },

  async searchJobs(query: string, level: string, location: string, country: string, language: string = 'ar') {
    const langName = getLanguageName(language);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بتوليد 6 وظائف وهمية ولكن واقعية بناءً على المعايير التالية باللغة ${langName}:
      المسمى الوظيفي: ${query}
      المستوى: ${level}
      الموقع: ${location}
      الدولة: ${country}
      
      لكل وظيفة، قدم: title، company، location، type (مثل 'Full-time', 'Remote')، description، link (رابط وهمي).
      
      نسق الاستجابة كـ JSON مع مصفوفة من الكائنات، كل منها يحتوي على: title، company، location، type، description، link.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  },

  async tailorResume(resume: string, jobDescription: string, language: string = 'ar') {
    const langName = getLanguageName(language);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بإعادة صياغة نقاط السيرة الذاتية التالية لتناسب الوصف الوظيفي المحدد بشكل مثالي باللغة ${langName}.
      ركز على الكلمات المفتاحية والمهارات المطلوبة في الوصف الوظيفي.
      
      السيرة الذاتية: ${resume}
      الوصف الوظيفي: ${jobDescription}
      
      يجب أن تكون النتيجة سيرة ذاتية محسنة وجاهزة للاستخدام.`,
    });
    return response.text;
  }
};
