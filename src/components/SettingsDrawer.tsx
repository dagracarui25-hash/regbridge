import { useState } from "react";
import { Settings, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useTranslation } from "react-i18next";

export function SettingsDrawer() {
  const { t } = useTranslation();
  const { apiUrl, setApiUrl, resetApiUrl, defaultUrl } = useApiUrl();
  const [draft, setDraft] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);
  const [open, setOpen] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(draft.replace(/\/+$/, "") + "/", {
        signal: ctrl.signal,
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      clearTimeout(timeout);
      setTestResult(res.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setApiUrl(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(defaultUrl);
    setTestResult(null);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (v) { setDraft(apiUrl); setTestResult(null); } }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" title={t("settings.title")}>
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="glass-strong border-l border-white/[0.06]">
        <SheetHeader>
          <SheetTitle className="text-foreground font-display">{t("settings.title")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold gradient-text-gold uppercase tracking-[0.12em] font-display">{t("settings.apiUrl")}</label>
            <input
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setTestResult(null); }}
              className="w-full glass-card border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 focus:glow-input-focus transition-all duration-200 font-mono"
            />
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2 ${testResult === "ok" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
              {testResult === "ok" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {testResult === "ok" ? `✅ ${t("settings.serverOnline")}` : `❌ ${t("settings.serverOffline")}`}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleTest} disabled={testing || !draft.trim()} variant="outline" className="flex-1 rounded-xl glass-card border-white/[0.06] hover:bg-primary/10 transition-colors">
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("settings.test")}
            </Button>
            <Button onClick={handleReset} variant="outline" className="rounded-xl glass-card border-white/[0.06] hover:bg-primary/10 transition-colors">
              {t("settings.reset")}
            </Button>
          </div>

          <Button onClick={handleSave} disabled={!draft.trim()} className="w-full gradient-primary text-primary-foreground rounded-xl glow-sm hover:opacity-90 transition-all duration-200">
            {t("settings.save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
