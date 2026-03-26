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

/** Figma node 8219:21523 — uppercase subheading tracking (4.8px at 20px type). */
export const BANNER_CAPS_LETTER_SPACING = "4.8px";

/** Half of `BANNER_CAPS_LETTER_SPACING` — theme tabs, download label, etc. */
export const PAGE_CAPS_LETTER_SPACING = "2.4px";

/** Figma "Inverted v2" (8219:21520): 64px inset; clamp so tiny export sizes still layout. */
const BANNER_PAD_TARGET = 64;
const BANNER_STACK_GAP = 16;
const HEADLINE_PX = 64;
const HEADLINE_LINE_PX = 72;
const SUB_PX = 20;
const SUB_LINE_PX = 24;

export const BannerPreview = forwardRef<HTMLDivElement, BannerPreviewProps>(
  function BannerPreview(
    { width, height, theme, headline, subheading },
    ref,
  ) {
    const colors = bannerThemes[theme];
    const minDim = Math.min(width, height);
    const pad = Math.min(
      BANNER_PAD_TARGET,
      Math.max(8, Math.floor(minDim / 2) - 40),
    );

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
          gap: BANNER_STACK_GAP,
          padding: pad,
          fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: HEADLINE_PX,
            lineHeight: `${HEADLINE_LINE_PX}px`,
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: SUB_PX,
            lineHeight: `${SUB_LINE_PX}px`,
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
