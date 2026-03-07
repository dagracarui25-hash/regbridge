import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorBannerProps {
  visible: boolean;
  onClose: () => void;
}

export function ErrorBanner({ visible, onClose }: ErrorBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-destructive/10 border-b border-destructive/20 relative z-20"
        >
          <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-2.5 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="flex-1 text-destructive">
              ⚠️ Serveur hors ligne — Relancez le notebook Etape4b dans Google Colab et mettez à jour l'URL dans ⚙️ Paramètres.
            </p>
            <button onClick={onClose} className="text-destructive/60 hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
