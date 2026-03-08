import { useState, useEffect, useCallback, useRef, DragEvent } from "react";
import { Upload, Trash2, RefreshCw, FileText, Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AccessCodeModal } from "@/components/AccessCodeModal";
import { useDocumentAccess } from "@/hooks/useDocumentAccess";
import { getApiUrl } from "@/hooks/useApiUrl";
import { motion, AnimatePresence } from "framer-motion";
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

interface Document {
  nom_fichier: string;
  categorie: string;
  chunks?: number;
  date_ajout?: string;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const CATEGORIES = [
  "Procédure interne",
  "Politique RH",
  "Contrat / Template",
  "Règlement interne",
  "Note de direction",
  "Compliance interne",
  "Autre",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Procédure interne": "bg-blue-500/20 text-blue-300",
  "Politique RH": "bg-purple-500/20 text-purple-300",
  "Contrat / Template": "bg-amber-500/20 text-amber-300",
  "Règlement interne": "bg-emerald-500/20 text-emerald-300",
  "Note de direction": "bg-rose-500/20 text-rose-300",
  "Compliance interne": "bg-cyan-500/20 text-cyan-300",
  "Autre": "bg-gray-500/20 text-gray-300",
};

interface DocumentsInternesProps {
  onError: () => void;
}

export function DocumentsInternes({ onError }: DocumentsInternesProps) {
  const { isAuthenticated, authenticate, validateSession } = useDocumentAccess();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("Toutes");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadResult({ ok: false, message: "❌ Format non supporté. Seuls les fichiers PDF sont acceptés." });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadResult({ ok: false, message: `❌ Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_FILE_SIZE_MB} Mo.` });
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(`${getApiUrl()}/documents`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("HTTP error");
      const json = await res.json();
      setDocuments(Array.isArray(json) ? json : []);
    } catch {
      onError();
    } finally {
      setLoadingDocs(false);
    }
  }, [onError]);

  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [isAuthenticated, fetchDocuments]);

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    if (!validateSession()) return;

    setUploading(true);
    setUploadProgress(10);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("categorie", category);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 90));
      }, 500);

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 60000);
      const res = await fetch(`${getApiUrl()}/upload-document`, {
        method: "POST",
        headers: { "ngrok-skip-browser-warning": "69420" },
        body: formData,
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      setUploadResult({ ok: true, message: `✅ Document indexé — ${json.chunks || 0} chunks créés` });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      fetchDocuments();
    } catch {
      setUploadResult({ ok: false, message: "❌ Erreur lors de l'upload du document" });
      onError();
    } finally {
      setUploading(false);
    }
  };

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
      setDocuments((prev) => prev.filter((d) => d.nom_fichier !== deleteTarget));
    } catch {
      onError();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (!isAuthenticated) {
    return <AccessCodeModal onAuthenticate={authenticate} />;
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start overflow-y-auto px-4 sm:px-8 lg:px-16 py-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* Upload zone */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Ajouter un document
          </h3>

          <div className="space-y-3">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 transition-all ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : selectedFile
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 hover:border-primary/30 hover:bg-secondary/30"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (f && f.size > MAX_FILE_SIZE) {
                    setUploadResult({ ok: false, message: `❌ Fichier trop volumineux (${(f.size / 1024 / 1024).toFixed(1)} Mo). Maximum : ${MAX_FILE_SIZE_MB} Mo.` });
                    setSelectedFile(null);
                  } else {
                    setSelectedFile(f);
                    setUploadResult(null);
                  }
                }}
                className="hidden"
              />
              {isDragging ? (
                <>
                  <Upload className="h-8 w-8 text-primary animate-bounce" />
                  <span className="text-sm font-medium text-primary">Déposez le fichier ici</span>
                </>
              ) : selectedFile ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">Cliquez ou glissez pour changer</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setUploadResult(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-muted/50 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                   <span className="text-sm font-medium text-muted-foreground">Glissez un PDF ici ou cliquez pour parcourir</span>
                   <span className="text-xs text-muted-foreground/60">Format : PDF — Max. {MAX_FILE_SIZE_MB} Mo</span>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="gradient-primary text-primary-foreground rounded-xl h-10 px-6"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Envoyer
            </Button>

            {uploading && (
              <Progress value={uploadProgress} className="h-2 rounded-full" />
            )}

            <AnimatePresence>
              {uploadResult && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2.5 ${
                    uploadResult.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {uploadResult.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {uploadResult.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Document library */}
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
              <Button
                onClick={fetchDocuments}
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

          {loadingDocs && documents.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Aucun document indexé pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents
                .filter((doc) => filterCategory === "Toutes" || doc.categorie === filterCategory)
                .map((doc) => (
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
        </div>
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
    </div>
  );
}
