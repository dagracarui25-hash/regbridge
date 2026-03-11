import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, MessageSquare, GitCompare, FolderOpen, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { ErrorBanner } from "@/components/ErrorBanner";
import { QuestionFinma } from "@/components/QuestionFinma";
import { AnalyseCroisee } from "@/components/AnalyseCroisee";
import { DocumentsInternes } from "@/components/DocumentsInternes";
import { LanguageSelector } from "@/components/LanguageSelector";
import { RegulationsDrawer } from "@/components/RegulationsDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState("question");

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
            <RegulationsDrawer />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/about")}
              className="h-8 w-8 text-muted-foreground hover:text-accent-cyan transition-colors"
              title="Documentation"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
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
      <div className="flex-1 flex flex-col overflow-hidden relative z-[5]">
        <div className="flex-shrink-0 glass-strong border-b border-white/[0.04] relative z-[10]">
          <div className="max-w-6xl mx-auto px-2 sm:px-4">
            <div className="flex h-auto p-0 gap-0 w-full">
              {[
                { value: "question", icon: MessageSquare, label: t("nav.question"), mobileLabel: "FINMA" },
                { value: "croisee", icon: GitCompare, label: t("nav.analysis"), mobileLabel: t("nav.analysis") },
                { value: "documents", icon: FolderOpen, label: t("nav.documents"), mobileLabel: t("nav.documents") },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center justify-center flex-1 sm:flex-none px-2 sm:px-5 py-3 text-xs sm:text-sm gap-1.5 sm:gap-2 min-w-0 transition-all duration-200 border-b-2 ${
                    activeTab === tab.value
                      ? "text-foreground border-primary shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)]"
                      : "text-muted-foreground border-transparent hover:text-foreground/70"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline font-display font-medium">{tab.label}</span>
                  <span className="sm:hidden truncate font-display">{tab.mobileLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-1 flex flex-col overflow-hidden absolute inset-0 z-[1]"
            >
              {activeTab === "question" && <QuestionFinma onError={handleError} onServerOnline={handleServerOnline} />}
              {activeTab === "croisee" && <AnalyseCroisee onError={handleError} />}
              {activeTab === "documents" && <DocumentsInternes onError={handleError} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 text-center py-1.5 relative z-10">
        <p className="footer-version font-mono">{t("footer.version")}</p>
      </div>
    </div>
  );
};

export default Index;
