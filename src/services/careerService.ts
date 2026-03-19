import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const careerService = {
  async matchResume(resume: string, jobDescription: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قارن بين السيرة الذاتية والوصف الوظيفي التاليين باللغة العربية.
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

  async generateCoverLetter(resume: string, jobDescription: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `اكتب خطاب تغطية (Cover Letter) احترافي وعالي التأثير باللغة العربية بناءً على السيرة الذاتية والوصف الوظيفي التاليين.
      
      السيرة الذاتية: ${resume}
      الوصف الوظيفي: ${jobDescription}
      
      يجب أن يكون الخطاب مقنعاً، يبرز المهارات ذات الصلة، وجاهزاً للإرسال.`,
    });
    return response.text;
  },

  async generateInterviewQuestions(jobTitle: string, jobDescription: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `قم بتوليد 5 أسئلة مقابلة محددة وصعبة لمنصب ${jobTitle} باللغة العربية بناءً على هذا الوصف الوظيفي: ${jobDescription}.
      لكل سؤال، قدم فقرة "لماذا نسأل هذا" و "نصيحة للإجابة".
      
      نسق الاستجابة كـ JSON مع مصفوفة من الكائنات، كل منها يحتوي على: question، why، tip.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  }
};
