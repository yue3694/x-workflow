import React, { useState, useRef, useEffect } from "react";
import { Node, Language, SystemLog, ChatMessage, LANGUAGES } from "../types";
import { Play, Terminal, Send, Trash2, RefreshCw, Layers, ShieldAlert, Cpu, Activity, Clock, Check, LogOut, ChevronRight } from "lucide-react";

interface DebuggerViewProps {
  language: Language;
  nodes: Node[];
}

export default function DebuggerView({ language, nodes }: DebuggerViewProps) {
  const strings = LANGUAGES[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "M-1", sender: "agent", text: language === "en" ? "Greetings. Ready to debug custom pipeline workflows. Provide a query to trace live logical steps." : "您好，已加载诊断调试工具。请输入指令并观察各节点之间的实时运转流向图和耗时。", timestamp: "12:04:12" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Console logs state initialize
  const [logs, setLogs] = useState<SystemLog[]>([
    { timestamp: "12:00:01", level: "INFO", message: "Alexandria core kernel boot up successful" },
    { timestamp: "12:00:03", level: "TRACE", message: "Datalog indexes synced: 12,431 documents loaded" },
    { timestamp: "12:01:10", level: "LOG", message: "Node mapping generated. Pipeline N-TRG in standby" }
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Check backend server connection status on boot
  useEffect(() => {
    fetch("/api/status")
      .then(res => res.json())
      .then(data => {
        setIsConnected(data?.connected || false);
      })
      .catch(() => {
        setIsConnected(false);
      });
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message & execute step by step
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `M-USR-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toTimeString().split(' ')[0]
    };
    setMessages(prev => [...prev, userMsg]);

    // Push starting logs
    addLog("EXEC", `Initiating pipeline request: "${userText.slice(0, 30)}..."`);

    // Step 01: Webhook Trigger
    setActiveStep(1);
    addLog("INFO", "Step 01 [N-TRG Webhook] activated. Verified digital signature and headers.");
    await delay(600);

    // Step 02: Verification Gating
    setActiveStep(2);
    addLog("TRACE", "Step 02 [N-CND Condition] parsing instruction. Security levels cleared.");
    await delay(700);

    // Step 03: Paralell Context Mapper
    setActiveStep(3);
    addLog("DEBUG", "Step 03 [N-PRL Parallel Module] matching vectorized archives & index caches.");
    await delay(600);

    // Step 04: LLM Cognitive Synthesis
    setActiveStep(4);
    addLog("EXEC", "Step 04 [N-SYN LLM Synthesis] dispatching payload to Gemini Engine.");

    // Retrieve system prompt instruction from our LLM Node
    const llmNode = nodes.find(n => n.type === "llm_synthesis");
    const systemPrompt = llmNode?.config?.systemInstruction || "Summarize academic archives elegantly.";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          systemInstruction: systemPrompt,
          temperature: llmNode?.config?.temperature || 0.7
        })
      });

      const resData = await response.json();
      setIsConnected(resData.connected);

      const agentMsg: ChatMessage = {
        id: `M-AGT-${Date.now()}`,
        sender: "agent",
        text: resData.text || "Simulation pathway completed.",
        timestamp: new Date().toTimeString().split(' ')[0],
        stepId: 4
      };

      setMessages(prev => [...prev, agentMsg]);
      addLog("LOG", `Step 04 completed inside ${resData.connected ? "240ms" : "12ms"}. System return payload retrieved.`);
    } catch (err: any) {
      addLog("WARN", `Failed to complete transaction inside Gemini endpoint: ${err?.message || "Internal error"}`);
    } finally {
      setIsLoading(false);
      setActiveStep(null);
    }
  };

  const addLog = (level: SystemLog["level"], message: string) => {
    const newLog: SystemLog = {
      timestamp: new Date().toTimeString().split(' ')[0],
      level,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[calc(100vh-160px)]">
      
      {/* Left Column: Flowchart Execution Steps Log */}
      <div className="xl:col-span-1 space-y-6 flex flex-col">
        <div>
          <h2 className="text-xs font-bold font-mono tracking-widest text-outline uppercase mb-1">
            {language === "en" ? "TRACE CONTROLLER" : "系统进程分析"}
          </h2>
          <h1 className="font-headline text-lg font-bold text-on-surface">
            {strings.executionGraph}
          </h1>
        </div>

        {/* The 4 main modular steps */}
        <div className="space-y-3.5 flex-grow">
          
          {/* Step 01 */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeStep === 1 
              ? "bg-[#fda4af]/10 border-rose-400 ring-2 ring-rose-400/20" 
              : "bg-surface-container-lowest border-outline-variant/30"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] text-rose-500 font-bold uppercase tracking-widest">STEP 01</span>
              {activeStep === 1 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
            </div>
            <h4 className="text-xs font-semibold text-on-surface">Webhook Gateway</h4>
            <p className="text-[10px] text-on-surface-variant font-light mt-1">Authorized digital gateway & incoming packet parse state.</p>
          </div>

          {/* Step 02 */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeStep === 2 
              ? "bg-[#86efac]/10 border-emerald-400 ring-2 ring-emerald-400/20" 
              : "bg-surface-container-lowest border-outline-variant/30"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] text-emerald-500 font-bold uppercase tracking-widest">STEP 02</span>
              {activeStep === 2 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </div>
            <h4 className="text-xs font-semibold text-on-surface">Security & Routing Condition</h4>
            <p className="text-[10px] text-on-surface-variant font-light mt-1">Gating authentication credentials & metadata structural verification.</p>
          </div>

          {/* Step 03 */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeStep === 3 
              ? "bg-[#7dd3fc]/10 border-sky-400 ring-2 ring-sky-400/20" 
              : "bg-surface-container-lowest border-outline-variant/30"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] text-sky-500 font-bold uppercase tracking-widest">STEP 03</span>
              {activeStep === 3 && <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />}
            </div>
            <h4 className="text-xs font-semibold text-on-surface">Distributed Knowledge Vector</h4>
            <p className="text-[10px] text-on-surface-variant font-light mt-1">Aligning references with historical libraries indexes (12.4K archives).</p>
          </div>

          {/* Step 04 */}
          <div className={`p-4 rounded-xl border transition-all ${
            activeStep === 4 
              ? "bg-primary/10 border-primary ring-2 ring-primary/20" 
              : "bg-surface-container-lowest border-outline-variant/30"
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-widest">STEP 04</span>
              {activeStep === 4 && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
            </div>
            <h4 className="text-xs font-semibold text-on-surface">Cognitive LLM Synthesis</h4>
            <p className="text-[10px] text-on-surface-variant font-light mt-1">Calling Deep Gemini-04 intelligence with active prompting logic.</p>
          </div>

        </div>
      </div>

      {/* Middle & Right Column: Sandbox Chat Interface + Real-Time logs console */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Real-time Interaction Sandbox */}
        <div className="flex-grow min-h-[380px] rounded-2xl bg-surface-container-lowest border border-outline-variant/15 flex flex-col justify-between shadow-sm">
          
          {/* Top panel details */}
          <div className="px-5 py-3 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-2 bg-surface-container-lowest/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
              <h2 className="text-xs font-bold font-mono tracking-widest text-outline uppercase">{strings.agentInteraction}</h2>
              <span className="text-[9px] tracking-wide font-mono bg-rose-500/10 text-rose-500 border border-rose-500/35 px-1.5 py-0.5 rounded uppercase font-bold">{strings.liveSession}</span>
            </div>
            
            {/* API Connection Banner badge */}
            <div className="text-[10px] font-mono leading-none">
              {isConnected ? (
                <span className="text-success font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {strings.connectedGemini}
                </span>
              ) : (
                <span className="text-amber-500 font-bold flex items-center gap-1" title="To connect actual Gemini endpoints, enter secrets in AI Studio.">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {strings.notConnectedGemini}
                </span>
              )}
            </div>
          </div>

          {/* Messages window */}
          <div className="flex-grow p-5 space-y-4 overflow-y-auto max-h-[340px] border-b border-outline-variant/5">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                  m.sender === "user" 
                    ? "bg-primary text-on-primary" 
                    : "bg-surface-container border border-outline-variant/20 text-on-surface"
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div className={`flex items-center gap-1.5 mt-2 text-[9px] font-mono leading-none ${
                    m.sender === "user" ? "text-primary-fixed-dim/75" : "text-outline/75"
                  }`}>
                    <span>{m.timestamp}</span>
                    {m.stepId && (
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">Step 0{m.stepId} Passed</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container border border-outline-variant/15 rounded-2xl p-4 text-xs text-outline font-mono flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_1s_infinite]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_1s_infinite_0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_1s_infinite_0.4s]" />
                  </div>
                  <span>Running dynamic tracing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-surface-container-low/70 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-grow px-4 py-3 bg-surface text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 rounded-xl text-xs placeholder:text-outline"
              placeholder={strings.typeTestMessage}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-primary text-on-primary hover:bg-primary-hover disabled:bg-outline-variant/25 disabled:text-outline rounded-xl transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Terminal Logs container */}
        <div className="rounded-2xl border border-outline-variant/15 bg-[#0b0c10] text-[#00ff66] p-4 font-mono text-[11px] h-48 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#00ff66]" />
              <span className="uppercase text-[9px] tracking-widest font-bold">{strings.executionLogs}</span>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-[#9ea0a7]/60 hover:text-white transition-colors"
              title="Clear Terminal logs"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto space-y-1.5 pr-2 max-h-[110px]">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2 leading-relaxed">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className={`font-bold shrink-0 ${
                    log.level === "WARN" ? "text-amber-500" :
                    log.level === "EXEC" ? "text-[#00ffff]" : 
                    log.level === "TRACE" ? "text-pink-500" : "text-[#00ff66]"
                  }`}>{log.level}</span>
                  <span className="text-gray-300 break-all">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-600 text-center py-6">EMPTY CONSOLE JOURNAL</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
