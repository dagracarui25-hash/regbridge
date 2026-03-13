import { Plus, MessageSquare, Trash2, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/hooks/useConversations";
import { useTranslation } from "react-i18next";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({ conversations, activeId, onSelect, onCreate, onDelete }: ChatSidebarProps) {
  const { state } = useSidebar();
  const { t, i18n } = useTranslation();
  const collapsed = state === "collapsed";

  function formatDate(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return t("chat.today");
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t("chat.yesterday");
    const locale = i18n.language === "fr" ? "fr-CH" : i18n.language === "de" ? "de-CH" : i18n.language === "it" ? "it-CH" : "en-GB";
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-white/[0.06] overflow-hidden">
      <SidebarHeader className="p-3 overflow-hidden">
        {!collapsed && (
          <div className="flex items-center gap-2.5 mb-4 px-1">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center glow-sm">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold gradient-text font-display tracking-tight">RegBridge</span>
          </div>
        )}
        <Button
          onClick={onCreate}
          size={collapsed ? "icon" : "sm"}
          className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold h-10 px-4 transition-all duration-200 hover:scale-[1.02] shadow-md"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-1.5 font-display truncate">{t("chat.newConversation")}</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] gradient-text-gold font-semibold font-display px-3">
              {t("chat.history")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conv) => {
                const isActive = conv.id === activeId;
                const msgCount = conv.messages.filter((m) => m.role === "user").length;
                return (
                  <SidebarMenuItem key={conv.id} className="relative group/tooltip">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onSelect(conv.id)}
                      tooltip={conv.title}
                      className={`group/item transition-all duration-150 rounded-lg ${
                        isActive
                          ? "bg-secondary border-l-2 border-l-primary"
                          : "hover:bg-secondary/50 border-l-2 border-l-transparent hover:border-l-primary/40"
                      }`}
                    >
                      <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                      {!collapsed && (
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate text-xs font-medium" title={conv.title}>{conv.title}</span>
                          <span className="text-[10px] text-muted-foreground/50 font-mono">
                            {formatDate(conv.updatedAt)} · {msgCount} msg
                          </span>
                        </div>
                      )}
                    </SidebarMenuButton>
                    {!collapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#0F172A] border border-[#334155] text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 pointer-events-none z-[9999] max-w-[280px] break-words" style={{ wordWrap: 'break-word' }}>
                        {conv.title}
                      </div>
                    )}
                    {!collapsed && conversations.length > 1 && (
                      <SidebarMenuAction
                        showOnHover
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </SidebarMenuAction>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
