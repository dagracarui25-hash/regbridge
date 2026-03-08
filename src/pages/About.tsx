import { Shield, ArrowLeft, MessageSquare, GitCompare, FolderOpen, Server, Cpu, Database, Globe, Zap, Lock, CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

function FeatureCard({ icon: Icon, title, items, examples, limits }: {
  icon: any; title: string; items: string[]; examples?: string[]; limits?: string[];
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
          <p className="text-[10px] uppercase tracking-widest text-accent-gold font-bold mb-2 font-display">Exemples</p>
          <div className="space-y-1.5">
            {examples.map((ex, i) => (
              <p key={i} className="text-xs text-muted-foreground/80 font-mono pl-3 border-l-2 border-accent-cyan/30 py-0.5">"{ex}"</p>
            ))}
          </div>
        </div>
      )}
      {limits && limits.length > 0 && (
        <div className="pt-3 border-t border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-destructive/80 font-bold mb-2 font-display">Limites MVP</p>
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

const tocItems = [
  { id: "what", label: "Qu'est-ce que RegBridge ?" },
  { id: "architecture", label: "Architecture technique" },
  { id: "tabs", label: "Fonctionnalités par onglet" },
  { id: "finma-docs", label: "Documents FINMA indexés" },
  { id: "api", label: "Endpoints API" },
  { id: "stack", label: "Stack technique" },
  { id: "roadmap", label: "Roadmap" },
];

export default function About() {
  const navigate = useNavigate();

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
            <h1 className="text-base font-bold gradient-text font-display">RegBridge — Documentation</h1>
            <p className="text-[9px] gradient-text-gold tracking-[0.12em] uppercase font-semibold">Guide complet</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 flex gap-10">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden xl:block w-56 shrink-0 sticky top-20 self-start">
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block text-sm text-muted-foreground hover:text-foreground py-1.5 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-16">
          {/* SECTION 1 — Qu'est-ce que RegBridge ? */}
          <section>
            <SectionTitle icon={Shield} title="Qu'est-ce que RegBridge ?" id="what" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">RegBridge</span> est un assistant IA de conformité réglementaire bancaire suisse, basé sur une architecture{" "}
                <span className="text-accent-cyan font-semibold">RAG (Retrieval-Augmented Generation) dual-collection</span>.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">Il permet à un établissement financier de :</p>
              <ul className="space-y-2.5">
                {[
                  "Interroger les circulaires FINMA en langage naturel",
                  "Comparer ses procédures internes avec la réglementation",
                  "Détecter automatiquement les écarts de conformité",
                  "Obtenir des réponses sourcées et traçables",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </section>

          {/* SECTION 2 — Architecture technique */}
          <section>
            <SectionTitle icon={Cpu} title="Architecture technique" id="architecture" />
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
│   finma_docs      │    │     (génération réponse)  │
│   Collection 2:   │    └─────────────────────────┘
│   internal_docs   │
│   (HuggingFace    │
│   Embeddings)     │
└───────────────────┘`}
              </pre>
            </motion.div>
          </section>

          {/* SECTION 3 — Fonctionnalités par onglet */}
          <section>
            <SectionTitle icon={Zap} title="Fonctionnalités par onglet" id="tabs" />
            <div className="space-y-6">
              <FeatureCard
                icon={MessageSquare}
                title="Question FINMA"
                items={[
                  "Poser toute question sur les circulaires FINMA indexées dans Qdrant (collection finma_docs)",
                  "Obtenir une réponse en langage naturel avec citations précises (PDF + numéro de page)",
                  "Suggestions de questions rapides prédéfinies : KYC, Bâle III, Gouvernance, LBA, Reporting",
                  "Historique des conversations persisté en session",
                  "Nouvelle conversation à tout moment",
                ]}
                examples={[
                  "Quelles sont les obligations KYC ?",
                  "Quelles sont les exigences Bâle III ?",
                  "Règles de gouvernance FINMA ?",
                ]}
                limits={[
                  "Uniquement les circulaires déjà indexées",
                  "Pas de mémoire inter-sessions",
                  "Modèle limité à 8B paramètres (Groq free tier)",
                ]}
              />
              <FeatureCard
                icon={GitCompare}
                title="Analyse croisée"
                items={[
                  "Comparer SIMULTANÉMENT finma_docs et internal_docs",
                  "Détecter les écarts de conformité entre les deux collections",
                  "Citer les sources des deux côtés dans chaque réponse",
                  "Identifier les lacunes dans les procédures internes",
                  "Formuler des recommandations actionnables",
                ]}
                examples={[
                  "Notre procédure KYC est-elle conforme FINMA ?",
                  "Notre gouvernance des risques respecte-t-elle la Circ. 2023/1 ?",
                  "Notre politique données est-elle conforme LPD ?",
                ]}
              />
              <FeatureCard
                icon={FolderOpen}
                title="Documents internes"
                items={[
                  "Uploader des PDF de procédures internes",
                  "Sélectionner une catégorie : Procédure interne, Règlement interne, Autre",
                  "Indexation automatique dans Qdrant avec chunking",
                  "Bibliothèque avec filtres par catégorie, tri par date, recherche texte",
                  "Modification de catégorie inline et suppression",
                  "Audit trail des modifications",
                ]}
              />
            </div>
          </section>

          {/* SECTION 4 — Documents FINMA indexés */}
          <section>
            <SectionTitle icon={Database} title="Documents FINMA indexés (MVP)" id="finma-docs" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient">
              <div className="space-y-3">
                {[
                  "Circ.-FINMA 2023/1 — Risques opérationnels",
                  "Circ.-FINMA 2016/7 — Risques de crédit",
                  "Circ.-FINMA 2025/2 — (à confirmer)",
                  "OBA-FINMA — Ordonnance blanchiment",
                  "ASB Convention CDB 2020",
                  "SBA Agreement CDB 2020",
                ].map((doc, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp(0.05 * i)}
                    className="flex items-center gap-3 text-sm py-2 px-3 rounded-xl hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent-gold shrink-0" />
                    <span className="text-muted-foreground">{doc}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* SECTION 5 — Endpoints API */}
          <section>
            <SectionTitle icon={Server} title="Endpoints API disponibles" id="api" />
            <motion.div {...fadeUp(0.1)} className="glass-card rounded-2xl p-6 border-gradient overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-white/[0.06]">
                    <th className="pb-3 text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display">Méthode</th>
                    <th className="pb-3 text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display">Endpoint</th>
                    <th className="pb-3 text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ["GET", "/health", "Vérification statut serveur"],
                    ["POST", "/query", "Question FINMA simple"],
                    ["POST", "/cross-query", "Analyse croisée dual-collection"],
                    ["POST", "/upload", "Upload et indexation PDF"],
                    ["GET", "/documents", "Liste documents indexés"],
                    ["DELETE", "/documents/{id}", "Suppression document"],
                  ].map(([method, endpoint, desc], i) => (
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

          {/* SECTION 6 — Stack technique */}
          <section>
            <SectionTitle icon={Globe} title="Stack technique complète" id="stack" />
            <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Frontend", value: "React / Lovable / Tailwind CSS" },
                { label: "Backend", value: "Python / FastAPI / LangChain" },
                { label: "LLM", value: "Groq API — LLaMA 3.1 8B Instant" },
                { label: "Embeddings", value: "HuggingFace (all-MiniLM-L6-v2)" },
                { label: "Vector DB", value: "Qdrant Cloud (dual-collection)" },
                { label: "Tunnel", value: "Ngrok (dev) / URL configurable" },
                { label: "Auth", value: "Session-based (Paramètres)" },
                { label: "i18n", value: "i18next — EN / DE / FR / IT" },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl px-4 py-3 border-gradient flex items-baseline gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold font-display whitespace-nowrap">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </section>

          {/* SECTION 7 — Roadmap */}
          <section>
            <SectionTitle icon={Lock} title="Roadmap" id="roadmap" />
            <div className="space-y-6">
              {[
                {
                  version: "v1.0 MVP",
                  subtitle: "Actuel",
                  color: "text-emerald-400",
                  items: [
                    { done: true, text: "RAG FINMA mono-collection" },
                    { done: true, text: "Upload documents internes" },
                    { done: true, text: "Analyse croisée dual-collection" },
                    { done: true, text: "Interface multilingue 4 langues" },
                    { done: true, text: "Bibliothèque de documents" },
                  ],
                },
                {
                  version: "v2.0",
                  subtitle: "Si victoire GenAI Zürich 2026",
                  color: "text-primary",
                  items: [
                    { done: false, text: "DORA — Digital Operational Resilience Act" },
                    { done: false, text: "LPD complète + RGPD" },
                    { done: false, text: "Basel III/IV intégration" },
                    { done: false, text: "Mémoire inter-sessions" },
                    { done: false, text: "Export rapport PDF de conformité" },
                    { done: false, text: "Multi-utilisateurs avec rôles" },
                  ],
                },
                {
                  version: "v3.0",
                  subtitle: "Vision long terme",
                  color: "text-accent-gold",
                  items: [
                    { done: false, text: "40+ référentiels réglementaires" },
                    { done: false, text: "Alertes automatiques nouvelles circulaires" },
                    { done: false, text: "Intégration core banking" },
                    { done: false, text: "Dashboard analytics conformité" },
                  ],
                },
              ].map((phase, pi) => (
                <motion.div key={pi} {...fadeUp(0.1 * pi)} className="glass-card rounded-2xl p-6 border-gradient">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className={`text-lg font-bold font-display ${phase.color}`}>{phase.version}</span>
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

          {/* Footer */}
          <div className="text-center pt-8 pb-4">
            <p className="text-[10px] text-muted-foreground/30 font-mono">RegBridge v1.0 · Documentation</p>
          </div>
        </main>
      </div>
    </div>
  );
}
