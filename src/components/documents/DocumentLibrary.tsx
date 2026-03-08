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
  const [filterCategory, setFilterCategory] = useState("Toutes");
  const [sortBy, setSortBy] = useState<"date" | "nom">("date");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      if (sortBy === "nom") return a.nom_fichier.localeCompare(b.nom_fichier, "fr");
      return (b.date_ajout || "").localeCompare(a.date_ajout || "");
    });

  return (
    <>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Bibliothèque de documents
            {documents.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {documents.length}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
            >
              <option value="Toutes">Toutes les catégories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "nom")}
              className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/40 transition-colors"
            >
              <option value="date">Plus récent</option>
              <option value="nom">Nom A→Z</option>
            </select>
            <Button
              onClick={onRefresh}
              disabled={loadingDocs}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loadingDocs ? "animate-spin" : ""}`} />
              Rafraîchir
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un document…"
            className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        {loadingDocs && documents.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Aucun document indexé pour le moment.</p>
          </div>
        ) : (
          <>
            {(searchQuery || filterCategory !== "Toutes") && (
              <p className="text-xs text-muted-foreground">
                {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Aucun document trouvé.</p>
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
                    className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3"
                  >
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.nom_fichier}</p>
                      {doc.date_ajout && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(doc.date_ajout).toLocaleDateString("fr-CH", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[doc.categorie] || CATEGORY_COLORS["Autre"]}`}>
                      {doc.categorie}
                    </span>
                    <Button
                      onClick={() => setDeleteTarget(doc.nom_fichier)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer <strong>{deleteTarget}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
