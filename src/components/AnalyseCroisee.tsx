import { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader2, Building2, Landmark, GitCompare, Scale, FileSearch, AlertTriangle, Download } from "lucide-react";
import { FormattedMessage } from "@/components/FormattedMessage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Source {
  document: string;
  page: number;
}

interface CrossResult {
  finma: { reponse: string; sources: Source[] } | null;
  interne: { reponse: string; sources: Source[] } | null;
}

interface AnalyseCroiseeProps {
  onError: () => void;
}

type ErrorType = "offline" | "not_found" | "rate_limit" | "credits" | null;

const SUGGESTION_CARDS = [
  { icon: Scale, key: "Comparer KYC interne vs FINMA", query: "Compare les obligations KYC internes avec les exigences FINMA" },
  { icon: FileSearch, key: "Analyser la conformité LBA", query: "Analyse la conformité de nos procédures avec la LBA" },
  { icon: GitCompare, key: "Vérifier les procédures CDB", query: "Vérifie la conformité de nos procédures CDB avec les circulaires FINMA" },
];

const STREAM_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/question-croisee`;

/** Split streamed full text into FINMA / INTERNE sections */
function splitResponse(fullText: string): { finma: string; interne: string } {
  const interneMarker = fullText.match(/#{0,3}\s*(?:2[\.\)]\s*)?ANALYSE\s+(?:INTERNE|DOCUMENTS?\s+INTERNES?)/i);
  const finmaMarker = fullText.match(/#{0,3}\s*(?:1[\.\)]\s*)?ANALYSE\s+FINMA/i);

  if (interneMarker && interneMarker.index !== undefined) {
    let finma = fullText.slice(0, interneMarker.index).trim();
    let interne = fullText.slice(interneMarker.index).trim();
    if (finmaMarker) finma = finma.replace(finmaMarker[0], "").trim();
    interne = interne.replace(interneMarker[0], "").trim();
    return { finma, interne };
  }

  // Before the interne marker appears, everything goes in finma
  let finma = fullText;
  if (finmaMarker) finma = finma.replace(finmaMarker[0], "").trim();
  return { finma, interne: "" };
}

export function AnalyseCroisee({ onError }: AnalyseCroiseeProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState<CrossResult | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!resultRef.current) return;
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: "analyse-croisee.pdf",
        html2canvas: { scale: 2, backgroundColor: "#1a1a2e" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(resultRef.current)
      .save();
  };

  const handleSend = async (query?: string) => {
    const trimmed = (query || input).trim();
    if (!trimmed || loading) return;
    if (!query) setInput("");

    setLoading(true);
    setStreaming(false);
    setResult(null);
    setErrorType(null);

    // Abort any previous stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let finmaSources: Source[] = [];
    let interneSources: Source[] = [];
    let fullText = "";

    try {
      const resp = await fetch(STREAM_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        if (resp.status === 429) { setErrorType("rate_limit"); return; }
        if (resp.status === 402) { setErrorType("credits"); return; }
        if (resp.status === 404) { setErrorType("not_found"); return; }
        throw new Error(`HTTP ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      setLoading(false);
      setStreaming(true);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);

            // Handle our custom sources event
            if (parsed.type === "sources") {
              finmaSources = parsed.finmaSources || [];
              interneSources = parsed.interneSources || [];
              continue;
            }

            // Standard OpenAI streaming delta
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              const { finma, interne } = splitResponse(fullText);
              setResult({
                finma: finma ? { reponse: finma, sources: finmaSources } : null,
                interne: interne ? { reponse: interne, sources: interneSources } : null,
              });
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
            }
          } catch { /* ignore */ }
        }
      }

      // Final result
      const { finma, interne } = splitResponse(fullText);
      setResult({
        finma: finma ? { reponse: finma, sources: finmaSources } : null,
        interne: interne
          ? { reponse: interne, sources: interneSources }
          : interneSources.length > 0
            ? { reponse: "Les documents internes ont été consultés mais aucun écart spécifique n'a été identifié.", sources: interneSources }
            : null,
      });
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("Stream error:", e);
      setErrorType("offline");
      onError();
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSources = (sources: Source[]) =>
    sources.map((s) => `${s.document} — ${t("cross.page", { page: s.page })}`);

  const isActive = loading || streaming;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence>
            {loading && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-20"
              >
                <div className="glass-card rounded-2xl px-6 py-4 flex items-center gap-3 border-gradient">
                  <Loader2 className="h-5 w-5 text-accent-cyan animate-spin" />
                  <span className="text-sm text-muted-foreground">{t("cross.loading")}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {errorType && !isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-6"
            >
              <div className={`rounded-2xl px-5 py-4 flex items-start gap-3 border ${
                errorType === "not_found"
                  ? "bg-accent-gold/10 border-accent-gold/30"
                  : "bg-destructive/10 border-destructive/30"
              }`}>
                <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${
                  errorType === "not_found" ? "text-accent-gold" : "text-destructive"
                }`} />
                <p className={`text-sm ${
                  errorType === "not_found" ? "text-accent-gold" : "text-destructive"
                }`}>
                  {errorType === "rate_limit"
                    ? "Limite de requêtes atteinte, réessayez plus tard."
                    : errorType === "credits"
                      ? "Crédits épuisés, veuillez recharger votre compte."
                      : t(errorType === "not_found" ? "error.notFound" : "error.offline")}
                </p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {!streaming && (
                <div className="flex justify-end mb-3">
                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl border-white/[0.08] hover:bg-primary/10"
                  >
                    <Download className="h-4 w-4" />
                    {t("cross.exportPdf")}
                  </Button>
                </div>
              )}
              <div ref={resultRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* FINMA Panel */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Landmark className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground font-display">{t("cross.finmaTitle")}</h3>
                  {streaming && <Loader2 className="h-3 w-3 text-primary animate-spin ml-auto" />}
                </div>
                {result.finma ? (
                  <>
                    <div className="text-sm leading-relaxed">
                      <FormattedMessage text={result.finma.reponse} />
                    </div>
                    {!streaming && result.finma.sources?.length > 0 && (
                      <div className="pt-2 border-t border-accent-gold/20">
                        <p className="text-[10px] font-bold gradient-text-gold mb-1.5 uppercase tracking-[0.12em] font-display">📄 {t("chat.sources")}</p>
                        <ul className="space-y-1">
                          {formatSources(result.finma.sources).map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground/80 font-mono pl-3 border-l-2 border-accent-cyan/30">{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("cross.noFinma")}</p>
                )}
              </div>

              {/* Internal Panel */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Building2 className="h-5 w-5 text-accent-cyan" />
                  <h3 className="text-sm font-bold text-foreground font-display">{t("cross.internalTitle")}</h3>
                  {streaming && <Loader2 className="h-3 w-3 text-accent-cyan animate-spin ml-auto" />}
                </div>
                {result.interne && result.interne.reponse ? (
                  <>
                    <div className="text-sm leading-relaxed">
                      <FormattedMessage text={result.interne.reponse} />
                    </div>
                    {!streaming && result.interne.sources?.length > 0 && (
                      <div className="pt-2 border-t border-accent-gold/20">
                        <p className="text-[10px] font-bold gradient-text-gold mb-1.5 uppercase tracking-[0.12em] font-display">📄 {t("chat.sources")}</p>
                        <ul className="space-y-1">
                          {formatSources(result.interne.sources).map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground/80 font-mono pl-3 border-l-2 border-accent-cyan/30">{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : streaming ? (
                  <div className="flex items-center gap-2 py-4">
                    <span className="text-sm text-muted-foreground/60">En attente…</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4" dangerouslySetInnerHTML={{ __html: t("cross.noInternal") }} />
                )}
              </div>
              </div>
            </motion.div>
          )}

          {!result && !loading && !errorType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="animate-float mb-6">
                <div className="w-20 h-20 rounded-2xl glass-card border-gradient flex items-center justify-center glow-md">
                  <GitCompare className="w-9 h-9 text-accent-cyan" />
                </div>
              </div>
              <h3 className="text-2xl font-bold gradient-text font-display mb-2">{t("cross.title")}</h3>
              <p className="text-sm text-muted-foreground max-w-md text-center leading-relaxed mb-8">{t("cross.description")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                {SUGGESTION_CARDS.map((card, i) => (
                  <motion.button
                    key={card.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    onClick={() => {
                      setInput(card.query);
                      handleSend(card.query);
                    }}
                    className="glass-card rounded-xl p-4 text-left hover:bg-primary/10 hover:border-primary/30 border border-white/[0.06] transition-all duration-200 group cursor-pointer"
                  >
                    <card.icon className="h-5 w-5 text-accent-cyan mb-2 group-hover:text-primary transition-colors" />
                    <p className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">{card.key}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 glass-strong border-t border-white/[0.06] px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-3 items-center glass-card rounded-2xl px-4 py-2 focus-within:glow-input-focus transition-all duration-300">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("cross.placeholder")}
              disabled={isActive}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 py-2.5 font-sans disabled:opacity-40"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isActive || !input.trim()}
              size="sm"
              className="gradient-primary rounded-xl h-10 w-10 p-0 text-primary-foreground hover:opacity-90 hover:scale-[1.08] transition-all duration-200 glow-sm disabled:opacity-20 disabled:shadow-none disabled:scale-100"
            >
              {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
