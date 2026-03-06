import { useState, useRef, useCallback, useEffect } from "react";

export interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  sources?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const WELCOME_MESSAGE: Message = {
  id: 1,
  role: "agent",
  text: "Bienvenue dans ComplianceRAG. Je suis votre assistant spécialisé en conformité réglementaire FINMA. Posez-moi vos questions sur la réglementation bancaire suisse, la LBA, les circulaires FINMA ou tout autre sujet de compliance.",
  sources: [],
};

const API_URL = "https://granolithic-belletristic-bulah.ngrok-free.dev/question";

const STORAGE_KEY = "compliancerag-conversations";

function createNewConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "Nouvelle conversation",
    messages: [{ ...WELCOME_MESSAGE }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadConversations(): { conversations: Conversation[]; activeId: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.conversations?.length > 0) {
        return data;
      }
    }
  } catch {}
  const initial = createNewConversation();
  return { conversations: [initial], activeId: initial.id };
}

export function useConversations() {
  const [data, setData] = useState(loadConversations);
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(100);

  const { conversations, activeId } = data;
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const setActiveId = useCallback((id: string) => {
    setData((prev) => ({ ...prev, activeId: id }));
  }, []);

  const createConversation = useCallback(() => {
    const conv = createNewConversation();
    setData((prev) => ({
      conversations: [conv, ...prev.conversations],
      activeId: conv.id,
    }));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setData((prev) => {
      const filtered = prev.conversations.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const conv = createNewConversation();
        return { conversations: [conv], activeId: conv.id };
      }
      const newActiveId = prev.activeId === id ? filtered[0].id : prev.activeId;
      return { conversations: filtered, activeId: newActiveId };
    });
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = { id: nextId.current++, role: "user", text: trimmed };

      setData((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) =>
          c.id === prev.activeId
            ? {
                ...c,
                messages: [...c.messages, userMsg],
                title: c.messages.filter((m) => m.role === "user").length === 0 ? trimmed.slice(0, 40) : c.title,
                updatedAt: Date.now(),
              }
            : c
        ),
      }));

      setIsLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ question: trimmed }),
        });

        if (!res.ok) throw new Error("HTTP error");

        const json = await res.json();
        const sources = (json.sources || []).map(
          (s: { document: string; page: number }) => `${s.document} — Page ${s.page}`
        );

        const agentMsg: Message = {
          id: nextId.current++,
          role: "agent",
          text: json.reponse || "Pas de réponse.",
          sources,
        };
        setData((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === prev.activeId
              ? { ...c, messages: [...c.messages, agentMsg], updatedAt: Date.now() }
              : c
          ),
        }));
      } catch {
        const errorMsg: Message = {
          id: nextId.current++,
          role: "agent",
          text: "⚠️ Serveur indisponible.",
        };
        setData((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === prev.activeId
              ? { ...c, messages: [...c.messages, errorMsg], updatedAt: Date.now() }
              : c
          ),
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  return {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    setActiveId,
    createConversation,
    deleteConversation,
    sendMessage,
  };
}
