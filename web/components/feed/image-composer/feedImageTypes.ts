export type ComposerImage = {
  id: string;
  name: string;
  originalUrl: string;
  aspectRatio: "original" | "1:1" | "4:5" | "16:9";
  scale: number;
  position: { x: number; y: number };
  naturalSize?: { width: number; height: number };
};
