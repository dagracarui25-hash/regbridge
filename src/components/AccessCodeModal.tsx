import { useState, KeyboardEvent } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessCodeModalProps {
  onAuthenticate: (code: string) => Promise<boolean>;
}

export function AccessCodeModal({ onAuthenticate }: AccessCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(false);
    const ok = await onAuthenticate(code.trim());
    if (!ok) {
      setError(true);
      setCode("");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="glass-strong rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Accès protégé</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Entrez le code d'accès pour gérer les documents internes.
          </p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="Code d'accès"
            autoFocus
            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 transition-colors"
          />
          {error && (
            <p className="text-sm text-destructive font-medium">Code incorrect</p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!code.trim() || loading}
            className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accéder"}
          </Button>
        </div>
      </div>
    </div>
  );
}
