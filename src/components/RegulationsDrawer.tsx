import { useState } from "react";
import { BookOpen, ChevronDown, CheckCircle, Lock, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface RegItem {
  name: string;
  active: boolean;
}

interface RegCategory {
  emoji: string;
  titleKey: string;
  items: RegItem[];
}

const REGULATIONS: RegCategory[] = [
  {
    emoji: "🏦",
    titleKey: "regs.cat.finma",
    items: [
      { name: "LFINMA — Loi sur l'Autorité fédérale de surveillance", active: true },
      { name: "LEFin — Loi sur les établissements financiers (2020)", active: true },
      { name: "LSFin — Loi sur les services financiers (2020)", active: true },
      { name: "LB — Loi sur les banques", active: true },
      { name: "LPCC — Loi sur les placements collectifs de capitaux", active: false },
      { name: "OB — Ordonnance sur les banques", active: false },
      { name: "Circulaires FINMA", active: true },
      { name: "Circ.-FINMA 2023/1 Risques opérationnels et résilience", active: true },
    ],
  },
  {
    emoji: "🔐",
    titleKey: "regs.cat.cyber",
    items: [
      { name: "NCSC / OFCS — Office fédéral de la cybersécurité", active: false },
      { name: "Circ.-FINMA 2023/1 — Risques opérationnels (cyber)", active: true },
      { name: "TIBER-CH — Framework de résilience cyber", active: false },
      { name: "NIS2 — Directive européenne sécurité des réseaux", active: false },
      { name: "ISO/IEC 27001 — Sécurité de l'information", active: false },
      { name: "ISO/IEC 27005 — Gestion des risques SI", active: false },
      { name: "NIST Cybersecurity Framework", active: false },
      { name: "DORA — Digital Operational Resilience Act (UE)", active: false },
    ],
  },
  {
    emoji: "📋",
    titleKey: "regs.cat.risk",
    items: [
      { name: "SGRD — Standards gestion des risques et gouvernance", active: false },
      { name: "Basel III / IV — Accords de Bâle", active: false },
      { name: "ICAAP — Internal Capital Adequacy Assessment", active: false },
      { name: "ILAAP — Internal Liquidity Adequacy Assessment", active: false },
      { name: "COSO ERM — Enterprise Risk Management Framework", active: false },
      { name: "ISO 31000 — Management du risque", active: false },
      { name: "Circ.-FINMA 2017/1 — Gouvernance d'entreprise", active: false },
    ],
  },
  {
    emoji: "🧹",
    titleKey: "regs.cat.aml",
    items: [
      { name: "LBA — Loi fédérale lutte contre le blanchiment", active: true },
      { name: "OBA-FINMA — Ordonnance FINMA sur le blanchiment", active: false },
      { name: "GAFI / FATF — Recommandations internationales", active: false },
      { name: "FINMA Circ. 2011/1 — Intermédiaire financier LBA", active: false },
    ],
  },
  {
    emoji: "🌍",
    titleKey: "regs.cat.fiscal",
    items: [
      { name: "FATCA — Foreign Account Tax Compliance Act (USA)", active: false },
      { name: "CRS / AEOI — Common Reporting Standard (OCDE)", active: false },
      { name: "QI Agreement — Qualified Intermediary (IRS)", active: false },
      { name: "EUSD — Directive épargne européenne", active: false },
    ],
  },
  {
    emoji: "📊",
    titleKey: "regs.cat.data",
    items: [
      { name: "LPD — Protection des données (sept. 2023)", active: false },
      { name: "RGPD / GDPR — Règlement européen (impact indirect)", active: false },
    ],
  },
  {
    emoji: "☁️",
    titleKey: "regs.cat.cloud",
    items: [
      { name: "Circ.-FINMA 2018/3 — Outsourcing", active: false },
      { name: "CSA — Cloud Security Alliance (CCM, STAR)", active: false },
      { name: "Azure / Cloud FINMA compliance", active: false },
    ],
  },
];

function getStats() {
  const allItems = REGULATIONS.flatMap((c) => c.items);
  const active = allItems.filter((i) => i.active).length;
  return { active, total: allItems.length };
}

function CategoryAccordion({ category }: { category: RegCategory }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const activeCount = category.items.filter((i) => i.active).length;

  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-elevated hover:bg-elevated/80 transition-colors duration-150"
      >
        <span className="text-lg">{category.emoji}</span>
        <span className="flex-1 text-left text-sm font-semibold gradient-text-gold font-display">
          {t(category.titleKey)}
        </span>
        {activeCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="py-1">
              {category.items.map((item, idx) => (
                <RegulationItem key={idx} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RegulationItem({ item }: { item: RegItem }) {
  const { t } = useTranslation();

  if (item.active) {
    return (
      <div className="flex items-center gap-3 pl-8 pr-4 py-2.5 border-b border-white/[0.03] last:border-b-0 hover:bg-primary/5 transition-colors">
        <span className="flex-1 text-sm text-foreground font-mono truncate">{item.name}</span>
        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 pl-8 pr-4 py-2.5 border-b border-white/[0.03] last:border-b-0 cursor-not-allowed opacity-70">
            <span className="flex-1 text-sm text-muted-foreground font-mono truncate">{item.name}</span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20 whitespace-nowrap shrink-0">
              {t("regs.comingSoon")}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="max-w-[280px] glass-strong border border-white/[0.08] p-4 rounded-xl"
        >
          <p className="text-sm font-semibold text-foreground mb-1">🚧 {t("regs.tooltipTitle")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            {t("regs.tooltipDesc")}
          </p>
          <p className="text-xs text-accent-gold leading-relaxed">
            🏆 {t("regs.tooltipContest")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RegulationsDrawer() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const stats = getStats();
  const progressPercent = Math.round((stats.active / stats.total) * 100);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground transition-colors gap-1.5 h-8 px-2 sm:px-3"
        title={t("regs.title")}
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-display">{t("regs.button")}</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] sm:max-w-[420px] bg-surface border-l border-white/[0.06] p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06] space-y-2">
            <SheetTitle className="text-lg font-bold gradient-text font-display flex items-center gap-2">
              📚 {t("regs.drawerTitle")}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {t("regs.drawerSubtitle")}
            </SheetDescription>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                ✅ MVP {t("regs.active")}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
                🗺️ Roadmap
              </span>
            </div>
          </SheetHeader>

          {/* Body */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-4 space-y-2">
              {REGULATIONS.map((cat, idx) => (
                <CategoryAccordion key={idx} category={cat} />
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-white/[0.06]">
            <div className="glass-card border-gradient rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent-gold" />
                <span className="text-sm font-bold text-foreground font-display">
                  GenAI Zürich Hackathon 2026
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {t("regs.footerDesc")}
              </p>
              <div className="space-y-1.5">
                <Progress value={progressPercent} className="h-2.5 rounded-full" />
                <p className="text-[11px] text-muted-foreground font-mono text-center">
                  {stats.active} / {stats.total} {t("regs.integrated")}
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
