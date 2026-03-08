import { Shield, ArrowLeft, MessageSquare, GitCompare, FolderOpen, Server, Cpu, Database, Globe, Zap, Lock, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

function SectionTitle({ icon: Icon, title, id }: { icon: any; title: string; id: string }) {
  return (
    <motion.div {...fadeUp()} id={id} className="flex items-center gap-3 mb-6 scroll-mt-24">
      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-sm shrink-0">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground font-display">{title}</h2>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, items, examples, limits, examplesLabel, limitsLabel }: {
  icon: any; title: string; items: string[]; examples?: string[]; limits?: string[]; examplesLabel: string; limitsLabel: string;
}) {
  return (
    <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-accent-cyan" />
        <h3 className="text-lg font-bold text-foreground font-display">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {examples && examples.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-accent-gold font-bold mb-2 font-display">{examplesLabel}</p>
          <div className="space-y-1.5">
            {examples.map((ex, i) => (
              <p key={i} className="text-xs text-muted-foreground/80 font-mono pl-3 border-l-2 border-accent-cyan/30 py-0.5">"{ex}"</p>
            ))}
          </div>
        </div>
      )}
      {limits && limits.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-destructive/80 font-bold mb-2 font-display">{limitsLabel}</p>
          <ul className="space-y-1">
            {limits.map((l, i) => (
              <li key={i} className="text-xs text-muted-foreground/60 flex items-start gap-2">
                <span className="text-destructive/60">•</span>{l}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

const phaseColors = ["text-emerald-400", "text-primary", "text-accent-gold"];

export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tocItems = [
    { id: "what", label: t("about.toc.what") },
    { id: "architecture", label: t("about.toc.architecture") },
    { id: "tabs", label: t("about.toc.tabs") },
    { id: "finma-docs", label: t("about.toc.finmaDocs") },
    { id: "api", label: t("about.toc.api") },
    { id: "stack", label: t("about.toc.stack") },
    { id: "roadmap", label: t("about.toc.roadmap") },
  ];

  const whatItems = t("about.what.items", { returnObjects: true }) as string[];
  const finmaItems = t("about.tabs.finma.items", { returnObjects: true }) as string[];
  const finmaExamples = t("about.tabs.finma.examples", { returnObjects: true }) as string[];
  const finmaLimits = t("about.tabs.finma.limits", { returnObjects: true }) as string[];
  const crossItems = t("about.tabs.cross.items", { returnObjects: true }) as string[];
  const crossExamples = t("about.tabs.cross.examples", { returnObjects: true }) as string[];
  const docsItems = t("about.tabs.docs.items", { returnObjects: true }) as string[];
  const finmaDocsList = t("about.finmaDocs.items", { returnObjects: true }) as string[];
  const apiItems = t("about.api.items", { returnObjects: true }) as string[][];
  const stackItems = t("about.stack.items", { returnObjects: true }) as { label: string; value: string }[];
  const roadmapPhases = t("about.roadmap.phases", { returnObjects: true }) as { version: string; subtitle: string; items: { done: boolean; text: string }[] }[];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none dot-grid">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-primary/[0.12] blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-accent-cyan/[0.06] blur-[140px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 glass-strong z-20 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-sm">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold gradient-text font-display">{t("about.headerTitle")}</h1>
            <p className="text-[9px] gradient-text-gold tracking-[0.12em] uppercase font-semibold">{t("about.headerSubtitle")}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 flex gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden xl:block w-56 shrink-0 sticky top-20 self-start">
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="block text-sm text-muted-foreground hover:text-foreground py-1.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-16">
          {/* SECTION 1 */}
          <section>
            <SectionTitle icon={Shield} title={t("about.what.title")} id="what" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">RegBridge</span> {t("about.what.desc1")}{" "}
                <span className="text-accent-cyan font-semibold">{t("about.what.rag")}</span>.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("about.what.desc2")}</p>
              <ul className="space-y-2.5">
                {whatItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </section>

          {/* SECTION 2 */}
          <section>
            <SectionTitle icon={Cpu} title={t("about.architecture.title")} id="architecture" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient overflow-x-auto">
              <pre className="text-[11px] sm:text-xs font-mono text-muted-foreground leading-relaxed whitespace-pre overflow-x-auto">
{`┌──────────────────────────────────────────────────┐
│                    FRONTEND                       │
│               Lovable (React)                     │
│   Question FINMA │ Analyse croisée │ Documents    │
└─────────────────────┬────────────────────────────┘
                      │ HTTPS / Ngrok tunnel
┌─────────────────────▼────────────────────────────┐
│                    BACKEND                        │
│               FastAPI (Python)                    │
│  POST /query │ /cross-query │ /upload │ /docs     │
└──────────┬─────────────────────┬─────────────────┘
           │                     │
┌──────────▼────────┐    ┌──────▼──────────────────┐
│   QDRANT CLOUD    │    │     GROQ API             │
│   Collection 1:   │    │     LLaMA 3.1 8B         │
│   finma_docs      │    │     (generation)          │
│   Collection 2:   │    └─────────────────────────┘
│   internal_docs   │
│   (HuggingFace    │
│   Embeddings)     │
└───────────────────┘`}
              </pre>
            </motion.div>
          </section>

          {/* SECTION 3 */}
          <section>
            <SectionTitle icon={Zap} title={t("about.tabs.title")} id="tabs" />
            <div className="space-y-6">
              <FeatureCard
                icon={MessageSquare}
                title={t("about.tabs.finma.title")}
                items={finmaItems}
                examples={finmaExamples}
                limits={finmaLimits}
                examplesLabel={t("about.tabs.examples")}
                limitsLabel={t("about.tabs.limitsMvp")}
              />
              <FeatureCard
                icon={GitCompare}
                title={t("about.tabs.cross.title")}
                items={crossItems}
                examples={crossExamples}
                examplesLabel={t("about.tabs.examples")}
                limitsLabel={t("about.tabs.limitsMvp")}
              />
              <FeatureCard
                icon={FolderOpen}
                title={t("about.tabs.docs.title")}
                items={docsItems}
                examplesLabel={t("about.tabs.examples")}
                limitsLabel={t("about.tabs.limitsMvp")}
              />
            </div>
          </section>

          {/* SECTION 4 */}
          <section>
            <SectionTitle icon={Database} title={t("about.finmaDocs.title")} id="finma-docs" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient">
              <div className="space-y-3">
                {finmaDocsList.map((doc, i) => (
                  <motion.div key={i} {...fadeUp(0.05 * i)} className="flex items-center gap-3 text-sm py-2 px-3 rounded-xl hover:bg-secondary/30 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-accent-gold shrink-0" />
                    <span className="text-muted-foreground">{doc}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* SECTION 5 */}
          <section>
            <SectionTitle icon={Server} title={t("about.api.title")} id="api" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-white/[0.06]">
                    <th className="pb-3 text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display">{t("about.api.method")}</th>
                    <th className="pb-3 text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display">{t("about.api.endpoint")}</th>
                    <th className="pb-3 text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display">{t("about.api.description")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {apiItems.map(([method, endpoint, desc], i) => (
                    <tr key={i} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-mono font-bold ${method === "GET" ? "text-emerald-400" : method === "POST" ? "text-primary" : "text-destructive"}`}>
                          {method}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-foreground/80">{endpoint}</td>
                      <td className="py-2.5 text-muted-foreground text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </section>

          {/* SECTION 6 */}
          <section>
            <SectionTitle icon={Globe} title={t("about.stack.title")} id="stack" />
            <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stackItems.map((item, i) => (
                <div key={i} className="glass-card rounded-xl px-4 py-3 border-gradient flex items-baseline gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display whitespace-nowrap">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </section>

          {/* SECTION 7 */}
          <section>
            <SectionTitle icon={Lock} title={t("about.roadmap.title")} id="roadmap" />
            <div className="space-y-6">
              {roadmapPhases.map((phase, pi) => (
                <motion.div key={pi} {...fadeUp(0.1 * pi)} className="glass-card rounded-2xl p-6 border-gradient">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className={`text-lg font-bold font-display ${phaseColors[pi] || "text-foreground"}`}>{phase.version}</span>
                    <span className="text-xs text-muted-foreground">— {phase.subtitle}</span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                        )}
                        <span className={item.done ? "text-foreground/80" : ""}>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="text-center pt-8 pb-4">
            <p className="text-[10px] text-muted-foreground/30 font-mono">RegBridge v1.0 · Documentation</p>
          </div>
        </main>
      </div>
    </div>
  );
}
