import { useState, useCallback } from "react";

const STORAGE_KEY = "regbridge_api_url";
const DEFAULT_URL = "https://granolithic-belletristic-bulah.ngrok-free.dev";

export function getApiUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

export function useApiUrl() {
  const [apiUrl, setApiUrlState] = useState(getApiUrl);

  const setApiUrl = useCallback((url: string) => {
    const trimmed = url.trim().replace(/\/+$/, "");
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiUrlState(trimmed);
  }, []);

  const resetApiUrl = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, DEFAULT_URL);
    setApiUrlState(DEFAULT_URL);
  }, []);

  return { apiUrl, setApiUrl, resetApiUrl, defaultUrl: DEFAULT_URL };
}
