import { useState, useRef, useCallback, useEffect } from "react";
import { getApiUrl } from "@/hooks/useApiUrl";
import i18n from "@/i18n";

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

function getWelcomeMessage(): Message {
  return {
    id: 1,
    role: "agent",
    text: i18n.t("chat.welcome"),
    sources: [],
  };
}

const STORAGE_KEY = "regbridge-conversations";

function createNewConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: i18n.t("chat.newConversation"),
    messages: [getWelcomeMessage()],
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

async function checkServerHealth(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${getApiUrl()}/`, {
      method: "GET",
      headers: { "ngrok-skip-browser-warning": "69420" },
      signal: ctrl.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 1
): Promise<Response> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 30000);
  
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("HTTP error");
    return res;
  } catch (error) {
    clearTimeout(timeout);
    if (retries > 0) {
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

interface UseConversationsOptions {
  onError?: () => void;
  onServerOffline?: () => void;
  onServerOnline?: () => void;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const [data, setData] = useState(loadConversations);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const nextId = useRef(100);

  const { conversations, activeId } = data;
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Check server health on mount + poll every 30s
  useEffect(() => {
    const check = () => {
      checkServerHealth().then((isOnline) => {
        setIsServerOffline(!isOnline);
        if (isOnline) options.onServerOnline?.();
        else options.onServerOffline?.();
      });
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const setActiveId = useCallback((id: string) => {
    setData((prev) => ({ ...prev, activeId: id }));
  }, []);

  const createConversation = useCallback(() => {
    setData((prev) => {
      // Guard: don't create a new one if the active conversation is already empty (0 user messages)
      const active = prev.conversations.find((c) => c.id === prev.activeId);
      if (active && active.messages.filter((m) => m.role === "user").length === 0) {
        return prev; // keep focus on the existing empty conversation
      }

      const conv = createNewConversation();
      let convs = [conv, ...prev.conversations];

      // FIFO: max 50 conversations
      if (convs.length > 50) {
        convs = convs.slice(0, 50);
      }

      return {
        conversations: convs,
        activeId: conv.id,
      };
    });
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

  const isLoadingRef = useRef(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoadingRef.current) return;

      // Health check before sending
      const isOnline = await checkServerHealth();
      if (!isOnline) {
        setIsServerOffline(true);
        options.onServerOffline?.();
        return;
      }
      
      // Server is online, clear any previous offline state
      setIsServerOffline(false);
      options.onServerOnline?.();

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
            : c,
        ),
      }));

      setIsLoading(true);
      isLoadingRef.current = true;

      try {
        const res = await fetchWithRetry(`${getApiUrl()}/question`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
          },
          body: JSON.stringify({ question: trimmed }),
        });

        const json = await res.json();
        const sources = (json.sources || []).map(
          (s: { document: string; page: number }) => `${s.document} — Page ${s.page}`,
        );

        const agentMsg: Message = {
          id: nextId.current++,
          role: "agent",
          text: json.reponse || i18n.t("chat.noResponse"),
          sources,
        };
        setData((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === prev.activeId ? { ...c, messages: [...c.messages, agentMsg], updatedAt: Date.now() } : c,
          ),
        }));
      } catch {
        // Server went offline during request
        setIsServerOffline(true);
        options.onServerOffline?.();
        // Don't add error message to chat - just show banner
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [options],
  );

  const recheckServer = useCallback(async () => {
    const isOnline = await checkServerHealth();
    setIsServerOffline(!isOnline);
    if (isOnline) {
      options.onServerOnline?.();
    } else {
      options.onServerOffline?.();
    }
    return isOnline;
  }, [options]);

  return {
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
  };
}
