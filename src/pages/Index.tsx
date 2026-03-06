import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  sources?: string[];
}

const SIMULATED_RESPONSES: { text: string; sources: string[] }[] = [
  {
    text: "Selon la Circulaire FINMA 2017/1 « Gouvernance d'entreprise – banques », les établissements doivent disposer d'un système de contrôle interne adéquat comprenant la gestion des risques, la compliance et l'audit interne. Le conseil d'administration est responsable de la supervision de ces fonctions.",
    sources: [
      "Circulaire FINMA 2017/1 – Gouvernance d'entreprise",
      "Loi sur les banques (LB), Art. 3",
      "Ordonnance sur les banques (OB), Art. 12",
    ],
  },
  {
    text: "En matière de lutte contre le blanchiment d'argent (LBA), la FINMA exige que les intermédiaires financiers vérifient l'identité du cocontractant et identifient l'ayant droit économique. Les obligations de diligence sont détaillées dans l'OBA-FINMA.",
    sources: [
      "Loi sur le blanchiment d'argent (LBA), Art. 3-5",
      "OBA-FINMA, Art. 13-23",
      "Convention de diligence des banques (CDB 20)",
    ],
  },
  {
    text: "Les exigences de fonds propres pour les banques suisses sont définies par l'Ordonnance sur les fonds propres (OFR). Les banques d'importance systémique sont soumises à des exigences supplémentaires conformément à la réglementation « too big to fail » (TBTF).",
    sources: [
      "Ordonnance sur les fonds propres (OFR), Art. 41-46",
      "Circulaire FINMA 2011/2 – Volant de fonds propres",
      "Rapport FINMA sur les banques d'importance systémique 2023",
    ],
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "agent",
    text: "Bienvenue dans ComplianceRAG. Je suis votre assistant spécialisé en conformité réglementaire FINMA. Posez-moi vos questions sur la réglementation bancaire suisse, la LBA, les circulaires FINMA ou tout autre sujet de compliance.",
    sources: [],
  },
];

const SUGGESTIONS = [
  "Quelles sont les obligations KYC ?",
  "Exigences de fonds propres Bâle III",
  "Règles de gouvernance FINMA",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: nextId.current++, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const response = SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "agent", text: response.text, sources: response.sources },
      ]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="flex-shrink-0 glass-strong z-10 relative">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-6 py-4">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center glow-sm">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight gradient-text">ComplianceRAG</h1>
            <p className="text-[11px] text-muted-foreground tracking-widest uppercase font-medium">
              Assistant Conformité FINMA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">En ligne</span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden relative z-0">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "agent" && (
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "gradient-primary text-primary-foreground rounded-br-sm glow-sm"
                        : "glass rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.role === "agent" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                          📄 Sources
                        </p>
                        <ul className="space-y-1">
                          {msg.sources.map((src, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground/80 font-mono pl-2 border-l-2 border-primary/30"
                            >
                              {src}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex justify-start"
                >
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="glass rounded-2xl rounded-bl-sm px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full gradient-primary inline-block"
                            style={{ animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">Analyse en cours</span>
                    </div>
                    <div className="mt-2 h-0.5 w-32 rounded-full overflow-hidden bg-secondary">
                      <div className="h-full animate-shimmer rounded-full" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pt-4"
                >
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      onClick={() => sendMessage(s)}
                      className="glass hover:bg-primary/10 text-xs text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl transition-all duration-200 hover:glow-sm cursor-pointer border border-white/[0.06] hover:border-primary/30"
                    >
                      {s}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 glass-strong relative z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-center glass rounded-xl px-3 py-1.5 focus-within:border-primary/30 focus-within:glow-sm transition-all duration-300">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question de conformité..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 py-2.5 font-sans disabled:opacity-50"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              size="sm"
              className="gradient-primary rounded-lg h-9 px-4 text-primary-foreground hover:opacity-90 transition-opacity glow-sm disabled:opacity-30 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">
            ComplianceRAG v1.0 — Les réponses sont générées à titre informatif
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
