export type FixedPreset = {
  id: string;
  label: string;
  kind: "fixed";
  width: number;
  height: number;
};

export type RatioPreset = {
  id: string;
  label: string;
  kind: "ratio";
  ratioW: number;
  ratioH: number;
  /** Starting width when preset is applied; height is derived from ratio. */
  defaultWidth: number;
};

export type BannerPreset = FixedPreset | RatioPreset;

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "wiki",
    label: "Wiki header (1300×370)",
    kind: "fixed",
    width: 1300,
    height: 370,
  },
  {
    id: "h2_1",
    label: "Horizontal (2∶1)",
    kind: "ratio",
    ratioW: 2,
    ratioH: 1,
    defaultWidth: 1248,
  },
  {
    id: "h3_1",
    label: "Horizontal (3∶1)",
    kind: "ratio",
    ratioW: 3,
    ratioH: 1,
    defaultWidth: 1248,
  },
  {
    id: "h4_1",
    label: "Horizontal (4∶1)",
    kind: "ratio",
    ratioW: 4,
    ratioH: 1,
    defaultWidth: 1248,
  },
];

/** Not ratio-locked; defaults to the same size as Horizontal (3∶1); width and height are editable. */
export const CLEAR_PRESET_ID = "clear";

/** Fixed-size wiki banner; dimensions are not user-editable in the UI. */
export const WIKI_PRESET_ID = "wiki";

/** Horizontal 4∶1 ratio preset chip. */
export const H4_PRESET_ID = "h4_1";

export const DEFAULT_PRESET_ID = WIKI_PRESET_ID;

export const DIMENSION_LIMITS = { min: 100, max: 4096 } as const;

export function heightFromWidth(
  width: number,
  ratioW: number,
  ratioH: number,
): number {
  return Math.round((width * ratioH) / ratioW);
}

const CLEAR_SIZE_FROM_H3 = BANNER_PRESETS.find((p) => p.id === "h3_1");
if (!CLEAR_SIZE_FROM_H3 || CLEAR_SIZE_FROM_H3.kind !== "ratio") {
  throw new Error("banner-presets: h3_1 ratio preset required for No-preset default size");
}

/** Matches Horizontal (3∶1) default export; ratio-layout ref for No preset / custom. */
export const CLEAR_PRESET_REF_WIDTH = CLEAR_SIZE_FROM_H3.defaultWidth;
export const CLEAR_PRESET_REF_HEIGHT = heightFromWidth(
  CLEAR_SIZE_FROM_H3.defaultWidth,
  CLEAR_SIZE_FROM_H3.ratioW,
  CLEAR_SIZE_FROM_H3.ratioH,
);

export function widthFromHeight(
  height: number,
  ratioW: number,
  ratioH: number,
): number {
  return Math.round((height * ratioW) / ratioH);
}

export const CUSTOM_PRESET_ID = "custom";

/**
 * Padding / type at the reference export size (`ratioLayoutReferenceForPreset`).
 * Scale factor: √( (width/refW) × (height/refH) ) — equals width/refW when aspect matches the preset.
 */
/** 2∶1, 3∶1, No preset, and custom. */
export const RATIO_LAYOUT_DESIGN_2_3 = {
  padding: 96,
  headlineFont: 96,
  headlineLine: 96,
  subFont: 24,
  subLine: 32,
  stackGap: 24,
} as const;

/** 4∶1 (letterbox). */
export const RATIO_LAYOUT_DESIGN_4_1 = {
  padding: 72,
  headlineFont: 64,
  headlineLine: 64,
  subFont: 24,
  subLine: 32,
  stackGap: 16,
} as const;

export type RatioLayoutDesign =
  | typeof RATIO_LAYOUT_DESIGN_2_3
  | typeof RATIO_LAYOUT_DESIGN_4_1;

export type RatioLayoutReference = { width: number; height: number };

/** Wiki keeps legacy layout. All other presets + custom use scaled ratio type. */
export function ratioLayoutReferenceForPreset(
  presetId: string,
): RatioLayoutReference | null {
  if (presetId === WIKI_PRESET_ID) return null;
  if (presetId === CLEAR_PRESET_ID || presetId === CUSTOM_PRESET_ID) {
    return {
      width: CLEAR_PRESET_REF_WIDTH,
      height: CLEAR_PRESET_REF_HEIGHT,
    };
  }
  const p = BANNER_PRESETS.find((x) => x.id === presetId);
  if (p?.kind === "ratio") {
    return {
      width: p.defaultWidth,
      height: heightFromWidth(p.defaultWidth, p.ratioW, p.ratioH),
    };
  }
  return null;
}

/** Typography tokens for scaled layout; wiki is legacy (null). */
export function ratioLayoutDesignForPreset(presetId: string): RatioLayoutDesign | null {
  if (presetId === WIKI_PRESET_ID) return null;
  if (presetId === H4_PRESET_ID) return RATIO_LAYOUT_DESIGN_4_1;
  if (
    presetId === CLEAR_PRESET_ID ||
    presetId === CUSTOM_PRESET_ID ||
    presetId === "h2_1" ||
    presetId === "h3_1"
  ) {
    return RATIO_LAYOUT_DESIGN_2_3;
  }
  const p = BANNER_PRESETS.find((x) => x.id === presetId);
  if (p?.kind === "ratio") return RATIO_LAYOUT_DESIGN_2_3;
  return null;
}
