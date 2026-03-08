import { useState } from "react";
import { Trash2, RefreshCw, FileText, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getApiUrl } from "@/hooks/useApiUrl";
import { Document, CATEGORIES, CATEGORY_COLORS } from "./types";
import { useTranslation } from "react-i18next";

interface DocumentLibraryProps {
  documents: Document[];
  loadingDocs: boolean;
  onRefresh: () => void;
  onDeleted: (filename: string) => void;
  validateSession: () => boolean;
  onError: () => void;
}

export function DocumentLibrary({
  documents,
  loadingDocs,
  onRefresh,
  onDeleted,
  validateSession,
  onError,
}: DocumentLibraryProps) {
  const { t, i18n } = useTranslation();
  const [filterCategory, setFilterCategory] = useState("Toutes");
  const [sortBy, setSortBy] = useState<"date" | "nom">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dateLocale = i18n.language === "fr" ? "fr-CH" : i18n.language === "de" ? "de-CH" : i18n.language === "it" ? "it-CH" : "en-GB";

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    if (!validateSession()) { setDeleteTarget(null); return; }

    setDeleting(true);
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(`${getApiUrl()}/documents/${encodeURIComponent(deleteTarget)}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "69420" },
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("Delete failed");
      onDeleted(deleteTarget);
    } catch {
      onError();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = documents
    .filter((doc) => filterCategory === "Toutes" || doc.categorie === filterCategory)
    .filter((doc) => !searchQuery || doc.nom_fichier.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "nom") return a.nom_fichier.localeCompare(b.nom_fichier, i18n.language);
      return (b.date_ajout || "").localeCompare(a.date_ajout || "");
    });

  return (
    <>
      <div className="glass-card rounded-2xl p-6 space-y-4 border-gradient">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-display">
            <FileText className="h-4 w-4 text-accent-cyan" />
            {t("docs.library")}
            {documents.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono">
                {documents.length}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="glass-card border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
            >
              <option value="Toutes">{t("docs.allCategories")}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`docs.categories.${c}`)}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "nom")}
              className="glass-card border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
            >
              <option value="date">{t("docs.mostRecent")}</option>
              <option value="nom">{t("docs.nameAZ")}</option>
            </select>
            <Button
              onClick={onRefresh}
              disabled={loadingDocs}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loadingDocs ? "animate-spin" : ""}`} />
              {t("docs.refresh")}
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("docs.search")}
            className="w-full glass-card border border-white/[0.06] rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:glow-input-focus transition-all duration-200"
          />
        </div>

        {loadingDocs && documents.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 text-accent-cyan animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{t("docs.empty")}</p>
          </div>
        ) : (
          <>
            {(searchQuery || filterCategory !== "Toutes") && (
              <p className="text-xs text-muted-foreground font-mono">
                {t("docs.resultsCount", { count: filtered.length })}
              </p>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">{t("docs.noResults")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((doc) => (
                  <motion.div
                    key={doc.nom_fichier}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 hover:bg-primary/5 transition-colors duration-150 group"
                  >
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate font-mono">{doc.nom_fichier}</p>
                      {doc.date_ajout && (
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-mono">
                          {new Date(doc.date_ajout).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[doc.categorie] || CATEGORY_COLORS["Autre"]}`}>
                      {t(`docs.categories.${doc.categorie}`)}
                    </span>
                    <Button
                      onClick={() => setDeleteTarget(doc.nom_fichier)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="glass-strong border border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-display">{t("docs.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription dangerouslySetInnerHTML={{ __html: t("docs.deleteConfirmDesc", { name: deleteTarget }) }} />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl glass-card border-white/[0.06]">{t("docs.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("docs.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
