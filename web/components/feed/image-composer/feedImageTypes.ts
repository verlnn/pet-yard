export type ComposerImage = {
  id: string;
  name: string;
  originalUrl: string;
  aspectRatio: "original" | "1:1" | "4:5" | "16:9";
  naturalSize?: { width: number; height: number };
};
