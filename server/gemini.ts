import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function askProjectAssistant(params: {
  projectTitle: string;
  category: string;
  techStack: string[];
  problemStatement: string;
  architectureOverview: string;
  codeSnippets: string;
  userQuestion: string;
  conversationHistory?: { role: 'user' | 'model'; text: string }[];
}): Promise<string> {
  const client = getAiClient();

  const systemInstruction = `You are the specialized AI Assistant for VSW ML HUB (by VSW DATA SOLUTIONS: AI • SOFTWARE • AUTOMATION).
You are assisting an engineer or student studying the machine learning project: "${params.projectTitle}".
Category: ${params.category}
Technology Stack: ${params.techStack.join(', ')}

Problem Statement:
${params.problemStatement}

Architecture & Pipeline Overview:
${params.architectureOverview}

Project Source Code Context:
${params.codeSnippets}

Guidelines:
1. Provide accurate, production-grade answers grounded in the provided project context, code, and architecture.
2. If asked "Explain this project", provide a structured summary: High-level purpose, why this architecture was chosen, key bottlenecks solved, and business ROI.
3. If asked "Explain this code", walk through the specific logic, tensor transformations, pipeline steps, or API handlers.
4. If asked how to modify, deploy (e.g. AWS Lambda, Kubernetes, GCP Cloud Run, Docker), or optimize the model (e.g. ONNX, TensorRT, Quantization), provide real, copy-pasteable code snippets and configurations.
5. Keep explanations direct, professional, and practical. No academic fluff.
6. Tagline of VSW ML HUB: "Learn. Copy. Build. Deploy."`;

  if (!client) {
    // Intelligent local fallback if API key is not yet set in environment
    return `### Project AI Assistant (${params.projectTitle})

**Context Insight:**
This project addresses: *${params.problemStatement}*
Stack: ${params.techStack.join(', ')}.

**Regarding your question:** "${params.userQuestion}"
- **Architecture Flow:** The model utilizes ${params.architectureOverview}.
- **Implementation Note:** You can inspect the modular Python files in the Code Viewer tab. Key components include data ingestion, training pipelines, and REST inference endpoints.
- **Tip:** To test this model locally, follow the steps in the **"How To Run"** section or deploy containerized with Docker.

*(Tip: Ensure GEMINI_API_KEY is configured in Settings > Secrets for live real-time conversational responses!)*`;
  }

  try {
    const contents: any[] = [];
    if (params.conversationHistory && params.conversationHistory.length > 0) {
      for (const msg of params.conversationHistory.slice(-6)) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: params.userQuestion }],
    });

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || 'No response generated from the model.';
  } catch (error: any) {
    console.error('Gemini API Error in askProjectAssistant:', error);
    return `### AI Assistant Response
I encountered a temporary issue connecting to the Gemini service: ${error?.message || 'Request timeout'}.

**Quick Architectural Summary for ${params.projectTitle}:**
This project uses **${params.techStack.join(', ')}** to solve: *${params.problemStatement}*.
You can inspect the full source code sections and deployment guides directly in the tabs above.`;
  }
}
