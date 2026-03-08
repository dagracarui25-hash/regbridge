import { useState } from "react";
import { Shield, LogOut, MessageSquare, GitCompare, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { ErrorBanner } from "@/components/ErrorBanner";
import { QuestionFinma } from "@/components/QuestionFinma";
import { AnalyseCroisee } from "@/components/AnalyseCroisee";
import { DocumentsInternes } from "@/components/DocumentsInternes";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [showError, setShowError] = useState(false);

  const handleError = () => setShowError(true);
  const handleServerOnline = () => setShowError(false);

  return (
    <div className="min-h-screen flex flex-col h-screen relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none dot-grid">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-primary/[0.12] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent-cyan/[0.06] blur-[140px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-accent-gold/[0.03] blur-[120px]" />
      </div>

      {/* Error banner */}
      <ErrorBanner visible={showError} onClose={() => setShowError(false)} />

      {/* Header */}
      <header className="flex-shrink-0 glass-strong z-10 relative border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-sm">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight gradient-text font-display">RegBridge</h1>
            <p className="text-[9px] gradient-text-gold tracking-[0.15em] uppercase font-semibold">
              {t("nav.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${showError ? "bg-destructive animate-glow-pulse text-destructive" : "bg-emerald-400 animate-glow-pulse text-emerald-400"}`} />
              <span className={`text-xs font-mono hidden sm:inline transition-colors duration-500 ${showError ? "text-destructive" : "text-emerald-400/80"}`}>
                {showError ? t("nav.offline") : t("nav.online")}
              </span>
            </div>
            <LanguageSelector />
            <SettingsDrawer />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
              title={t("common.logout")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="question" className="flex-1 flex flex-col overflow-hidden relative z-0">
        <div className="flex-shrink-0 glass-strong border-b border-white/[0.04]">
          <div className="max-w-6xl mx-auto px-2 sm:px-4">
            <TabsList className="bg-transparent h-auto p-0 gap-0 w-full">
              <TabsTrigger
                value="question"
                className="data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] flex-1 sm:flex-none px-2 sm:px-5 py-3 text-xs sm:text-sm gap-1.5 sm:gap-2 min-w-0 transition-all duration-200"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline font-display font-medium">{t("nav.question")}</span>
                <span className="sm:hidden truncate font-display">FINMA</span>
              </TabsTrigger>
              <TabsTrigger
                value="croisee"
                className="data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] flex-1 sm:flex-none px-2 sm:px-5 py-3 text-xs sm:text-sm gap-1.5 sm:gap-2 min-w-0 transition-all duration-200"
              >
                <GitCompare className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline font-display font-medium">{t("nav.analysis")}</span>
                <span className="sm:hidden truncate font-display">{t("nav.analysis")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] flex-1 sm:flex-none px-2 sm:px-5 py-3 text-xs sm:text-sm gap-1.5 sm:gap-2 min-w-0 transition-all duration-200"
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline font-display font-medium">{t("nav.documents")}</span>
                <span className="sm:hidden truncate font-display">{t("nav.documents")}</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="question" className="flex-1 flex flex-col overflow-hidden mt-0 ring-0 focus-visible:ring-0">
          <QuestionFinma onError={handleError} onServerOnline={handleServerOnline} />
        </TabsContent>
        <TabsContent value="croisee" className="flex-1 flex flex-col overflow-hidden mt-0 ring-0 focus-visible:ring-0">
          <AnalyseCroisee onError={handleError} />
        </TabsContent>
        <TabsContent value="documents" className="flex-1 flex flex-col overflow-hidden mt-0 ring-0 focus-visible:ring-0">
          <DocumentsInternes onError={handleError} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex-shrink-0 text-center py-1.5 relative z-10">
        <p className="text-[10px] text-muted-foreground/30 font-mono tracking-wider">{t("footer.version")}</p>
      </div>
    </div>
  );
};

export default Index;
