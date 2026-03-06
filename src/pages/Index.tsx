import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const Index = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = () => {
    const trimmed = input.trim();
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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-3xl">🏦</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">ComplianceRAG</h1>
            <p className="text-xs text-muted-foreground tracking-wide">Assistant Conformité FINMA</p>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "agent" && (
                  <span className="flex-shrink-0 mt-1 mr-2 text-xl">🤖</span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-card-foreground rounded-bl-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.role === "agent" && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border">
                      <p className="text-xs italic text-muted-foreground mb-1">📄 Sources :</p>
                      <ul className="space-y-0.5">
                        {msg.sources.map((src, i) => (
                          <li key={i} className="text-xs italic text-muted-foreground">• {src}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <span className="flex-shrink-0 mt-1 mr-2 text-xl">🤖</span>
                <div className="bg-card rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-base">⏳</span>
                    <span>Analyse en cours</span>
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                          style={{ animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question de conformité..."
            disabled={isLoading}
            className="flex-1 bg-card border-border"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="default">
            <Send className="h-4 w-4 mr-1" />
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
