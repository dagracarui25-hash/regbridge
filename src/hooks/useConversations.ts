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

const SIMULATED_RESPONSES = [
  {
    text: "Selon la Circulaire FINMA 2017/1 « Gouvernance d'entreprise – banques », les établissements doivent disposer d'un système de contrôle interne adéquat comprenant la gestion des risques, la compliance et l'audit interne. Le conseil d'administration est responsable de la supervision de ces fonctions.",
    sources: [
      "Circulaire FINMA 2017/1 – Gouvernance d'entreprise",
      "Loi sur les banques (LB), Art. 3",
      "Ordonnance sur les banques (OB), Art. 12",
    ],
  },
  {
    text: "En matière de lutte contre le blanchiment d'argent (LBA), la FINMA exige que les intermédiaires financiers vérifient l'identité du cocontractant et identifient l'ayant droit économique. Les obligations de diligence sont détaillées dans l'OBA-FINMA.",
    sources: [
      "Loi sur le blanchiment d'argent (LBA), Art. 3-5",
      "OBA-FINMA, Art. 13-23",
      "Convention de diligence des banques (CDB 20)",
    ],
  },
  {
    text: "Les exigences de fonds propres pour les banques suisses sont définies par l'Ordonnance sur les fonds propres (OFR). Les banques d'importance systémique sont soumises à des exigences supplémentaires conformément à la réglementation « too big to fail » (TBTF).",
    sources: [
      "Ordonnance sur les fonds propres (OFR), Art. 41-46",
      "Circulaire FINMA 2011/2 – Volant de fonds propres",
      "Rapport FINMA sur les banques d'importance systémique 2023",
    ],
  },
];

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
      const response = SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];

      setTimeout(() => {
        const agentMsg: Message = {
          id: nextId.current++,
          role: "agent",
          text: response.text,
          sources: response.sources,
        };
        setData((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === prev.activeId
              ? { ...c, messages: [...c.messages, agentMsg], updatedAt: Date.now() }
              : c
          ),
        }));
        setIsLoading(false);
      }, 1500 + Math.random() * 1000);
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
