import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// Initialize GoogleGenAI SDK in JavaScript
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint to generate quiz using Gemini AI
app.post('/api/quiz/generate', async (req, res) => {
  try {
    const { topic, difficulty = 'Medium', count = 5, contextText } = req.body;

    if (!topic && !contextText) {
      return res.status(400).json({ error: 'Topic or reference content is required.' });
    }

    const questionCount = Math.min(Math.max(Number(count) || 5, 3), 15);

    let prompt = `Create an engaging, accurate, educational multiple-choice quiz about "${topic || 'Provided Study Notes'}".
Target difficulty: ${difficulty}.
Total questions: ${questionCount}.

Requirements for each question:
1. Question text must be unambiguous, clear, and thought-provoking.
2. Provide exactly 4 realistic, distinct options. No "All of the above" or "None of the above".
3. Specify the 0-based index of the correct option (0, 1, 2, or 3).
4. Provide a concise, illuminating explanation (2-3 sentences) explaining why the answer is correct and why it matters.
5. Provide a subtle hint that guides thinking without giving away the direct answer.`;

    if (contextText && contextText.trim().length > 0) {
      prompt += `\n\nBase the quiz questions primarily on the following reference material:\n"""\n${contextText.trim().slice(0, 4000)}\n"""`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert pedagogical quizmaster and test-prep designer. You write high quality, fact-checked, engaging quiz questions for students and curious minds.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'An engaging quiz title' },
            description: { type: Type.STRING, description: 'A short 1-2 sentence overview of the quiz' },
            category: { type: Type.STRING, description: 'A suitable category, e.g. JavaScript, Science, Tech, History, Arts, General' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: 'The question text' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Four plausible answer choices',
                  },
                  correctIndex: { type: Type.INTEGER, description: '0-based index of the correct choice (0, 1, 2, or 3)' },
                  explanation: { type: Type.STRING, description: 'Clear pedagogical rationale for the correct answer' },
                  hint: { type: Type.STRING, description: 'A helpful hint' },
                },
                required: ['question', 'options', 'correctIndex', 'explanation', 'hint'],
              },
            },
          },
          required: ['title', 'description', 'category', 'questions'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No output returned from AI model.');
    }

    const parsedData = JSON.parse(text);

    // Format questions with unique IDs
    const formattedQuestions = (parsedData.questions || []).map((q, idx) => ({
      id: `ai-q-${Date.now()}-${idx}`,
      question: q.question,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
      explanation: q.explanation || 'The selected option is the verified fact.',
      hint: q.hint || 'Carefully evaluate each option by process of elimination.',
    }));

    const generatedQuiz = {
      id: `ai-quiz-${Date.now()}`,
      title: parsedData.title || `${topic} Challenge`,
      description: parsedData.description || `Test your knowledge about ${topic}.`,
      category: parsedData.category || 'AI Generated',
      difficulty: difficulty,
      estimatedMinutes: Math.ceil(questionCount * 1.2),
      questions: formattedQuestions,
      iconName: 'Sparkles',
      isCustom: true,
      author: 'Gemini AI Assistant',
    };

    res.json({ quiz: generatedQuiz });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate quiz. Please try again with a different topic.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MindSprint JavaScript server running on http://localhost:${PORT}`);
  });
}

startServer();
