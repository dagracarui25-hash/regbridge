import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { FormattedMessage } from "@/components/FormattedMessage";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useConversations } from "@/hooks/useConversations";
import { useTranslation } from "react-i18next";

interface QuestionFinmaProps {
  onError: () => void;
  onServerOnline?: () => void;
}

export function QuestionFinma({ onError, onServerOnline }: QuestionFinmaProps) {
  const { t } = useTranslation();
  const {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    isServerOffline,
    setActiveId,
    createConversation,
    deleteConversation,
    sendMessage,
    recheckServer,
  } = useConversations({ 
    onError,
    onServerOffline: onError,
    onServerOnline,
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = activeConversation?.messages || [];

  const SUGGESTIONS = [
    t("suggestions.kyc"),
    t("suggestions.basel"),
    t("suggestions.governance"),
    t("suggestions.aml"),
    t("suggestions.reporting"),
  ];

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

  const lastMsgIsAgent = messages.length > 0 && messages[messages.length - 1].role === "agent";
  const showSuggestions = (messages.length <= 1 || lastMsgIsAgent) && !isLoading;

  return (
    <SidebarProvider>
      <div className="flex w-full h-full">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={createConversation}
          onDelete={deleteConversation}
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-3 left-3 z-10">
            <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
          </div>

          <div className="flex-1 overflow-hidden">
            <div ref={scrollRef} className="h-full overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 pb-8">
              <div className="max-w-full space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "agent" && (
                        <div className="flex-shrink-0 mt-1 mr-3">
                          <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center border-gradient glow-cyan">
                            <Sparkles className="w-4 h-4 text-accent-cyan" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "max-w-[80%] gradient-primary text-primary-foreground rounded-[18px] rounded-br-[4px] px-5 py-3.5 glow-sm shadow-lg shadow-primary/10"
                            : "max-w-full rounded-[18px] rounded-bl-[4px] glass-card px-5 py-3.5"
                        }`}
                      >
                        {msg.role === "agent" ? (
                          <FormattedMessage text={msg.text} />
                        ) : (
                          <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                        )}
                        {msg.role === "agent" && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-accent-gold/20">
                            <p className="text-[10px] font-bold gradient-text-gold mb-2 uppercase tracking-[0.12em] font-display">
                              📄 {t("chat.sources")}
                            </p>
                            <ul className="space-y-1.5">
                              {msg.sources.map((src, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-muted-foreground/80 font-mono pl-3 border-l-2 border-accent-cyan/30 break-all whitespace-normal hover:text-foreground hover:border-accent-cyan/60 transition-colors cursor-default py-0.5"
                                >
                                  {src}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex justify-start"
                    >
                      <div className="flex-shrink-0 mt-1 mr-3">
                        <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center border-gradient">
                          <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
                        </div>
                      </div>
                      <div className="glass-card rounded-[18px] rounded-bl-[4px] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-2 h-2 rounded-full bg-accent-cyan inline-block"
                                style={{ animation: `wave-dot 1.4s ease-in-out ${i * 0.15}s infinite` }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{t("chat.analyzing")}</span>
                        </div>
                        <div className="mt-2.5 h-0.5 w-36 rounded-full overflow-hidden bg-secondary">
                          <div className="h-full animate-shimmer rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-2.5 pt-4"
                    >
                      {SUGGESTIONS.map((s, i) => (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          onClick={() => handleSend(s)}
                          className="glass-card hover:bg-primary/10 text-xs text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-white/[0.06] hover:border-primary/30 hover:glow-sm"
                        >
                          {s}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Chat input bar */}
          <div className="flex-shrink-0 glass-strong border-t border-white/[0.06] px-4 py-3">
            <div className="max-w-full">
              <div className="flex gap-3 items-center glass-card rounded-2xl px-4 py-2 focus-within:glow-input-focus transition-all duration-300">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isServerOffline ? t("chat.serverOfflinePlaceholder") : t("chat.placeholder")}
                  disabled={isLoading || isServerOffline}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 py-2.5 font-sans disabled:opacity-40"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={isLoading || isServerOffline || !input.trim()}
                  size="sm"
                  className="gradient-primary rounded-xl h-10 w-10 p-0 text-primary-foreground hover:opacity-90 hover:scale-[1.08] transition-all duration-200 glow-sm disabled:opacity-20 disabled:shadow-none disabled:scale-100"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
