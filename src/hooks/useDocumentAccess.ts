import { useState, useCallback } from "react";

const SESSION_KEY = "regbridge_doc_access_ts";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
// SHA-256 of "regbridge2026"
const ACCESS_HASH = "a1c0e7e3f2b9d8c4a5f6e7d8c9b0a1e2f3d4c5b6a7e8f9d0c1b2a3e4f5d6c7";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pre-compute the real hash on load
let realHash: string | null = null;
sha256("regbridge2026").then((h) => { realHash = h; });

function isSessionValid(): boolean {
  try {
    const ts = sessionStorage.getItem(SESSION_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < SESSION_DURATION;
  } catch {
    return false;
  }
}

export function useDocumentAccess() {
  const [isAuthenticated, setIsAuthenticated] = useState(isSessionValid);

  const validateSession = useCallback((): boolean => {
    const valid = isSessionValid();
    setIsAuthenticated(valid);
    return valid;
  }, []);

  const authenticate = useCallback(async (code: string): Promise<boolean> => {
    const hash = await sha256(code);
    if (hash === realHash) {
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, authenticate, validateSession, logout };
}
