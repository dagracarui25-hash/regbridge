import { useState, KeyboardEvent } from "react";
import { Send, Loader2, Building2, Landmark } from "lucide-react";
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

export function AnalyseCroisee({ onError }: AnalyseCroiseeProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrossResult | null>(null);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
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
                <div className="glass rounded-2xl px-6 py-4 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
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
              <div className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Landmark className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{t("cross.finmaTitle")}</h3>
                </div>
                {result.finma ? (
                  <>
                    <div className="text-sm leading-relaxed">
                      <FormattedMessage text={result.finma.reponse} />
                    </div>
                    {result.finma.sources?.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">📄 {t("chat.sources")}</p>
                        <ul className="space-y-1">
                          {formatSources(result.finma.sources).map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground/80 font-mono pl-2 border-l-2 border-primary/30">{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("cross.noFinma")}</p>
                )}
              </div>

              <div className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{t("cross.internalTitle")}</h3>
                </div>
                {result.interne && result.interne.reponse ? (
                  <>
                    <div className="text-sm leading-relaxed">
                      <FormattedMessage text={result.interne.reponse} />
                    </div>
                    {result.interne.sources?.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">📄 {t("chat.sources")}</p>
                        <ul className="space-y-1">
                          {formatSources(result.interne.sources).map((s, i) => (
                            <li key={i} className="text-xs text-muted-foreground/80 font-mono pl-2 border-l-2 border-primary/30">{s}</li>
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
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔀</span>
                </div>
                <h3 className="text-base font-semibold text-foreground">{t("cross.title")}</h3>
                <p className="text-sm text-muted-foreground max-w-md">{t("cross.description")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 glass-strong px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 items-center glass rounded-xl px-3 py-1.5 focus-within:border-primary/30 transition-all duration-300">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("cross.placeholder")}
              disabled={loading}
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 py-2.5 font-sans disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              size="sm"
              className="gradient-primary rounded-lg h-9 px-4 text-primary-foreground hover:opacity-90 transition-opacity glow-sm disabled:opacity-30 disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
