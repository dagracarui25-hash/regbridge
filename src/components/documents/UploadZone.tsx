import { useState, useRef, DragEvent } from "react";
import { Upload, FileText, Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "@/hooks/useApiUrl";
import { CATEGORIES, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "./types";

interface UploadZoneProps {
  validateSession: () => boolean;
  onUploaded: () => void;
  onError: () => void;
}

export function UploadZone({ validateSession, onUploaded, onError }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
      onUploaded();
    } catch {
      setUploadResult({ ok: false, message: "❌ Erreur lors de l'upload du document" });
      onError();
    } finally {
      setUploading(false);
    }
  };

  return (
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
  );
}
