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
    defaultWidth: 1200,
  },
  {
    id: "h3_1",
    label: "Horizontal (3∶1)",
    kind: "ratio",
    ratioW: 3,
    ratioH: 1,
    defaultWidth: 1200,
  },
  {
    id: "h5_1",
    label: "Horizontal (5∶1)",
    kind: "ratio",
    ratioW: 5,
    ratioH: 1,
    defaultWidth: 2000,
  },
];

/** Selecting this is not a ratio/locked preset; size starts at wiki and both sides are free. */
export const CLEAR_PRESET_ID = "clear";

export const DEFAULT_PRESET_ID = "wiki";

export const DIMENSION_LIMITS = { min: 100, max: 4096 } as const;

export function heightFromWidth(
  width: number,
  ratioW: number,
  ratioH: number,
): number {
  return Math.round((width * ratioH) / ratioW);
}

export function widthFromHeight(
  height: number,
  ratioW: number,
  ratioH: number,
): number {
  return Math.round((height * ratioW) / ratioH);
}

export const CUSTOM_PRESET_ID = "custom";
