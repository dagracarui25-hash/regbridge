export interface Document {
  nom_fichier: string;
  categorie: string;
  chunks?: number;
  date_ajout?: string;
}

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const CATEGORIES = [
  "Procédure interne",
  "Politique RH",
  "Contrat / Template",
  "Règlement interne",
  "Note de direction",
  "Compliance interne",
  "Autre",
];

export const CATEGORY_COLORS: Record<string, string> = {
  "Procédure interne": "bg-blue-500/20 text-blue-300",
  "Politique RH": "bg-purple-500/20 text-purple-300",
  "Contrat / Template": "bg-amber-500/20 text-amber-300",
  "Règlement interne": "bg-emerald-500/20 text-emerald-300",
  "Note de direction": "bg-rose-500/20 text-rose-300",
  "Compliance interne": "bg-cyan-500/20 text-cyan-300",
  "Autre": "bg-gray-500/20 text-gray-300",
};
