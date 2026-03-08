import { useState, useRef, DragEvent } from "react";
import { Upload, FileText, Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "./types";
import { useTranslation } from "react-i18next";

interface UploadZoneProps {
  validateSession: () => boolean;
  onUploaded: () => void;
  onError: () => void;
}

export function UploadZone({ validateSession, onUploaded, onError }: UploadZoneProps) {
  const { t } = useTranslation();
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
      setUploadResult({ ok: false, message: `❌ ${t("docs.unsupportedFormat")}` });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadResult({ ok: false, message: `❌ ${t("docs.fileTooLarge", { size: (file.size / 1024 / 1024).toFixed(1), max: MAX_FILE_SIZE_MB })}` });
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
      // Convert file to base64
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 5, 85));
      }, 1000);

      const { data, error } = await supabase.functions.invoke("upload-document", {
        body: {
          file_base64: base64,
          filename: selectedFile.name,
          categorie: category,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;
      setUploadResult({ ok: true, message: `✅ ${t("docs.indexed", { count: data.chunks || 0 })}` });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch {
      setUploadResult({ ok: false, message: `❌ ${t("docs.uploadError")}` });
      onError();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 border-gradient">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 font-display">
        <Upload className="h-4 w-4 text-accent-cyan" />
        {t("docs.upload")}
      </h3>

      <div className="space-y-3">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200 ${
            isDragging
              ? "border-accent-cyan bg-accent-cyan/10 scale-[1.01] glow-cyan"
              : selectedFile
                ? "border-primary/40 bg-primary/5"
                : "border-white/[0.08] hover:border-primary/30 hover:bg-secondary/30"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f && f.size > MAX_FILE_SIZE) {
                setUploadResult({ ok: false, message: `❌ ${t("docs.fileTooLarge", { size: (f.size / 1024 / 1024).toFixed(1), max: MAX_FILE_SIZE_MB })}` });
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
              <Upload className="h-8 w-8 text-accent-cyan animate-bounce" />
              <span className="text-sm font-medium text-accent-cyan">{t("docs.dropHere")}</span>
            </>
          ) : selectedFile ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">{t("docs.clickOrDragToChange")}</span>
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
              <span className="text-sm font-medium text-muted-foreground">{t("docs.dragPdf")}</span>
              <span className="text-xs text-muted-foreground/60">{t("docs.formatPdf", { size: MAX_FILE_SIZE_MB })}</span>
            </>
          )}
        </div>

        <div>
          <label className="text-[10px] font-bold gradient-text-gold mb-1.5 block uppercase tracking-[0.12em] font-display">{t("docs.category")}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full glass-card border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/40 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`docs.categories.${c}`)}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="gradient-primary text-primary-foreground rounded-xl h-10 px-6 glow-sm hover:opacity-90 transition-all duration-200"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          {t("docs.send")}
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
                uploadResult.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
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
