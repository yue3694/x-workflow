import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check Status
  app.get("/api/status", (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    const isMock = !key || key === "MY_GEMINI_API_KEY" || key.trim() === "";
    res.json({
      status: "ok",
      connected: !isMock,
      hasKey: !!key,
    });
  });

  // Chat API Integration
  app.post("/api/chat", async (req: any, res: any) => {
    try {
      const { message, systemInstruction, temperature } = req.body;
      const key = process.env.GEMINI_API_KEY;
      const isMock = !key || key === "MY_GEMINI_API_KEY" || key.trim() === "";

      if (isMock) {
        const text = generateSimulatedReply(message, systemInstruction);
        return res.json({ text, connected: false });
      }

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: message,
        config: {
          systemInstruction: systemInstruction || "You are Alexandria, an AI orchestration scholar.",
          temperature: typeof temperature === "number" ? temperature : 0.7,
        }
      });

      return res.json({ text: response.text, connected: true });
    } catch (e: any) {
      console.error("Gemini Error:", e);
      return res.status(500).json({ error: e?.message || "Internal Server Error", connected: false });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

function generateSimulatedReply(message: string, systemInstruction?: string): string {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("你好")) {
    return "Greetings. This is the Alexandria Archival Protocol (Simulation Mode). I have analyzed your system instruction: '" + (systemInstruction || "Default Scholar") + "'. Ready to orchestrate custom logic blocks under strict supervisor hierarchy.";
  }
  if (msgLower.includes("summarize") || msgLower.includes("earnings") || msgLower.includes("report") || msgLower.includes("总结") || msgLower.includes("报告")) {
    return "**[STUDY SUMMATION] Logistics Division - Fiscal Year Performance**\n\n" +
           "- **Fiscal FY26 Growth**: Revenue expanded by **12.4% YoY**, matching standard projections. This was heavily driven by the initial onboarding of 12 cluster divisions.\n" +
           "- **Margin Contraction**: Observed a contract of **2.3%** inside localized domestic routing operations. This shrinkage represents rising fuel costs and node maintenance budgets.\n" +
           "- **System Recommendation**: Adjust 'Max Retries' to `3` in your active LLM synthesis configurations to offset momentary timeouts.\n\n" +
           "*(Note: To synthesize live reports dynamically using your actual documents, please supply your real `GEMINI_API_KEY` via Settings > Secrets.)*";
  }
  if (msgLower.includes("help") || msgLower.includes("调试") || msgLower.includes("debug") || msgLower.includes("帮助")) {
    return "Alexandria Debugging Command Center:\n" +
           "- Ensure active Trigger nodes have authorized webhook headers.\n" +
           "- Monitor your permission topology for unauthorized API entry points.\n" +
           "- Simulated cognitive latency: **14ms** with full integrity.";
  }
  
  return "I have received your request: \"" + message + "\".\n\n" +
         "In local simulation mode, I can identify trigger patterns but require live cognitive pathways to fetch deep analysis. For dynamic, real-time responses to this input, connect a valid API key through your AI Studio secrets panel.";
}

startServer();
