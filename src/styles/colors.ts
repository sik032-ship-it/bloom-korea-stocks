// PPURI Color Tokens
export const colors = {
  primary: {
    green: "#58CC02",
    greenDark: "#4CAD02",
    greenLight: "#7ED957",
  },
  background: "#FFFFFF",
  text: {
    primary: "#1A1A2E",
    secondary: "#6B7280",
    muted: "#9CA3AF",
  },
  accent: {
    daily: "#58CC02",
    earnings: "#F59E0B",
    drop: "#EF4444",
    surge: "#3B82F6",
    fomo: "#8B5CF6",
  },
  border: "#E5E7EB",
  input: "#F3F4F6",
} as const;

export type QuestionType = "daily" | "earnings" | "drop" | "surge" | "fomo";

export const questionTypeColors: Record<QuestionType, string> = {
  daily: "bg-ppuri-green text-primary-foreground",
  earnings: "bg-ppuri-amber text-primary-foreground",
  drop: "bg-ppuri-red text-primary-foreground",
  surge: "bg-ppuri-blue text-primary-foreground",
  fomo: "bg-ppuri-purple text-primary-foreground",
};

export const questionTypeLabels: Record<QuestionType, string> = {
  daily: "일상",
  earnings: "실적",
  drop: "하락",
  surge: "급등",
  fomo: "FOMO",
};
