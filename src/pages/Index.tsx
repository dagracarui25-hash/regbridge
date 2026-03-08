import { useState } from "react";
import { Shield, LogOut, MessageSquare, GitCompare, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { ErrorBanner } from "@/components/ErrorBanner";
import { QuestionFinma } from "@/components/QuestionFinma";
import { AnalyseCroisee } from "@/components/AnalyseCroisee";
import { DocumentsInternes } from "@/components/DocumentsInternes";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { signOut } = useAuth();
  const [showError, setShowError] = useState(false);

  const handleError = () => setShowError(true);

  return (
    <div className="min-h-screen flex flex-col h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
      </div>

      {/* Error banner */}
      <ErrorBanner visible={showError} onClose={() => setShowError(false)} />

      {/* Header */}
      <header className="flex-shrink-0 glass-strong z-10 relative">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-sm">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold tracking-tight gradient-text">RegBridge</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
              Assistant Conformité FINMA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-mono hidden sm:inline">En ligne</span>
            </div>
            <SettingsDrawer />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="question" className="flex-1 flex flex-col overflow-hidden relative z-0">
        <div className="flex-shrink-0 glass-strong border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="question"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2.5 text-sm gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Question FINMA</span>
                <span className="sm:hidden">💬</span>
              </TabsTrigger>
              <TabsTrigger
                value="croisee"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2.5 text-sm gap-2"
              >
                <GitCompare className="h-4 w-4" />
                <span className="hidden sm:inline">Analyse croisée</span>
                <span className="sm:hidden">🔀</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2.5 text-sm gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Documents internes</span>
                <span className="sm:hidden">📁</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="question" className="flex-1 flex flex-col overflow-hidden mt-0 ring-0 focus-visible:ring-0">
          <QuestionFinma onError={handleError} />
        </TabsContent>
        <TabsContent value="croisee" className="flex-1 flex flex-col overflow-hidden mt-0 ring-0 focus-visible:ring-0">
          <AnalyseCroisee onError={handleError} />
        </TabsContent>
        <TabsContent value="documents" className="flex-1 flex flex-col overflow-y-auto mt-0 ring-0 focus-visible:ring-0">
          <DocumentsInternes onError={handleError} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex-shrink-0 text-center py-1.5 relative z-10">
        <p className="text-[10px] text-muted-foreground/40 font-mono">RegBridge v1.0 — FINMA 🇨🇭</p>
      </div>
    </div>
  );
};

export default Index;
