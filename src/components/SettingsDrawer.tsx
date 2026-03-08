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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title={t("settings.title")}>
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">{t("settings.title")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("settings.apiUrl")}</label>
            <input
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setTestResult(null); }}
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors font-mono"
            />
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 text-sm font-medium ${testResult === "ok" ? "text-green-400" : "text-destructive"}`}>
              {testResult === "ok" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {testResult === "ok" ? `✅ ${t("settings.serverOnline")}` : `❌ ${t("settings.serverOffline")}`}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleTest} disabled={testing || !draft.trim()} variant="outline" className="flex-1 rounded-lg">
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("settings.test")}
            </Button>
            <Button onClick={handleReset} variant="outline" className="rounded-lg">
              {t("settings.reset")}
            </Button>
          </div>

          <Button onClick={handleSave} disabled={!draft.trim()} className="w-full gradient-primary text-primary-foreground rounded-lg">
            {t("settings.save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
