"use client";

import { forwardRef } from "react";
import type { BannerThemeId } from "@/lib/banner-theme";
import { bannerThemes } from "@/lib/banner-theme";

export type BannerPreviewProps = {
  width: number;
  height: number;
  theme: BannerThemeId;
  headline: string;
  subheading: string;
};

/** Letter-spacing for uppercase subheading inside the exported banner only. */
export const BANNER_CAPS_LETTER_SPACING = "0.4em";

/** Letter-spacing for uppercase UI outside the banner (export line, tabs, download). */
export const PAGE_CAPS_LETTER_SPACING = "0.2em";

export const BannerPreview = forwardRef<HTMLDivElement, BannerPreviewProps>(
  function BannerPreview(
    { width, height, theme, headline, subheading },
    ref,
  ) {
    const colors = bannerThemes[theme];
    const padX = Math.round(width * 0.09);
    const padY = Math.round(height * 0.06);

    const headlinePx = Math.max(
      16,
      Math.min(
        Math.round(Math.min(width * 0.09, height * 0.2)),
        Math.round(height * 0.22),
      ),
    );
    const subPx = Math.max(10, Math.round(headlinePx * 0.28));
    const gap = Math.round(headlinePx * 0.38);

    return (
      <div
        ref={ref}
        data-banner-capture
        style={{
          width,
          height,
          boxSizing: "border-box",
          backgroundColor: colors.background,
          color: colors.foreground,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: padX,
          paddingRight: padX,
          paddingTop: padY,
          paddingBottom: padY,
          fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: headlinePx,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            margin: 0,
            marginTop: gap,
            fontWeight: 700,
            fontSize: subPx,
            lineHeight: 1.25,
            textTransform: "uppercase",
            letterSpacing: BANNER_CAPS_LETTER_SPACING,
            maxWidth: "100%",
          }}
        >
          {subheading}
        </p>
      </div>
    );
  },
);
