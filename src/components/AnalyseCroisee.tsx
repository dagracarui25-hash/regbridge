import { useState, KeyboardEvent } from "react";
import { Send, Loader2, Building2, Landmark, GitCompare, Scale, FileSearch } from "lucide-react";
import { FormattedMessage } from "@/components/FormattedMessage";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/hooks/useApiUrl";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface CrossResult {
  finma: { reponse: string; sources: { document: string; page: number }[] } | null;
  interne: { reponse: string; sources: { document: string; page: number }[] } | null;
}

interface AnalyseCroiseeProps {
  onError: () => void;
}

type ErrorType = "offline" | "not_found" | null;

const SUGGESTION_CARDS = [
  { icon: Scale, key: "Comparer KYC interne vs FINMA", query: "Compare les obligations KYC internes avec les exigences FINMA" },
  { icon: FileSearch, key: "Analyser la conformité LBA", query: "Analyse la conformité de nos procédures avec la LBA" },
  { icon: GitCompare, key: "Vérifier les procédures CDB", query: "Vérifie la conformité de nos procédures CDB avec les circulaires FINMA" },
];

export function AnalyseCroisee({ onError }: AnalyseCroiseeProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrossResult | null>(null);

  const handleSend = async (query?: string) => {
    const trimmed = (query || input).trim();
    if (!trimmed || loading) return;
    if (!query) setInput("");
    setLoading(true);
    setResult(null);

    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(`${getApiUrl()}/question-croisee`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "69420" },
        body: JSON.stringify({ question: trimmed }),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("HTTP error");
      const json = await res.json();
      setResult({ finma: json.finma || null, interne: json.interne || null });
    } catch {
      onError();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSources = (sources: { document: string; page: number }[]) =>
    sources.map((s) => `${s.document} — ${t("cross.page", { page: s.page })}`);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence>
            {loading && (
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

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Landmark className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground font-display">{t("cross.finmaTitle")}</h3>
                </div>
                {result.finma ? (
                  <>
                    <div className="text-sm leading-relaxed">
                      <FormattedMessage text={result.finma.reponse} />
                    </div>
                    {result.finma.sources?.length > 0 && (
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

              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Building2 className="h-5 w-5 text-accent-cyan" />
                  <h3 className="text-sm font-bold text-foreground font-display">{t("cross.internalTitle")}</h3>
                </div>
                {result.interne && result.interne.reponse ? (
                  <>
                    <div className="text-sm leading-relaxed">
                      <FormattedMessage text={result.interne.reponse} />
                    </div>
                    {result.interne.sources?.length > 0 && (
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
                ) : (
                  <div className="text-sm text-muted-foreground bg-secondary/30 rounded-xl p-4" dangerouslySetInnerHTML={{ __html: t("cross.noInternal") }} />
                )}
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16"
            >
              {/* Floating icon */}
              <div className="animate-float mb-6">
                <div className="w-20 h-20 rounded-2xl glass-card border-gradient flex items-center justify-center glow-md">
                  <GitCompare className="w-9 h-9 text-accent-cyan" />
                </div>
              </div>

              {/* Title with gradient */}
              <h3 className="text-2xl font-bold gradient-text font-display mb-2">{t("cross.title")}</h3>
              <p className="text-sm text-muted-foreground max-w-md text-center leading-relaxed mb-8">{t("cross.description")}</p>

              {/* Suggestion cards */}
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
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 py-2.5 font-sans disabled:opacity-40"
            />
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              size="sm"
              className="gradient-primary rounded-xl h-10 w-10 p-0 text-primary-foreground hover:opacity-90 hover:scale-[1.08] transition-all duration-200 glow-sm disabled:opacity-20 disabled:shadow-none disabled:scale-100"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
