export type AspectRatioMode = "original" | "1:1" | "4:5" | "16:9";

const ratioMap: Record<Exclude<AspectRatioMode, "original">, number> = {
  "1:1": 1,
  "4:5": 4 / 5,
  "16:9": 16 / 9
};

export function getTargetRatio({
  aspectRatio,
  aspectRatioValue,
  intrinsicRatio
}: {
  aspectRatio?: AspectRatioMode | null;
  aspectRatioValue?: number | null;
  intrinsicRatio?: number | null;
}) {
  if (aspectRatioValue) return aspectRatioValue;
  if (!aspectRatio || aspectRatio === "original") {
    return intrinsicRatio ?? 1;
  }
  return ratioMap[aspectRatio];
}

export function getFrameStyle(targetRatio: number) {
  if (!targetRatio || !Number.isFinite(targetRatio) || targetRatio <= 0) {
    return {
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      aspectRatio: "1 / 1"
    };
  }

  if (targetRatio >= 1) {
    return {
      width: "100%",
      height: "auto",
      maxWidth: "100%",
      maxHeight: "100%",
      aspectRatio: `${targetRatio}`
    };
  }

  return {
    width: "auto",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    aspectRatio: `${targetRatio}`
  };
}

export function getBoxSize({
  containerWidth,
  containerHeight,
  targetRatio
}: {
  containerWidth: number;
  containerHeight: number;
  targetRatio: number;
}) {
  if (!containerWidth || !containerHeight) {
    return { width: 0, height: 0 };
  }
  const containerRatio = containerWidth / containerHeight;
  if (containerRatio > targetRatio) {
    const boxHeight = containerHeight;
    return { width: boxHeight * targetRatio, height: boxHeight };
  }
  const boxWidth = containerWidth;
  return { width: boxWidth, height: boxWidth / targetRatio };
}

export function getContainSize({
  boxWidth,
  boxHeight,
  imageWidth,
  imageHeight
}: {
  boxWidth: number;
  boxHeight: number;
  imageWidth: number;
  imageHeight: number;
}) {
  if (!boxWidth || !boxHeight || !imageWidth || !imageHeight) {
    return { width: 0, height: 0, scale: 1 };
  }
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  return {
    width: imageWidth * scale,
    height: imageHeight * scale,
    scale
  };
}
