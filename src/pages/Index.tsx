import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Shield, Sparkles, LogOut } from "lucide-react";
import { FormattedMessage } from "@/components/FormattedMessage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";

const SUGGESTIONS = [
"Quelles sont les obligations KYC ?",
"Exigences de fonds propres Bâle III",
"Règles de gouvernance FINMA"];


const Index = () => {
  const { signOut } = useAuth();
  const {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    setActiveId,
    createConversation,
    deleteConversation,
    sendMessage
  } = useConversations();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = activeConversation?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = messages.length <= 1 && !isLoading;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createConversation}
          onDelete={deleteConversation} />
        

        <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
          {/* Ambient background effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />
          </div>

          {/* Header */}
          <header className="flex-shrink-0 glass-strong z-10 relative">
            <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
              <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
              <div className="w-px h-6 bg-border/50" />
              <div className="relative">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-sm">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-base font-bold tracking-tight gradient-text">RegBridge</h1>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
                  Assistant Conformité FINMA
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-muted-foreground font-mono">En ligne</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Se déconnecter">
                  
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Chat area */}
          <div className="flex-1 overflow-hidden relative z-0">
            <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) =>
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    
                      {msg.role === "agent" &&
                    <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                    }
                      <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user" ?
                      "gradient-primary text-primary-foreground rounded-br-sm glow-sm" :
                      "glass rounded-bl-sm"}`
                      }>
                      
                        {msg.role === "agent" ? (
                          <FormattedMessage text={msg.text} />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                        {msg.role === "agent" && msg.sources && msg.sources.length > 0 &&
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06]">
                            <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                              📄 Sources
                            </p>
                            <ul className="space-y-1">
                              {msg.sources.map((src, i) =>
                          <li
                            key={i}
                            className="text-xs text-muted-foreground/80 font-mono pl-2 border-l-2 border-primary/30">
                            
                                  {src}
                                </li>
                          )}
                            </ul>
                          </div>
                      }
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading indicator */}
                <AnimatePresence>
                  {isLoading &&
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex justify-start">
                    
                      <div className="flex-shrink-0 mt-1 mr-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="glass rounded-2xl rounded-bl-sm px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) =>
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full gradient-primary inline-block"
                            style={{ animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite` }} />

                          )}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">Analyse en cours</span>
                        </div>
                        <div className="mt-2 h-0.5 w-32 rounded-full overflow-hidden bg-secondary">
                          <div className="h-full animate-shimmer rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  }
                </AnimatePresence>

                {/* Suggestions */}
                <AnimatePresence>
                  {showSuggestions &&
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-2 pt-4">
                    
                      {SUGGESTIONS.map((s, i) =>
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      onClick={() => handleSend(s)}
                      className="glass hover:bg-primary/10 text-xs text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl transition-all duration-200 hover:glow-sm cursor-pointer border border-white/[0.06] hover:border-primary/30">
                      
                          {s}
                        </motion.button>
                    )}
                    </motion.div>
                  }
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
                  placeholder="Posez votre question FINMA..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/60 py-2.5 font-sans disabled:opacity-50" />
                
                <Button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="gradient-primary rounded-lg h-9 px-4 text-primary-foreground hover:opacity-90 transition-opacity glow-sm disabled:opacity-30 disabled:shadow-none">
                  
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">
                RegBridge v1.0 — FINMA 🇨🇭
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>);

};

export default Index;