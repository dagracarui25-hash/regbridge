import { useState, useEffect, useCallback } from "react";
import { AccessCodeModal } from "@/components/AccessCodeModal";
import { useDocumentAccess } from "@/hooks/useDocumentAccess";
import { getApiUrl } from "@/hooks/useApiUrl";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import { Document } from "@/components/documents/types";

interface DocumentsInternesProps {
  onError: () => void;
}

export function DocumentsInternes({ onError }: DocumentsInternesProps) {
  const { isAuthenticated, authenticate, validateSession } = useDocumentAccess();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

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
      const docs = Array.isArray(json) ? json : Array.isArray(json?.documents) ? json.documents : [];
      setDocuments(docs.map((d: any) => ({
        nom_fichier: d.filename || d.nom_fichier || "",
        categorie: d.categorie || "Autre",
        chunks: d.chunks,
        date_ajout: d.date_ajout,
      })));
    } catch {
      onError();
    } finally {
      setLoadingDocs(false);
    }
  }, [onError]);

  useEffect(() => {
    if (isAuthenticated) fetchDocuments();
  }, [isAuthenticated, fetchDocuments]);

  if (!isAuthenticated) {
    return <AccessCodeModal onAuthenticate={authenticate} />;
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start overflow-y-auto px-4 sm:px-8 lg:px-16 py-6">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <UploadZone
          validateSession={validateSession}
          onUploaded={fetchDocuments}
          onError={onError}
        />
        <DocumentLibrary
          documents={documents}
          loadingDocs={loadingDocs}
          onRefresh={fetchDocuments}
          onDeleted={(filename) => setDocuments((prev) => prev.filter((d) => d.nom_fichier !== filename))}
          validateSession={validateSession}
          onError={onError}
        />
      </div>
    </div>
  );
}
