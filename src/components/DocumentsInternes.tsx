import { useState, useEffect, useCallback } from "react";
import { AccessCodeModal } from "@/components/AccessCodeModal";
import { useDocumentAccess } from "@/hooks/useDocumentAccess";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase.functions.invoke("list-documents");
      if (error) throw error;
      const docs = Array.isArray(data) ? data : Array.isArray(data?.documents) ? data.documents : [];
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
