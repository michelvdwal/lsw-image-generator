export const LSW_BLUE = "#27348B";
export const CLOUD_WHITE = "#F4F4F4";
export const TRAFFIC_WHITE = "#FFFFFF";

export type BannerThemeId = "cloud" | "blue";

export const bannerThemes: Record<
  BannerThemeId,
  { label: string; background: string; foreground: string }
> = {
  cloud: {
    label: "Cloud white",
    background: CLOUD_WHITE,
    foreground: LSW_BLUE,
  },
  blue: {
    label: "LSW blue",
    background: LSW_BLUE,
    foreground: TRAFFIC_WHITE,
  },
};
